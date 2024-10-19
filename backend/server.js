
const util = require('util');
const MongoClient = require('mongodb').MongoClient;
// server.js
const express = require('express')
const cors = require('cors')
const { ethers, BigNumber } = require('ethers')
const { PinataSDK } = require('pinata-web3')
require('dotenv').config()
const app = express()

// const JsonLdDocumentLoader =require('jsonld-document-loader')


const DB_RS = null;
const DB_NAME = 'crypto-cert-db'

const DB_HOSTS = [
    process.env.DB_HOSTS
]

const DB_USER  = process.env.DB_USER
const DB_PASS  = process.env.DB_PASS
const CACERT   = '/home/tripleheaven/.mongodb/root.crt'

const url = util.format('mongodb://%s:%s@%s/', DB_USER, DB_PASS, DB_HOSTS.join(','))

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    tls: true,
    tlsCAFile: CACERT,
    replicaSet: DB_RS,
    authSource: DB_NAME
}

let db
const client = new MongoClient(url, options);


async function connectToDB() {
  try {
      // Only connect if it's not already connected
      if (!db) {
        console.log('test')
          await client.connect();
          console.log('Connected successfully to MongoDB');
      }
      db = client.db('crypto-cert-db');
      collection = db.collection('query');
  } catch (err) {
      console.error('MongoDB connection error:', err);
      throw err;
  }
}





// const cred = require('credentials-context')
// import * as vc from '@digitalbazaar/vc'
// Middleware
app.use(cors())
app.use(express.json()) // To parse JSON bodies'

const NFT_TYPES = {
  main: 'MAIN',
  certificate: 'CERTIFICATE',
  review: 'REVIEW',
}

const CHAIN_ID = 97
const DID_PREFIX = `did:ethr:${CHAIN_ID}:`

const PRIVATE_KEY_BACKEND =
  '9ba09d2e2a9ca98f680977ed6b00ac05e5558b0fa29f3f3d97f5a75ce8c11cc5'
const ISSUER_WALLET = new ethers.Wallet(PRIVATE_KEY_BACKEND)

const PROVIDER = new ethers.providers.JsonRpcProvider(
  'https://bsc-testnet.public.blastapi.io'
)

const NFT_ADDR = '0xb857435D138c28d195420F8452F71E9D32aB063F'
const AUTH_PREFIX = `auth:ethr:${CHAIN_ID}:${NFT_ADDR.toLowerCase()}:`

const abi = ['function counter() public view returns (uint256)']
const NFT_CONTRACT = new ethers.Contract(NFT_ADDR, abi, PROVIDER)

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL,
})

let mainClient;

let collection;

app.use(async (req, res, next) => {
  if (!collection) {
      await connectToDB();
      console.log('!!! OK')
  }
  next();
});


// Example API Route: Submit Profile
app.post('/api/profile', async function (req, res)  {


  const documents = await collection.find({}).toArray();

console.log ('CODUMENTTD', documents)
  const { name, email, bio } = req.body;

  // Here you could handle the data, save it to a database, etc.

  // Send a response
  res
    .status(200)
    .json({
      message: 'Profile submitted successfully',
      data: { name, email, bio },
    })
})

async function challengeVerify(signature) {
  const nftCount = await NFT_CONTRACT.counter()
  const challenge = AUTH_PREFIX + nftCount.toString()
  const signerAddr = await ethers.utils.verifyMessage(challenge, signature)
  if (signerAddr.toLowerCase() != ISSUER_WALLET.address.toLowerCase()) {
    return false
  }
  return true
}

async function signMetadataAndSendToIpfs(metadata) {
  const signature = await ISSUER_WALLET.signMessage(JSON.stringify(metadata))
  metadata['issuerSignature'] = signature

  const blob = new Blob([JSON.stringify(metadata, null, 2)], {
    type: 'application/json',
  })
  const file = new File([blob], 'json', { type: 'text/plain' })

  let upload
  try {
    upload = await pinata.upload.file(file)
  } catch (error) {
    throw new Error('Pinata error!')
  }

  return upload.IpfsHash
}

