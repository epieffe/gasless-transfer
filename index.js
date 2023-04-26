const ethers = require('ethers');
const { TypedDataUtils } = require('ethers-eip712');
const web3Abi = require('web3-eth-abi');

// NFT owner private key
const PRIVATE_KEY = "0x9b9a7b2159a98fc67eb0f63c56a92e1891e608716e8c04011710271a233e9863";
// get current account nonce from OpenSea Shared Contract
const NONCE = 0;
// Account to transfer the nft to
const RECEIVER = "0xbB072aF5D54BeCb477dffb4cCbdFE75cf1ceBFDB";

const OPENSEA_CONTRACT = "0x2953399124f0cbb46d2cbacd8a89cf0599974963";
const TOKEN_ID = "10110860822564241239994147652924744222037427536707093556420917701357093257416";

const wallet = new ethers.Wallet(PRIVATE_KEY);

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

const params = [wallet.address, RECEIVER, TOKEN_ID, 1, '0x'];
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
    primaryType: "MetaTransaction",
    domain: {
        name: "OpenSea Collections",
        version: "1",
        verifyingContract: OPENSEA_CONTRACT,
        salt: "0x0000000000000000000000000000000000000000000000000000000000000089",
    },
    message: {
        nonce: parseInt(NONCE),
        from: wallet.address,
        functionSignature: functionSignature
    }
};

const digest = TypedDataUtils.encodeDigest(dataToSign);
const digestHex = ethers.utils.hexlify(digest);

const signature = await wallet.signMessage(digest);

let r = signature.slice(0, 66);
let s = "0x".concat(signature.slice(66, 130));
let v = parseInt(signature.substring(130, 132), 16);

console.log(`User address: ${wallet.address}

Function signature: ${functionSignature}

r: ${r}
s: ${s}
v: ${v}`);
