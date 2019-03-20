
# Project #4. Securing Digital Assets on a Private Blockchain.

To setup and start the project do the following:

1. Get the project.

2. Run command __npm install__ to install the project dependencies.

3. Run command __npm start__ in the root directory to start the project. You can also start it using __node app.js__.

## How to use the API

1. To submit a validation request send a POST request to the following URL:<br>
http://localhost:8000/requestValidation <br>
request body should contain a wallet address:
```
{ "address":"19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL" }
```
2. To validate the request send a POST request to the following URL: <br>
http://localhost:8000/message-signature/validate <br>
request body should contain the wallet address and the signature:
```
{
"address":"19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
"signature":"H8K4+1MvyJo9tcr2YN2KejwvX1oqneyCH+fsUL1z1WBdWmswB9bijeFfOfMqK68kQ5RO6ZxhomoXQG3fkLaBl+Q="
}
```
3. To store star data into the blockchain send a POST request to the following URL: <br>
http://localhost:8000/block <br>
request body should contain an address with star information
```
{
    "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
    "star": {
                "dec": "68° 52' 56.9",
                "ra": "16h 29m 1.0s",
                "story": "Found star using https://www.google.com/sky/"
            }
}
```
4. To get a start block by its hash send a GET request to the following URL:<br>
http://localhost:8000/stars/hash/startHash<br>
where __starHash__ in the above url is the hash of the block which contains the star data.

5. To get star blocks by wallet address send a GET request to the following URL:<br>
http://localhost:8000/stars/address/walletAddress <br>
where __walletAddress__ in the above url is the address of wallet which associated to stars.

6. To get a star block using block height, make a GET request to the following URL: <br>

http://localhost:8000/block/height <br>

where __height__ in the above url is a positive integer.