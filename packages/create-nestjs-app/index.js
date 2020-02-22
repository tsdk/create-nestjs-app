#!/usr/bin/env node

const commander = require('commander');
const chalk = require('chalk');
const { exec } = require('child_process');
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

function create(name, options) {
  const template = `${options.template}-template`;
  const cmd = `npm pack ${template} &&  tar -zxf *.tgz && mv package ${name} && rm -rf *.tgz`;
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      if (options.debug) throw error;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
}
create(projectName, program);
