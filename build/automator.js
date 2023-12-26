const path = require('path');
const automator = require('miniprogram-automator');
const { cliPath } = require('./config');
const { terminalTime, capitalize } = require('./utils');

const automatorLogPrefix = () => '[' + `${terminalTime()} Automator`.grey + ']';
const automatorLogInfo = (label, info) => `${capitalize(label)} `.gray + `${info} `.grey;

module.exports = () => {
  /**
   * INFO: 小程序要开启安全设置服务端口，设置->安全设置->服务端口
   */
  automator
    .launch({
      ...(cliPath && { cliPath }),
      projectPath: path.resolve(process.cwd(), 'dev'),
      timeout: 30000
    })
    .then(async miniProgram => {
      console.log(automatorLogPrefix(), 'Started', '微信开发者工具已启动...'.grey);
      const systemInfo = await miniProgram.systemInfo();
      console.log(
        automatorLogPrefix(),
        'System',
        `${systemInfo.system} `.grey,
        automatorLogInfo('version', systemInfo.version),
        automatorLogInfo('SDKVersion', systemInfo.SDKVersion)
      );
    })
    .catch(err => {
      console.log(automatorLogPrefix(), 'Warning'.yellow, err.message.grey);
      console.log(
        '1. 请检查是否安装了微信开发者工具，如果不是默认安装路径，需要配置'.grey +
          'build/config.js'.blue +
          '里的cli安装路径cliPath'.grey,
        '\n2. Automator自动化需要开启小程序服务端口，请尝试开启'.grey + '微信开发者工具'.green,
        '设置->安全设置->服务端口，然后重新运行 `npm run dev`'.grey,
        '\n3. 当然你也可以手动启动微信开发者工具，然后在开发者工具中打开项目根目录下的'.grey +
          'dev'.blue +
          '目录即可'.grey
      );
    });
};
