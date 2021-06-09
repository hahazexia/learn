#!/usr/bin/env node

const program = require('commander');
const createCommands = require('./lib/core/create');
const helpOptions = require('./lib/core/help');

// 查看版本号
program.version(require('./package.json').version);

// 帮助选项
helpOptions();

// 创建指令
createCommands();

// 解析终端输入的参数
program.parse(process.argv);