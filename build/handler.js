/*
 * @Description: Description
 * @Author: lishen
 * @LastEditTime: 2024-02-08 20:50:57
 */
const through2 = require('through2');
const { time, capitalize } = require('./utils');

module.exports.wxss = function () {
  return through2.obj(function (chuck, _, callback) {
    if (chuck.isBuffer()) {
      const contents = chuck.contents.toString('utf8');
      const chunkContents = contents.replace('@charset "UTF-8";\n', '');
      chuck.contents = Buffer.from(chunkContents, 'utf8');
      // 处理bom头
      if (chuck.contents[0] === 0xef && chuck.contents[1] === 0xbb && chuck.contents[2] === 0xbf) {
        chuck.contents = chuck.contents.slice(3);
      }
    }
    chuck.extname = '.wxss';
    this.push(chuck);
    callback();
  });
};

module.exports.wxml = function () {};

/**
 * @param {string} name 错误名
 */
module.exports.errorLogger = name => {
  /** @param {Error} error 错误信息 */
  return function (error) {
    console.log(time(capitalize(name)), 'Error'.red, error.message.grey);
    this.emit('end');
  };
};
