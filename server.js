var fs = require('fs');
var CronJob = require('cron').CronJob;
var request = require('superagent');
var crypto = require('./crypto');
var Console = require('console').Console;
var output = fs.createWriteStream('./stdout.log');
var logger = new Console(output);

var [ phone, password ] = process.argv.slice(2);

console.log(`Your phone is:`, phone);
console.log(`Your password is:`, password);

var csrf;
var cookie;
var PHONE = phone;
var PASSWORD = password;
var header = {
  'Accept': '*/*',
  'Accept-Encoding': 'gzip,deflate,sdch',
  'Accept-Language': 'zh-CN,en-US;q=0.7,en;q=0.3',
  'Connection': 'keep-alive',
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  'Host': 'music.163.com',
  'Referer': 'https://music.163.com/',
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
  "Cookie": "os=pc; osver=Microsoft-Windows-10-Professional-build-10586-64bit; appver=2.0.3.131777; "
}

var header2 = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
  "Referer": "https://music.163.com/",
  "Accept-Encoding": "gzip, deflate",
}

var httpRequest = function(method, url, data, header, callback) {
  var ret;
  if (method == 'post') {
    ret = request.post(url).send(data);
  } else {
    ret = request.get(url).query(data);
  }
  if (cookie) ret.set('Cookie', cookie);
  ret.set(header).timeout(10000).end(callback);
}

function login(username, password, callback) {
  var body = {
    password: crypto.MD5(password),
    rememberLogin: 'true',
    phone: username
  };
  var encBody = crypto.aesRsaEncrypt(JSON.stringify(body));
  var url = 'https://music.163.com/weapi/login/cellphone';

  httpRequest('post', url, encBody, header, function(err, res) {
    if (err) {
      callback({
        msg: '[login]http error ' + err
      });
      return;
    }
    var data = JSON.parse(res.text);
    if (data.code != 200) {
      //登录失败
      callback({
        msg: "[login]username or password incorrect"
      });
    } else {
      cookie = res.header['set-cookie'];
      cookie.forEach(function(ck) {
        if (ck.indexOf('__csrf') > -1) {
          csrf = (ck.match(/__csrf=[^;]+/)[0]) && ck.match(/__csrf=[^;]+/)[0].split('=')[1];
        }
      })
      callback();
    }
  });
}

function sign(callback) {
  var count = 1;

  while (count >= 0) {
    var body = {
      type: count
    };
    var encBody = crypto.aesRsaEncrypt(JSON.stringify(body));
    var url = 'https://music.163.com/weapi/point/dailyTask?csrf_token=' + csrf;

    httpRequest('post', url, encBody, header2, function(err, res) {
      if (err) {
        callback({
          msg: 'sign in error.'
        });
        return;
      }
      var data = JSON.parse(res.text);
      logger.log(data);
    });
    count--;
  }
}

new CronJob('00 30 11 * * 0-6', function() {
  logger.log('============ %s ===========', new Date());
  login(PHONE, PASSWORD, function(error) {
    if (error) {
      logger.log(error.msg);
      return;
    }
    sign(function(error, data) {
      if (error) {
        logger.log(error.msg);
        return;
      }
    });
  });
}, function() {
  logger.log('something goes error.');
}, true, 'Asia/Shanghai');

console.log('start sign cron');