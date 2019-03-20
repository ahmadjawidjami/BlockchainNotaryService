const express = require('express');

const app = express();

const bodyParser = require('body-parser');

const hex2ascii = require('hex2ascii');

const Block = require('./Block');
const Blockchain = require('./BlockChain');

const myBlockchain = new Blockchain.Blockchain();

const Mempool = require('./Mempool');
const myMempool = new Mempool.Mempool();

app.use(bodyParser.json({ extended: false }));



app.post('/requestValidation', (req, res) => {
    const walletAddress = req.body.address;
    const object = myMempool.addRequestValidation(walletAddress);
    res.status(200).send(object);

});

app.post('/message-signature/validate', (req, res) => {

    const address = req.body.address;
    const signature = req.body.signature;

    const object = myMempool.validateRequestByWallet(address, signature);

    res.status(200).send(object);

});

//I already have get block by height. I just made simple modifications, so no need to rewrite.
app.get('/block/:height', (req, res) => {
    const height = req.params.height;

    if (isNaN(height)) {
        res.status(404).send('You can get a block using its height');

    }

    else if (height < 0) {
        res.status(404).send('Blocks numbers are positive integers');
    }
    else {
        myBlockchain.getBlockHeight()
            .then(currentBlockHeight => {

                if (currentBlockHeight < height) {
                    res.status(404).send('The block you are looking for does not exist. ' +
                        'Current block height is ' + currentBlockHeight);
                }
                else {
                    myBlockchain.getBlock(height)
                        .then(foundBlock => {
                            let storyDecoded = hex2ascii(foundBlock.body.star.story);
                            foundBlock.body.star.storyDecoded = storyDecoded;
                            res.status(200).send(foundBlock);
                        })
                        .catch(err => console.log(err));
                }
            })
            .catch(err => console.log(err));
    }
});



app.post('/block', (req, res) => {
    let blockBody = req.body;

    let starStory = blockBody.star.story;

    blockBody.star.story = Buffer.from(starStory).toString('hex');

    if (!blockBody) {
        res.status(400).send('You should send the block body along with your request');
    }
    else if (!myMempool.verifyAddressRequest(blockBody.address)) {
        res.status(401).send('You request has not been validated or is not valid');
    }
    else {
        let newBlock = new Block.Block(blockBody);
        myBlockchain.addBlock(newBlock)
            .then(createdBlock => {
                //Delete the valid request after adding it to a block.
                delete(myMempool.mempoolValid[blockBody.address]);
                res.status(200).send(JSON.parse(createdBlock));
            })
            .catch(err => console.log(err));
    }

});

app.get('/stars/hash/:starHash', (req, res) => {
    const starHash = req.params.starHash;
    myBlockchain.getBlockByHash(starHash)
        .then(block => {
            let storyDecoded = hex2ascii(block.body.star.story);
            block.body.star.storyDecoded = storyDecoded;
            res.status(200).send(block);
        })
        .catch(err => console.log(err));

});

app.get('/stars/address/:walletAddress', (req, res) => {
    const walletAddress = req.params.walletAddress;
    myBlockchain.getBlockByWalletAddress(walletAddress)
        .then(blocks => {

            blocks = blocks.map(block => {
                let storyDecoded = hex2ascii(block.body.star.story);
                block.body.star.storyDecoded = storyDecoded;
                return block;
            });

            res.status(200).send(blocks);
        })
        .catch(err => console.log(err));
});

console.log('Server started on port 8000');
app.listen(8000);

