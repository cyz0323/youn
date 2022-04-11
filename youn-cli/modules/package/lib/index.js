'use strict';

const path = require('path');
const fse = require('fs-extra');
const pkgDir = require('pkg-dir').sync;
const pathExists = require('path-exists');
const npminstall = require('npminstall');
const { isObject } = require('@youn-cli/utils');
const formatPath = require('@youn-cli/format-path');
const { getDefaultResigtry, getNpmLatestVersion } = require("@youn-cli/get-npm-info");

class Package {
  constructor(options) {
    if(!options) {
      throw new Error('Package options is null ！');
    }
    if(!isObject(options)){
      throw new Error('Package options is not Object ！');
    }
    // package 路径
    this.targetPath = options.targetPath;
    // 缓存路径
    this.storePath = options.storePath;
    // package name
    this.packageName = options.packageName;
    // package version
    this.packageVersion = options.packageVersion;
  }

  async prepare(){
    // 缓存目录不存在进行自动创建
    if( this.storePath && !pathExists.sync(this.storePath)){
      fse.mkdirpSync(this.storePath);
    }
    // 判断是否执行安装最新资源
    if(this.packageVersion === 'latest'){
      this.packageVersion = await getNpmLatestVersion(this.packageName);
    }
  }

  get cacheFilePath() {
    return path.resolve(this.storePath, `_${(this.packageName).replace('/', '_')}@${this.packageVersion}@${this.packageName}`);
  }

  getSpecificCacheFilePath(packageVersion) {
    return path.resolve(this.storePath, `_${(this.packageName).replace('/', '_')}@${packageVersion}@${this.packageName}`);
  }

  /**
   * 判断当前package 是否存在
   * 根据 当前类中 targetPath，storePath 判断是否本地已经安装
   * ：1、storePath 存在根据 storePath 进行判断
   *   2、targetPath 存在，根据输入指令中的 targetPath 进行判断*/
  async exists() {
    if(this.storePath){
      // 缓存路径存在
      await this.prepare();
      return pathExists.sync(this.cacheFilePath);
    } else {
      // 缓存路径不存在
      return pathExists.sync(this.targetPath);
    }
  }

  // 安装 package
  async install() {
    await this.prepare();
    return npminstall({
      root: this.targetPath,
      storeDir: this.storePath,
      registry: getDefaultResigtry(),
      pkgs: [
        { name: this.packageName, version: this.packageVersion }
      ]
    })
  }

  // 更新 package
  async update() {
    await this.prepare();
    // 1、获取最新的 npm 版本号
    // 2、查询 最新的版本号对应的资源是否存在
    // 3、若不存在，安装最新的资源
    const latestPackageVersion = await getNpmLatestVersion(this.packageName);
    const latestFilePath = this.getSpecificCacheFilePath(latestPackageVersion);
    if(!pathExists.sync(latestFilePath)){
      await npminstall({
        root: this.targetPath,
        storeDir: this.storePath,
        registry: getDefaultResigtry(),
        pkgs: [
          { name: this.packageName, version: latestPackageVersion }
        ]
      })
      this.packageVersion = latestPackageVersion;
    } else {
      return latestFilePath;
    }
  }

  /**
   * 判断当前targetPath 下是否存在 package.json 配置文件 */
  getRootPath() {
    function _getRootFile(targetPath){
      // 1、获取 package.json 所在目录 pkg-dir（库）
      // 2、读取 package.json - rquire()  js/json/node
      // 3、找到 main/lib -path
      // 4、路径兼容的处理(maxOs/windows)
      const dir = pkgDir(targetPath);
      if(dir){
        const pkgFile = require(path.resolve(dir, 'package.json'));
        // 寻找 main/lib
        if(pkgFile && pkgFile.main){
          return formatPath(path.resolve(dir, pkgFile.main));
        }
      }
      return null;
    }
    if(this.storePath){
      return _getRootFile(this.cacheFilePath);
    } else {
      return _getRootFile(this.targetPath);
    }
  }
}

module.exports = Package;