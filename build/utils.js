/*
 * Copyright 2024 lspriv. All Rights Reserved.
 * Distributed under MIT license.
 * See File LICENSE for detail or copy at https://opensource.org/licenses/MIT
 * @Description: Description
 * @Author: lspriv
 * @LastEditTime: 2024-02-08 21:25:59
 */
const padding = number => (number < 10 ? `0${number}` : number);

/**
 * 获取当前时间
 */
const now = () => {
  const date = new Date();
  return `${padding(date.getHours())}:${padding(date.getMinutes())}:${padding(date.getSeconds())}`;
};
module.exports.now = now;

/**
 * 首字母大写
 * @param {string} str 待处理字符串
 */
const capitalize = str => str.replace(/^[a-z]/, L => L.toUpperCase());
module.exports.capitalize = capitalize;

/**
 * 获取时间
 * @param {string} label
 */
module.exports.time = label => '[' + `${now()}${label ? ` ${label}` : ''}`.grey + ']';
module.exports.log = (label, info) => `${capitalize(label)} `.gray + `${info} `.grey;

module.exports.wait = ms => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};
