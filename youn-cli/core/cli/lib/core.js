'use strict';

module.exports = core;

const semver = require('semver');
const colors = require('colors/safe');
const userHome = require('user-home');
const pathExists = require('path-exists').sync;


const pkg = require('../package.json');
const log = require('@youn-cli/log');
const consts = require('./const');
const minimist = require("minimist");

let args;

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
    checkInputArgs();
  } catch (e) {
    log.error(e.message);
  }

}

function checkInputArgs () {
  const minimist = require('minimist');
  args = minimist(process.argv.slice(2))
  // console.log(args);
  checkArgs();
}

function checkArgs () {
  if(args.debug){
    process.env.LOG_LEVEL = 'verbose';
  } else {
    process.env.LOG_LEVEL = 'info';
  }
  log.level = process.env.LOG_LEVEL;
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
