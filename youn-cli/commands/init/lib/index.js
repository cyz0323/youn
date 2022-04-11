'use strict';

const Command = require('@youn-cli/command');
const log = require("@youn-cli/log")

class InitCommand extends Command {
  constructor(props) {
    super(props);
  }

  init (){
    this.projectName = this._argv[0] || '';
    this.force = !!this._cmd.force;
    log.verbose("projectName", this.projectName);
    log.verbose("force", this.force);
  }

  exec() {
    console.log("init 实现逻辑");
  }
}

/**
 * projectName 项目名称
 * cmdObj 是否强制生成*/
function init(argv) {
  if(argv){
    return new InitCommand(argv);
  }
}

module.exports.InitCommand = InitCommand;
module.exports = init;