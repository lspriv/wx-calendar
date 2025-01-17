#!/usr/bin/env node
/**
 * 私下快速发预览包用
 */
const path = require('path');
const { execSync } = require('child_process');
const { Command } = require('commander');
const { select } = require('@inquirer/prompts');
const ora = require('ora');

require('colors');

const Semantics = ['@major', '@minor', '@patch', '@prerelease'];
const Preids = ['@alpha', '@beta', '@rc'];

/**
 * 校验参数
 * @param {string} arg 参数名
 * @param {string[]} range 有效值
 * @returns {(value: string) => void}
 */
const validArgument = (arg, range) => value => {
  if (value && value.startsWith('@') && !range.includes(value)) {
    throw new TypeError(
      'calendar publish'.white +
        ' ERR!'.red +
        ` invalid ${arg} argument`.white +
        `\nstandard arguments: ${range.join(' ')}`.grey
    );
  }
};

const validSemantic = validArgument('semantic', Semantics);

const validPreid = validArgument('preid', Preids);

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
        choices: [...choices, { name: 'no', value: null }]
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

    semantic = preid
      ? semantic === 'prerelease'
        ? semantic
        : `pre${semantic}`
      : semantic === 'prerelease'
        ? 'patch'
        : semantic;
    const preidArg = preid ? ` -preid ${preid}` : '';
    const command = `npm version ${semantic}${preidArg} --no-git-tag-version`;

    try {
      execSync(command);
      preid && execSync('npm publish --access public', { stdio: 'inherit' });
    } catch (error) {
      execSync('git checkout -- package.json');
      throw error;
    }

    const version = require(path.join(process.cwd(), '/package.json')).version;

    spinner.start(`git pushing v${version} ...`);
    try {
      execSync('git add package.json');
      execSync(`git commit -m "build(package): version ${version}"`);
      execSync('git push origin HEAD');
    } catch (error) {
      spinner.fail(error.message);
      throw error;
    }
    spinner.succeed('git push success');
  })
  .parse(process.argv);
