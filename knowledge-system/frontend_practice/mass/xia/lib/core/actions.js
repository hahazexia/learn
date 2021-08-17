const { promisify } = require('util');
const path = require('path');

const download = promisify(require('download-git-repo'));
const open = require('open');

const { vueRepo } = require('../config/vue-repo');
const { commandSpawn } = require('../utils/terminal')

const createAction = async (project) => {
    console.log('begain create your project');

    // 下载模板
    await download(vueRepo, project, {clone: true});

    // npm install
    const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    await commandSpawn(command, ['install'], { cwd: `./${project}` });

    // commandSpawn(command, ['run', 'serve'], { cwd: `./${project}` });

}

module.exports = {
    createAction
}