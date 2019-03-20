/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/

const level = require('level');
const chainDB = './chaindata';

class LevelSandbox {

    constructor() {
        this.db = level(chainDB);
    }

    // Get data from levelDB with key (Promise)
    getLevelDBData(key) {
        let self = this;
        return new Promise(function (resolve, reject) {
            // Add your code here, remember in Promises you need to resolve() or reject()
            self.db.get(key, (err, value) => {
                if (err) {
                    if (err.type == 'NotFoundError') {
                        resolve(undefined);
                    } else {
                        console.log('Block ' + key + ' get failed', err);
                        reject(err);
                    }
                } else {
                    resolve(value);
                }
            });
        });
    }

    // Add data to levelDB with key and value (Promise)
    addLevelDBData(key, value) {
        let self = this;
        return new Promise(function (resolve, reject) {
            // Add your code here, remember in Promises you need to resolve() or reject()
            self.db.put(key, value, function (err) {
                if (err) {
                    console.log('Block ' + key + ' submission failed', err);
                    reject(err);
                }
                resolve(value);
            })
        });
    }

    // Method that return the height
    getBlocksCount() {
        let self = this;
        let count = 0;
        return new Promise(function (resolve, reject) {
            // Add your code here, remember in Promises you need to resolve() or reject()
            self.db.createReadStream()
                .on('data', function (data) {
                    if (data) {
                        count++;
                    }
                })
                .on('error', function (err) {
                    // reject with error
                    console.log('error while reading blockchain data stream');
                    reject(err);
                })
                .on('close', function () {
                    resolve(count);
                });
        });
    }

    getBlockByHash(hash) {
        let self = this;
        let block = null;
        return new Promise(function (resolve, reject) {
            self.db.createReadStream()
                .on('data', (data) => {
                    let currentBlock = JSON.parse(data.value);
                    //console.log(data.value);
                    if (currentBlock.hash === hash) {

                        block = currentBlock;
                    }
                })
                .on('error', function (err) {
                    reject(err);
                })
                .on('close', function () {
                    //console.log(block);
                    resolve(block);
                });
        });
    }

    getBlockByWalletAddress(address) {
        let self = this;
        let blocks = [];
        return new Promise(function (resolve, reject) {
            self.db.createReadStream()
                .on('data', (data) => {
                    let currentBlock = JSON.parse(data.value);
                   // console.log(currentBlock);
                    if (currentBlock.body.address === address) {

                        blocks.push(currentBlock);
                    }
                })
                .on('error', function (err) {
                    reject(err);
                })
                .on('close', function () {
                    //console.log(block);
                    resolve(blocks);
                });
        });

    }


}

module.exports.LevelSandbox = LevelSandbox;
