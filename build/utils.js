module.exports.terminalTime = () => {
  const date = new Date();
  const hours = date.getHours();
  const minites = date.getMinutes();
  const seconds = date.getSeconds();
  const h = hours < 10 ? `0${hours}` : hours;
  const m = minites < 10 ? `0${minites}` : minites;
  const s = seconds < 10 ? `0${seconds}` : seconds;
  return `${h}:${m}:${s}`;
};

/**
 * 首字母大写
 * @param {string} str 待处理字符串
 */
module.exports.capitalize = str => str.replace(/^[a-z]/, L => L.toUpperCase());
