/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');

class Blockchain {

    constructor() {
        this.bd = new LevelSandbox.LevelSandbox();
        this.generateGenesisBlock();
    }

    // Helper method to create a Genesis Block (always with height= 0)
    // You have to options, because the method will always execute when you create your blockchain
    // you will need to set this up statically or instead you can verify if the height !== 0 then you
    // will not create the genesis block
    generateGenesisBlock() {
        // Add your code here
        return this.getBlockHeight()
            .then(height => {
                if (height < 0) {
                    let genesisBlock = new Block.Block('This is the genesis block with height equal to zero');
                    genesisBlock.height = 0;
                    genesisBlock.time = new Date().getTime().toString().slice(0, -3);
                    genesisBlock.hash = SHA256(JSON.stringify(genesisBlock)).toString();
                    return this.bd.addLevelDBData(genesisBlock.height, JSON.stringify(genesisBlock).toString());
                }
            })
            .catch(err => console.log(err));
    }

    // Get block height, it is a helper method that return the height of the blockchain
    getBlockHeight() {
        // Add your code here
        let self = this;
        return self.bd.getBlocksCount().then(count => {
            return count - 1;
        }).catch(err => console.log(err));

    }

    // Add new block
    addBlock(block) {

        block.time = new Date().getTime().toString().slice(0, -3);
        return this.getBlockHeight()
            .then(height => {
                if (height < 0) {
                    this.generateGenesisBlock().then(result => {
                        console.log(result);
                        return height + 1;
                    }).catch(err => console.log(err));
                }

                return height;

            })
            .then(height => {
                block.height = height + 1;
                return this.getBlock(height);

            })
            .then(previousBlock => {
                block.previousHash = previousBlock.hash;
                block.hash = SHA256(JSON.stringify(block)).toString();
                return this.bd.addLevelDBData(block.height, JSON.stringify(block).toString());

            })
            .catch(err => console.log(err));


    }

    // Get Block By Height
    getBlock(height) {
        // Add your code here
        return this.bd.getLevelDBData(height.toString())
            .then(stringBlock => {
                return JSON.parse(stringBlock);
            })
            .catch(err => console.log(err));
    }

    // Validate if Block is being tampered by Block Height
    validateBlock(height) {
        // Add your code here
        return this.getBlock(height)
            .then(block => {
                let blockHash = block.hash;
                block.hash = '';
                let validBlockHash = SHA256(JSON.stringify(block)).toString();
                if (blockHash === validBlockHash) {
                    //reslove(true)
                    return true;
                }
                //otherwise resolve false
                return false;
            })
            .catch(err => console.log(err));
    }

    // Validate Blockchain
    validateChain() {
        let errorLog = [];
        // Add your code here
        let promises = [];
        return this.getBlockHeight()
            .then(height => {
                for (let i = 0; i <= height; i++) {
                    if (i == 0) {
                        promises.push(this.validateBlock(i));
                        continue;
                    }
                    let previousBlock = this.getBlock(i - 1);
                    let currentBlock = this.getBlock(i);
                    promises.push(Promise.all([previousBlock, currentBlock])
                        .then((results) => {
                            let previousBlock = results[0];
                            previousBlock.hash = '';
                            let previousBlockHash = SHA256(JSON.stringify(previousBlock)).toString();
                            if (previousBlockHash !== results[1].previousHash) {
                                errorLog.push('Integrity check error in block ' + i + ' - previous block hash has been modified'
                                );
                            }

                            return this.validateBlock(i);

                        }))
                }

                return Promise.all(promises);
            })
            .then(results => {
                for (let index = 0; index < results.length; index++) {
                    if (!results[index]) {
                        errorLog.push('Block ' + index + ' has been modified');
                    }
                }

                return errorLog;

            })
            .catch(err => console.log(err));
    }

    // Utility Method to Tamper a Block for Test Validation
    // This method is for testing purpose
    _modifyBlock(height, block) {
        let self = this;
        return new Promise((resolve, reject) => {
            self.bd.addLevelDBData(height, JSON.stringify(block).toString()).then((blockModified) => {
                resolve(blockModified);
            }).catch((err) => { console.log(err); reject(err) });
        });
    }

    getBlockByHash(hash) {
        return this.bd.getBlockByHash(hash);

    }

    getBlockByWalletAddress(address) {
        return this.bd.getBlockByWalletAddress(address);
    }

}

module.exports.Blockchain = Blockchain;