app.post('/api/createMainVC', async (req, res) => {
  const {
    imageLink,
    workerAddr,
    skills,
    jobTitle,
    fullName,
    dateOfHire,
    challengeSig,
  } = req.body

  const isRightSignature = await challengeVerify(challengeSig)
  if (!isRightSignature) {
    res.status(401).json({ message: 'Wrong signature', data: {} })
  }

  const now = (await PROVIDER.getBlock('latest')).timestamp
  const metadata = {
    name: 'Крипто$лоня₽ы Collection Digital Profile',
    image: imageLink,
    description: "Metadata of a company employee's digital profile.",
    vc: {
      type: ['VerifiableCredential'],
      issuer: {
        id: DID_PREFIX + ISSUER_WALLET.address,
      },
      issuanceDate: now.toString(),
      credentialSubject: {
        id: DID_PREFIX + workerAddr,
        data: {
          type: NFT_TYPES.main,
          fullName: fullName,
          jobTitle: jobTitle,
          skills: skills,
          dateOfHire: dateOfHire,
        },
      },
    },
  }

  let ipfsHash
  try {
    ipfsHash = await signMetadataAndSendToIpfs(metadata)
  } catch (error) {
    res.status(500).json({message: 'IPFS error'})
  }

  res
    .status(200)
    .json({
      message: 'Profile submitted successfully',
      data: { metadata, ipfsHash },
    })
})

app.post('/api/createCertificateVC', async (req, res) => {
  const { imageLink, workerAddr, certificateId, receiptDate, challengeSig } =
    req.body

  const isRightSignature = await challengeVerify(challengeSig)
  if (!isRightSignature) {
    res.status(401).json({ message: 'Wrong signature', data: {} })
  }

  const now = (await PROVIDER.getBlock('latest')).timestamp
  const metadata = {
    name: 'Крипто$лоня₽ы Collection Digital Certificate',
    image: imageLink,
    description: "Metadata of a company employee's digital certificate.",
    vc: {
      type: ['VerifiableCredential'],
      issuer: {
        id: DID_PREFIX + ISSUER_WALLET.address,
      },
      issuanceDate: now.toString(),
      credentialSubject: {
        id: DID_PREFIX + workerAddr,
        data: {
          type: NFT_TYPES.certificate,
          certificateId: certificateId,
          receiptDate: receiptDate,
        },
      },
    },
  }

  let ipfsHash
  try {
    ipfsHash = await signMetadataAndSendToIpfs(metadata)
  } catch (error) {
    res.status(500).json({message: 'IPFS error'})
  }

  res
    .status(200)
    .json({
      message: 'Profile submitted successfully',
      data: { metadata, ipfsHash },
    })
})

app.post('/api/createReviewVC', async (req, res) => {
  const { reviewFrom, reviewTo, reviewText, reviewType, challengeSig } =
    req.body

  const isRightSignature = await challengeVerify(challengeSig)
  if (!isRightSignature) {
    res.status(401).json({ message: 'Wrong signature', data: {} })
  }

  const now = (await PROVIDER.getBlock('latest')).timestamp
  const metadata = {
    name: 'Крипто$лоня₽ы Collection Digital Review',
    image: imageLink,
    description: "Metadata of a company employee's digital review.",
    vc: {
      type: ['VerifiableCredential'],
      issuer: {
        id: DID_PREFIX + ISSUER_WALLET.address,
      },
      issuanceDate: now.toString(),
      credentialSubject: {
        id: DID_PREFIX + reviewTo,
        data: {
          type: NFT_TYPES.review,
          from: DID_PREFIX + reviewFrom,
          reviewText: reviewText,
          reviewType: reviewType,
        },
      },
    },
  }

  let ipfsHash
  try {
    ipfsHash = await signMetadataAndSendToIpfs(metadata)
  } catch (error) {
    res.status(500).json({message: 'IPFS error'})
  }

  res
    .status(200)
    .json({
      message: 'Profile submitted successfully',
      data: { metadata, ipfsHash },
    })
})

// Start the server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
