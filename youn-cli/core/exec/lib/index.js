'use strict';

const path = require("path");
const cp = require('child_process');
const Package = require('@youn-cli/package');
const log = require("@youn-cli/log");

const SETTINGS = {
    init: "youn-cli",
    version: 'latest'
}
const CACHE_DIR = 'dependencies/';

// 动态加载
async function exec() {
    // 1、根据 targetPath 获取 modulePath
    // 2、modulePath 当作 package（npm模块）
    // 3、package.getRootFile() // 获取入口文件
    // 4、package.update / package.install
    let storePath='';
    let pkg;
    let targetPath = process.env.CLI_TARGET_PATH;
    const homePath = process.env.CLI_HOME_PATH;
    log.verbose('targetPath', targetPath);
    log.verbose('homePath', homePath);

    const cmdObj = arguments[arguments.length - 1];
    const cmdName = cmdObj.name();
    const packageName = SETTINGS[cmdName];
    const packageVersion = SETTINGS["version"];

    /**
     * 判断目标路径是否存在
     * 参数 为 命令行中的入参 --targetPath */
    if(!targetPath){
        targetPath = path.resolve(homePath, CACHE_DIR);    // 生成缓存路径
        storePath = path.resolve(targetPath, 'node_modules');
        log.verbose("targetPath", targetPath);
        log.verbose("storePath", storePath);

        pkg = new Package({
            targetPath,
            packageName,
            packageVersion,
            storePath
        });
        /**
         * 判断当前 pkg 对象需要安装的资源本地是否存在
         *  1、若存在检查版本进行更新操作
         *  2、若不存在进行本地安装操作*/
        if(await pkg.exists()){
            // 更新 package
            log.verbose("执行更新操作")
            await pkg.update();
        } else {
            // 安装 package
            log.verbose("执行安装操作")
            await pkg.install();
        }
    } else {
        pkg = new Package({
            targetPath,
            packageName,
            packageVersion,
            storePath
        });
    }

    /**
     * 更具 pkg 类 getRootPath 判断当前路径下是否存在 package.json
     *  1、若存在 进行方法的调用
     *  2、若不存在本地仅仅安装完成后结束
     */
    const rootFile = pkg.getRootPath();
    if(rootFile){
        log.verbose("安装完成，执行文件", rootFile);
        try{
            // 在当前进程中执行内容
            // require(rootFile).call(null, Array.from(arguments));
            // 在 node 子进程中调用
            let args = Array.from(arguments);
            const cmd = args[args.length - 1];
            const o = Object.create(null);
            Object.keys(cmd).forEach(key => {
                if(cmd.hasOwnProperty(key)){
                    if(!key.startsWith("_") && key !== 'parent'){
                        o[key] = cmd[key];
                    }
                }
            })
            args[args.length - 1] = o;

            const code = `require('${rootFile}').call(null, ${JSON.stringify(args)})`;
            // 子进程的声明
            const child = spawn('node', ['-e', code], {
                cwd: process.cwd(),
                stdio: 'inherit'
            });
            child.on("error", e => {
                log.error(e.message);
                process.exec(1);
            })
            child.on("exit", e => {
                log.verbose('exec 执行命令成功！', e)
            })
        } catch (e) {
            log.error(e.message);
        }

    }
}

// spawn 运行环境参数处理 macOs / win
function spawn(command, args, options) {
    const win32 = process.platform === 'win32';
    const cmd = win32 ? 'cmd' : command;
    const cmdArgs = win32 ? ['/c'].concat(command, args) : args;

    return cp.spawn(cmd, cmdArgs, options || {})
}

module.exports = exec;