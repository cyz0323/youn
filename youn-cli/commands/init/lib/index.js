'use strict';

/**
 * projectName 项目名称
 * cmdObj 是否强制生成*/
function init(projectName, cmdObj) {
  console.log('init', projectName, cmdObj.force);
}

module.exports = init;