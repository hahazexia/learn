const program = require('commander');

const helpOptions = () => {
    program.option('-x --xia', 'a xia cli');
    program.option('-d --dest <dest>', 'a destination folder. e.g. -d /src/components');
    
    program.on('--help', () => {
        console.log('this is all help')
    });
}

module.exports = helpOptions;