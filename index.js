const web3Abi = require('web3-eth-abi');
const sigUtil = require('eth-sig-util');
const Web3 = require('web3');

var web3 = new Web3('https://polygon-rpc.com/');

// NFT owner private key
const PRIVATE_KEY = "0x68619b8adb206de04f676007b2437f99ff6129b672495a6951499c6c56bc2fa6";
// get current account nonce from OpenSea Shared Contract
const NONCE = 0;
// Account to transfer the nft to
const RECEIVER = "0xbB072aF5D54BeCb477dffb4cCbdFE75cf1ceBFDB";

const OPENSEA_CONTRACT = "0x2953399124f0cbb46d2cbacd8a89cf0599974963";
const TOKEN_ID = "10110860822564241239994147652924744222037427536707093556420917701357093257416";

const safeTransferFromAbi = {
    'inputs': [
        {
            'internalType': "address",
            'name': "_from",
            'type': "address"
        },
        {
            'internalType': "address",
            'name': "_to",
            'type': "address"
        },
        {
            'internalType': "uint256",
            'name': "_id",
            'type': "uint256"
        },
        {
            'internalType': "uint256",
            'name': "_amount",
            'type': "uint256"
        },
        {
            'internalType': "bytes",
            'name': "_data",
            'type': "bytes"
        }
    ],
    'name': "safeTransferFrom",
    'outputs': [],
    'stateMutability': "nonpayable",
    'type': "function"
};

const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
const publicKey = account.address;

const params = [publicKey, RECEIVER, TOKEN_ID, 1, '0x'];
const functionSignature = web3Abi.encodeFunctionCall(safeTransferFromAbi, params);

const dataToSign = {
    types: {
        EIP712Domain: [
            {
                name: "name",
                type: "string"
            },
            {
                name: "version",
                type: "string"
            },
            {
                name: "chainId",
                type: "uint256"
            },
            {
                name: "verifyingContract",
                type: "address"
            }
        ],
        MetaTransaction: [
            {
                name: "nonce",
                type: "uint256"
            },
            {
                name: "from",
                type: "address"
            },
            {
                name: "functionSignature",
                type: "bytes"
            }
        ]
    },
    domain: {
        name: "OpenSea Collections",
        version: "1",
        chainId: 137,
        verifyingContract: OPENSEA_CONTRACT
    },
    primaryType: "MetaTransaction",
    message: {
        nonce: parseInt(NONCE),
        from: publicKey,
        functionSignature: functionSignature
    }
};
const signature = sigUtil.signTypedData_v4(Buffer.from(PRIVATE_KEY.substring(2, 66), 'hex'), {
    data: dataToSign
});

let r = signature.slice(0, 66);
let s = "0x".concat(signature.slice(66, 130));
let v = "0x".concat(signature.slice(130, 132));
v = web3.utils.hexToNumber(v);
if (![27, 28].includes(v)) v += 27;

console.log(`User address: ${publicKey}

Function signature: ${functionSignature}

r: ${r}
s: ${s}
v: ${v}`);
