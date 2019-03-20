const bitcoinMessage = require('bitcoinjs-message');
const ValidationObject = require('./ValidationObject');

class Mempool {
    constructor() {
        this.mempool = [];
        this.timeoutRequests = [];
        this.mempoolValid = [];
    }

    addRequestValidation(walletAddress) {
        let requestObject;

        if (this.timeoutRequests[walletAddress]) {
            requestObject = this.mempool[walletAddress];
            let timeElapse = (new Date().getTime().toString().slice(0, -3)) - requestObject.requestTimestamp;
            let timeLeft = (5 * 60) - timeElapse;
            requestObject.validationWindow = timeLeft;
        }
        else {
            const requestTimestamp = new Date().getTime().toString().slice(0, -3);
            const message = walletAddress + ':' + requestTimestamp + ':starRegistry';

            requestObject = {
                walletAddress: walletAddress,
                requestTimestamp: requestTimestamp,
                message: message,
                validationWindow: 5 * 60
            }

            this.mempool[walletAddress] = requestObject;

            this.timeoutRequests[walletAddress] = setTimeout(() => {
                this.removeValidationRequest(walletAddress)
            }, 5 * 60 * 1000);
        }

        return requestObject;

    }

    removeValidationRequest(walletAddress) {

        delete (this.mempool[walletAddress]);
    }

    validateRequestByWallet(walletAddress, signature) {

        let requestObject = this.mempool[walletAddress];
        if (requestObject) {

            let currentTimestamp = new Date().getTime().toString().slice(0, -3);
            let timeElapse = currentTimestamp - requestObject.requestTimestamp;
            requestObject.validationWindow = (5 * 60 - timeElapse);

            if (requestObject.validationWindow > 0) {

                let isValid = bitcoinMessage.verify(requestObject.message, walletAddress, signature);

                const validatedObject = new ValidationObject.ValidationObject(walletAddress, requestObject.requestTimestamp,
                    requestObject.message, requestObject.validationWindow, isValid);
                    /* Uncomment the following 'if' block, If we need to only store valid requests*/
              //  if (isValid) {
                    this.mempoolValid[walletAddress] = validatedObject;
                    setTimeout(() => {
                        if(this.mempoolValid[walletAddress]) {
                            console.log('validation timed out. deleting the the entry with wallet address: ' + walletAddress);
                            delete(this.mempoolValid[walletAddress]);
                        }
                        
                    }, 30 * 60 * 1000);

               // }
                delete (this.timeoutRequests[walletAddress]);
                return validatedObject;
            }
            else {
                return 'validation window was expired';
            }
        }
        else {
            return 'Cannot find address and signature in the mempool';
        }
    }

    verifyAddressRequest(walletAddress) {

        let validatedObject = this.mempoolValid[walletAddress];

        if(!validatedObject) {
            return false;
        }

        if(!validatedObject.status.messageSignature) {
            return false;
        }

        return true;
    }

}

module.exports.Mempool = Mempool;