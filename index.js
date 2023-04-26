const web3Abi = require('web3-eth-abi');
const sigUtil = require('@metamask/eth-sig-util');
const Web3 = require('web3');

var web3 = new Web3('https://polygon-rpc.com/');

// NFT owner private key
const PRIVATE_KEY = "0x68619b8adb206de04f676007b2437f99ff6129b672495a6951499c6c56bc2fa6";
// get current account nonce from OpenSea Shared Contract
const NONCE = 0;
// Account to transfer the nft to
const RECEIVER = "0xbB072aF5D54BeCb477dffb4cCbdFE75cf1ceBFDB";

const OPENSEA_CONTRACT = "0x2953399124f0cbb46d2cbacd8a89cf0599974963";

const TOKEN_IDS = [
    "27586265456489730858872113696342466140246807895101263013680124710712147705876",
    "31443824730881887699422569955567000458264599455970345663847405214989499236353"
];

const BALANCES = [1, 1];

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

const safeBatchTransferFromAbi = {
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
            'internalType': "uint256[]",
            'name': "_ids",
            'type': "uint256[]"
        },
        {
            'internalType': "uint256[]",
            'name': "_amounts",
            'type': "uint256[]"
        },
        {
            'internalType': "bytes",
            'name': "_data",
            'type': "bytes"
        }
    ],
    'name': "safeBatchTransferFrom",
    'outputs': [],
    'stateMutability': "nonpayable",
    'type': "function"
}

const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
const publicKey = account.address;

//const params = [publicKey, RECEIVER, TOKEN_ID, 1, '0x'];
//const functionSignature = web3Abi.encodeFunctionCall(safeTransferFromAbi, params);

const params = [publicKey, RECEIVER, TOKEN_IDS, BALANCES, '0x'];
const functionSignature = web3Abi.encodeFunctionCall(safeBatchTransferFromAbi, params);

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
                name: "verifyingContract",
                type: "address"
            },
            {
                name: "salt",
                type: "bytes32"
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
        verifyingContract: OPENSEA_CONTRACT,
        salt: "0x0000000000000000000000000000000000000000000000000000000000000089"// 137 (Polygon chainId) to bytes32
    },
    primaryType: "MetaTransaction",
    message: {
        nonce: NONCE,
        from: publicKey,
        functionSignature: functionSignature
    }
};

const signature = sigUtil.signTypedData({
    data: dataToSign,
    privateKey: Buffer.from(PRIVATE_KEY.substring(2, 66), 'hex'),
    version: 'V4'
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
