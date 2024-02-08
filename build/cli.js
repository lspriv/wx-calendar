/*
 * Copyright 2024 lspriv. All Rights Reserved.
 * Distributed under MIT license.
 * See File LICENSE for detail or copy at https://opensource.org/licenses/MIT
 * @Description: Description
 * @Author: lspriv
 * @LastEditTime: 2024-02-08 22:00:43
 */
// const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const { CLI_PATH, PRJ_PATH, STDIO_IGNORE } = require('./config');
const { time, log } = require('./utils');

const platform = os.platform();

const cliPath =
  CLI_PATH ||
  (platform === 'darwin'
    ? '/Applications/wechatwebdevtools.app/Contents/MacOS/cli'
    : platform === 'win32'
      ? 'C:/Program Files (x86)/Tencent/微信web开发者工具/cli.bat'
      : CLI_PATH);

const cli = (command, withPrj = false, options = void 0) => {
  options = { ...options, encoding: 'utf-8' };
  const result = execSync(`${cliPath} ${command}${withPrj ? ` --project ${PRJ_PATH}` : ''}`, options);
  return result && JSON.parse(result);
};

module.exports.cli = cli;

module.exports.task = () => {
  try {
    execSync(`${cliPath} -h`, STDIO_IGNORE);
  } catch (err) {
    console.log(time(), 'Warning'.yellow, '请配置正确的微信开发工具cli路径'.grey);
    console.log(
      '1.请检查是否安装了微信开发者工具，如果不是默认安装路径，需要配置'.grey +
        'build/config.js'.blue +
        '里的cli安装路径cliPath'.grey,
      '\n2. Automator自动化需要开启小程序服务端口，请尝试开启'.grey + '微信开发者工具'.green,
      '设置->安全设置->服务端口，然后重新运行 `npm run dev`'.grey
    );
    return;
  }

  try {
    cli('open', true, STDIO_IGNORE);
    console.log(time(), log('微信开发者工具', '已启动'));
  } catch (e) {
    console.log(time(), 'Warning'.yellow, e.message.grey);
  }
};
