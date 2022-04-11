'use strict';

const path = require('path');

module.exports = function formatPath(p){
  if(p){
    // 路径兼容
    const sep = path.sep;
    if(sep === '/'){
      return p;
    } else {
      return p.replace(/\\/g, '/');
    }
  }
  return p;
};