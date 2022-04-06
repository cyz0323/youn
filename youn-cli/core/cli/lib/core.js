'use strict';

module.exports = core;

const semver = require('semver');
const colors = require('colors/safe');
const userHome = require('user-home');
const pathExists = require('path-exists').sync;
const { Command } = require('commander');

const path = require('path');

const pkg = require('../package.json');
const log = require('@youn-cli/log');
const consts = require('./const');

let args;
const program = new Command();
function core() {
  try{
    // 脚手架版本
    checkPkgVersion();
    // node 版本检查
    checkNodeVersion();
    // 检查root
    checkRoot();
    // 操作用户主目录
    checkUserHome();
    // 入参检查
    // checkInputArgs();
    // 环境变量、命令参数变量
    checkEnv();
    // 检查是否需要全局更新, 版本号检查
    checkGlobalUpdate();
    // 命令注册
    registerCommand();
  } catch (e) {
    log.error(e.message);
  }

}

// 指令注册
function registerCommand(){
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d, --debug', '是否开启调试模式', false)

  program.on('option:debug', function(){
    if(program.debug){
      process.env.LOG_LEVEL = 'verbose';
    } else {
      process.env.LOG_LEVEL = 'info';
    }
    log.level = process.env.LOG_LEVEL;
    log.verbose('test');
  })
  program.parse(process.argv);
}


async function checkGlobalUpdate() {
  // 获取最新版本号，和模块名
  const currentVersion = pkg.version;
  const npmName = pkg.name;
  // 调用npm api，获取所有版本号
  const { getNpmSemverVersion } = require('@youn-cli/get-npm-info');
  const lastVersion = await getNpmSemverVersion(currentVersion, npmName);
  if(lastVersion && semver.gte(lastVersion, currentVersion)){
    // 存在新的版本
    log.warn(colors.yellow(`
        请手动更新 ${npmName}, 当前版本：${currentVersion}, 最新版本：${lastVersion}；
        更新命令：npm install -g ${npmName}
    `))
  }
}

function checkEnv() {
  const dotenv = require('dotenv');
  const dotenvPath = path.resolve(userHome, '.env');
  let config;
  if(pathExists(dotenvPath)){
    config = dotenv.config({
      path: path.resolve(userHome, '.env')
    })
  }
  createDefaultConfig();
  log.verbose("环境变量："+JSON.stringify(config), "   配置变量："+process.env.CLI_HOME_PATH);
}
function createDefaultConfig(){
  const cliconfig = {
    home: userHome,
  }
  if(process.env.CLI_HOME) {
    cliconfig['clihome'] = path.join(userHome, process.env.CLI_HOME);
  } else {
    cliconfig['clihome'] = path.join(userHome, consts.DEFAULT_CLI_HOME);
  }
  process.env.CLI_HOME_PATH = cliconfig.clihome;
}

function checkInputArgs () {
  const minimist = require('minimist');
  args = minimist(process.argv.slice(2))
  // console.log(args);
  function checkArgs () {
    if(args.debug){
      process.env.LOG_LEVEL = 'verbose';
    } else {
      process.env.LOG_LEVEL = 'info';
    }
    log.level = process.env.LOG_LEVEL;
  }
  checkArgs();
}

function checkUserHome () {
  if(!userHome || !pathExists(userHome)){
    throw new Error(colors.red("当前用户主目录不存在！"));
  }
}

function checkRoot() {
  // console.log(process.geteuid());
  // require('root-check')();
}

function checkNodeVersion () {
  const currentVersion = process.version;
  const lowestVersion = consts.LOWEST_NODE_VERSION;
  if(!semver.gte(currentVersion, lowestVersion)){
    throw new Error(colors.red(`youn-cli 需要安装 ${lowestVersion} 以上版本 Node`))
  }
}

// 打印版本号
function checkPkgVersion () {
  log.notice('cli', pkg.version)
}
