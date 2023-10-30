#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { Command } = require('commander');

require('colors');

const Renderers = ['@skyline', '@webview', '@S', '@W'];

const commander = new Command();

/**
 * 这里使用argument而不是option是怕npm吃掉参数
 * 使用--前缀会被npm吃掉，所以这里用了@
 */
commander
  .argument('[renderer]', 'set miniprogram renderer', '@skyline')
  .action(function (renderer) {
    if (renderer.startsWith('@') && !Renderers.includes(renderer)) {
      return void console.log(
        'run dev'.white,
        'ERR!'.red,
        'invalid renderer mode'.white,
        `\nstandard arguments: ${Renderers.join(' ')}`.grey
      );
    }
    const template =
      renderer === '@skyline' || renderer === '@S'
        ? path.join(process.cwd(), '/tmpls/mnp.skyline.app.tpl.json')
        : path.join(process.cwd(), '/tmpls/mnp.webview.app.tpl.json');

    fs.writeFileSync(path.join(process.cwd(), '/dev/app.json'), fs.readFileSync(template));

    execSync('cross-env NODE_ENV=development gulp dev', { stdio: 'inherit' });
  })
  .parse(process.argv);
