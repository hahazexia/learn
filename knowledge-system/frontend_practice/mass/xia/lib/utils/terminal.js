const { spawn } = require('child_process');

const commandSpawn = (...args) => {
    return new Promise((resolve, reject) => {
        const childProcess = spawn(...args);
        childProcess.stdout.on('data', data => {
            const StringDecoder = require('string_decoder').StringDecoder;
            const decoder = new StringDecoder('utf8');
            const str = decoder.write(data);
            console.log(str);
        });

        childProcess.on('close', () => {
            resolve();
        });
    });
}

module.exports = {
    commandSpawn
}