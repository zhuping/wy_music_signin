/**
 * Created by kevin on 15-7-19.
 */

var crypto = require('crypto');
var bigInt = require('big-integer');

function addPadding(encText, modulus) {
  var ml = modulus.length;
  for (i = 0; ml > 0 && modulus[i] == '0'; i++) ml--;
  var num = ml - encText.length,
    prefix = '';
  for (var i = 0; i < num; i++) {
    prefix += '0';
  }
  return prefix + encText;
}


function aesEncrypt(secKey, text) {
  var cipher = crypto.createCipheriv('AES-128-CBC', secKey, '0102030405060708');
  return cipher.update(text, 'utf-8', 'base64') + cipher.final('base64');
}

/**
 * RSA Encryption algorithm.
 * @param text {string} - raw data to encrypt
 * @param exponent {string} - public exponent
 * @param modulus {string} - modulus
 * @returns {string} - encrypted data: reverseText^pubKey%modulus
 */
function rsaEncrypt(text, exponent, modulus) {
  var rText = '',
    radix = 16;
  for (var i = text.length - 1; i >= 0; i--) rText += text[i]; //reverse text
  var biText = bigInt(Buffer.from(rText).toString('hex'), radix),
    biEx = bigInt(exponent, radix),
    biMod = bigInt(modulus, radix),
    biRet = biText.modPow(biEx, biMod);
  return addPadding(biRet.toString(radix), modulus);
}

function createSecretKey(size) {
  var keys = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var key = "";
  for (var i = 0; i < size; i++) {
    var pos = Math.random() * keys.length;
    pos = Math.floor(pos);
    key = key + keys.charAt(pos)
  }
  return key;
}
var modulus = '00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbda92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe4875d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7';
var nonce = '0CoJUm6Qyw8W8jud';
var pubKey = '010001';
var Crypto = {
  MD5: function(text) {
    return crypto.createHash('md5').update(text).digest('hex');
  },
  aesRsaEncrypt: function(text) {
    var secKey = createSecretKey(16);
    return {
      params: aesEncrypt('TA3YiYCfY2dDJQgg', aesEncrypt('0CoJUm6Qyw8W8jud', text)),
      // params: aesEncrypt(aesEncrypt(text, nonce), secKey),
      encSecKey: '84ca47bca10bad09a6b04c5c927ef077d9b9f1e37098aa3eac6ea70eb59df0aa28b691b7e75e4f1f9831754919ea784c8f74fbfadf2898b0be17849fd656060162857830e241aba44991601f137624094c114ea8d17bce815b0cd4e5b8e2fbaba978c6d1d14dc3d1faf852bdd28818031ccdaaa13a6018e1024e2aae98844210'
      // encSecKey: rsaEncrypt(secKey, pubKey, modulus)
    }
  }
};
module.exports = Crypto;