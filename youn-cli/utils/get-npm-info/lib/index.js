'use strict';

const axios = require('axios');
const semver = require('semver');
const urlJoin = require('url-join');

function getNpmInfo(npmName, registry) {
  if(!npmName) {
    return null;
  }
  registry = registry || getDefaultResigtry()
  const npmInfoUrl = urlJoin(registry, npmName);
  return axios.get(npmInfoUrl).then(response => {
    if(response.status === 200){
      return response.data;
    } else {
      return null;
    }
  }).catch(err => {
    return Promise.reject(err);
  })
}

// 获取默认 registry
function getDefaultResigtry(isOriginal = true) {
  return isOriginal ? 'https://registry.npmjs.org' : 'https://registry.npm.taobao.org';
}

async function getNpmVersions(npmName, registry){
  const data = await getNpmInfo(npmName, registry);
  if(data){
    return Object.keys(data.versions)
  } else {
    return [];
  }
}

function getSemverVersions(baseVersion, versions) {
  return versions
    .filter( version => semver.gt(version, baseVersion) )
    .sort((a, b) => semver.gt(b, a));
}

async function getNpmSemverVersion(baseVersion, npmName, registry){
  const versions = await getNpmVersions(npmName, registry)
  const newVersions = getSemverVersions(baseVersion, versions)
  if(newVersions && newVersions.length > 0){
    return newVersions[0];
  } else {
    return null;
  }
}

module.exports = {
  getNpmInfo,
  getNpmVersions,
  getNpmSemverVersion
};
