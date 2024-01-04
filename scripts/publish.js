#!/usr/bin/env node
/**
 * 主要是私下快速发预览包用
 * 也可以发稳定包，但这最好是master分支触发action来控制，已配置workflow
 */
const path = require('path');
const { execSync } = require('child_process');
const { Command } = require('commander');
const { select } = require('@inquirer/prompts');
const ora = require('ora');

require('colors');

const Semantics = ['@major', '@minor', '@patch'];
const Preids = ['@alpha', '@beta'];

const validSemantic = semantic => {
  if (semantic && semantic.startsWith('@') && !Semantics.includes(semantic)) {
    throw new TypeError(
      'calendar publish'.white +
        ' ERR!'.red +
        ' invalid semantic argument'.white +
        `\nstandard arguments: ${Semantics.join(' ')}`.grey
    );
  }
};

const validPreid = preid => {
  if (preid && preid.startsWith('@') && !Preids.includes(preid)) {
    throw new TypeError(
      'calendar publish'.white +
        ' ERR!'.red +
        ' invalid preid argument'.white +
        `\nstandard arguments: ${Preids.join(' ')}`.grey
    );
  }
};

const getArg = arg => (arg ? arg.replace(/^@(.*)/, '$1') : null);

const commander = new Command();

commander
  .version('0.0.1')
  .argument('[semantic]', 'set semantic version')
  .argument('[preid]', 'set prerelease preid')
  .action(async function (semantic, preid) {
    validSemantic(semantic);
    validPreid(preid);
    const spinner = ora('calendar building');
    semantic = getArg(semantic);
    preid = getArg(preid);

    if (!semantic) {
      semantic = await select({
        message: 'set semantic version',
        choices: Semantics.map(item => {
          const s = getArg(item);
          return { name: s, value: s };
        })
      });
    }

    if (!preid) {
      const choices = Preids.map(item => {
        const s = getArg(item);
        return { name: s, value: s };
      });
      preid = await select({
        message: 'set prerelease preid?',
        choices: [...choices, { name: 'no', value: void 0 }]
      });
    }

    spinner.start('building...');
    try {
      execSync('npm run build');
    } catch (error) {
      spinner.fail(error.message);
      throw error;
    }
    spinner.succeed('build success');

    semantic = preid ? (semantic === 'prerelease' ? semantic : `pre${semantic}`) : semantic;
    let versionCommand = `npm version ${semantic}`;
    preid && (versionCommand += ` -preid ${preid}`);
    versionCommand += ' --no-git-tag-version';

    try {
      execSync(versionCommand);
    } catch (error) {
      console.log('npm version'.white, 'ERR!'.red, error.message.white);
      throw error;
    }

    execSync('npm publish --access public', { stdio: 'inherit' });

    const version = require(path.join(process.cwd(), '/package.json')).version;

    spinner.start('git pushing...');
    try {
      execSync('git add .');
      execSync(`git commit -m "build(package): version ${version}"`);
      execSync('git push origin HEAD');
    } catch (error) {
      spinner.fail(error.message);
      throw error;
    }
    spinner.succeed('git push success');
  })
  .parse(process.argv);
