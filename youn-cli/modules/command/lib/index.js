'use strict';

const semver = require('semver');
const colors = require('colors/safe');

const log = require('@youn-cli/log');
const LOWEST_NODE_VERSION = '12.22.7';

class Command {
  constructor(props){
    if(!props){
      throw new Error("Command 参数不能为空！");
    }
    if(!Array.isArray(props)){
      throw new Error("Command 参数必须为对象！");
    }
    if(props.length < 1){
      throw new Error("Command 参数列表不能为空！")
    }
    this._argv = props;

    let chain = Promise.resolve();
    // 版本检查
    chain = chain.then(() => this.checkNodeVersion())
    // 初始化参数
    chain = chain.then(() => this.initArgs())
    chain = chain.then(() => this.init())
    chain = chain.then(() => this.exec())
    chain.catch(err => {
      log.error(err.message);
    })
  }

  init() {
    throw new Error("init 必须实现")
  }

  exec() {
    throw new Error("exec 必须实现")
  }

  // 初始化参数
  initArgs(){
    this._cmd = this._argv[this._argv.length - 1];
    this._argv = this._argv.slice(0, this._argv.length - 1);
  }

  // node 版本检查
  checkNodeVersion(){
    const currentVersion = process.version;
    const lowestVersion = LOWEST_NODE_VERSION;
    if(!semver.gte(currentVersion, lowestVersion)){
      throw new Error(colors.red(`youn-cli 需要安装 ${lowestVersion} 以上版本 Node`))
    }
  }
}

module.exports = Command;
