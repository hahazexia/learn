const program = require('commander');

const {
    createAction
} = require('./actions')

const createCommands = () => {
    // create 命令
    program
        .command('create <project> [others...]')
        .description('clone a template into a folder')
        .action(createAction);
}

module.exports = createCommands;