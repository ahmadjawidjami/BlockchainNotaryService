class ValidationObject {
    constructor(walletAddress, requestTimeStamp, message, validationWindow, isValid) {
        this.registerStar = isValid;
        this.status = {
            walletAddress: walletAddress,
            requestTimeStamp: requestTimeStamp,
            message: message,
            validationWindow: validationWindow,
            messageSignature: isValid

        }
    }
}

module.exports.ValidationObject = ValidationObject;