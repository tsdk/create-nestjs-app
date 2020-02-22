#!/usr/bin/env node
/* eslint-disable no-console */

const commander = require('commander');
const chalk = require('chalk');
const validateProjectName = require('validate-npm-package-name');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const cfg = require('./package.json');

let projectName;

const program = new commander.Command(cfg.name);
program
  .version(cfg.version, '-V, --version', 'output the current version')
  .arguments('<project-directory>')
  .usage(`${chalk.green('<project-directory>')} [options]`)
  .action(name => {
    projectName = name;
  })
  .option('-d, --debug', 'output extra debugging')
  .option('-t, --template <nest-myapp>', 'choose template', 'nest-myapp')
  // .option('-l, --language <typescript>', 'choose language', 'typescript')
  .allowUnknownOption()
  .on('--help', () => {
    console.log('');
    console.log('Examples:');
    console.log(`  $ ${cfg.name} --help`);
    console.log(`  $ ${cfg.name} my-nest-app`);
    console.log('');
  })
  .parse(process.argv);

if (program.debug) console.log(program.opts());
if (typeof projectName === 'undefined') {
  console.log();
  console.error('Please specify the project directory:');
  console.log(
    `  ${chalk.cyan(program.name())} ${chalk.green('<project-directory>')}`
  );
  console.log();
  console.log('For example:');
  console.log(`  ${chalk.cyan(program.name())} ${chalk.green('my-nest-app')}`);
  console.log();
  console.log(
    `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
  );
  console.log();
  process.exit(1);
}

function checkAppName(appName) {
  const validationResult = validateProjectName(appName);
  if (!validationResult.validForNewPackages) {
    console.log();
    console.error(
      chalk.red(
        `Cannot create a project named ${chalk.green(
          `"${appName}"`
        )} because of npm naming restrictions:\n`
      )
    );
    [
      ...(validationResult.errors || []),
      ...(validationResult.warnings || []),
    ].forEach(error => {
      console.error(chalk.red(`  * ${error}`));
    });
    console.error(chalk.red('\nPlease choose a different project name.'));
    console.log();
    process.exit(1);
  }
}
checkAppName(projectName);

function updateAppName(name, cb) {
  const file = path.join(name, 'package.json');
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      return console.error(`\nstderr: ${err}\n`);
    }
    const result = data
      .replace(/"name":\s".*"/g, `"name": "${name}"`)
      .replace(/"version":\s".*"/g, `"version": "0.0.1"`);

    fs.writeFile(file, result, 'utf8', stderr => {
      if (stderr) return console.error(`\nstderr: ${stderr}\n`);
      return cb();
    });
    return true;
  });
}

function create(name, options) {
  const template = `${options.template}-template`;
  const cmd = `npm pack ${template} &&  tar -zxf *.tgz && mv package ${name} && rm -rf *.tgz`;
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      if (options.debug) throw error;
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
    }

    if (stdout) {
      updateAppName(name, () => {
        console.log(
          `\n${chalk.green(`${name} created!`)}\ncd ${name} && npm install\n`
        );
      });
    } else {
      console.log(`\n${chalk.red('network error!')}\nPlease retry later\n`);
    }
  });
}
create(projectName, program);
