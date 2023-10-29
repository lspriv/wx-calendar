#!/usr/bin/env node
/**
 * 主要是私下快速发预览包用
 */

const { execSync } = require('child_process');
const { Command } = require('commander');
const { select } = require('@inquirer/prompts');
const ora = require('ora');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const colors = require('colors');

const Semantics = ['@major', '@minor', '@patch', '@pre'];
const Preids = ['@alpha', '@beta'];

const validSemantic = semantic => {
  if (semantic && semantic.startsWith('@') && !Semantics.includes(semantic)) {
    console.log(
      'calendar publish'.white,
      'ERR!'.red,
      'invalid semantic argument'.white,
      `\nstandard arguments: ${Semantics.join(' ')}`.grey
    );
    return false;
  }
  return true;
};

const validPreid = preid => {
  if (preid && preid.startsWith('@') && !Preids.includes(preid)) {
    console.log(
      'calendar publish'.white,
      'ERR!'.red,
      'invalid preid argument'.white,
      `\nstandard arguments: ${Preids.join(' ')}`.grey
    );
    return false;
  }
  return true;
};

const getArg = arg => (arg ? arg.replace(/^@(.*)/, '$1') : null);

const commander = new Command();

commander
  .version('0.0.1')
  .argument('[semantic]', 'set semantic version')
  .argument('[preid]', 'set prerelease preid')
  .action(async function (semantic, preid) {
    if (validSemantic(semantic) && validPreid(preid)) {
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

      if (!preid && semantic !== 'pre') {
        preid = await select({
          message: 'set prerelease preid',
          choices: Preids.map(item => {
            const s = getArg(item);
            return { name: s, value: s };
          })
        });
      } else if (semantic === 'pre') {
        preid = void 0;
      }

      spinner.start('building...');
      try {
        execSync('npm run build', { stdio: 'inherit' });
      } catch (error) {
        spinner.fail(error.message);
        throw error;
      }
      spinner.succeed('build success');

      semantic = semantic === 'pre' ? (preid ? 'release' : 'prerelease') : semantic;
      let versionCommand = preid ? `npm version pre${semantic} -preid ${preid}` : `npm version ${semantic}`;
      versionCommand += ' -m "build: version %s" --no-git-tag-version';

      try {
        execSync(versionCommand, { stdio: 'inherit' });
      } catch (error) {
        console.log('npm version'.white, 'ERR!'.red, error.message.white);
        throw error;
      }

      execSync('npm publis --access public', { stdio: 'inherit' });
    }
  })
  .parse(process.argv);
