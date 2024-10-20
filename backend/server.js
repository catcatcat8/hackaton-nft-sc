
const util = require('util');
const MongoClient = require('mongodb').MongoClient;

const express = require('express');
const cors = require('cors');
const { ethers } = require("ethers");
const { PinataSDK } = require('pinata-web3')
require('dotenv').config()
const app = express();
const { ObjectId } = require('mongodb');


const CHAIN_ID = 97
const DID_PREFIX = `did:ethr:${CHAIN_ID}:`

const PRIVATE_KEY_BACKEND = '9ba09d2e2a9ca98f680977ed6b00ac05e5558b0fa29f3f3d97f5a75ce8c11cc5'
const ISSUER_WALLET = new ethers.Wallet(PRIVATE_KEY_BACKEND)

const PROVIDER = new ethers.providers.JsonRpcProvider('https://bsc-testnet.public.blastapi.io')


const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL
})



const DB_RS = null;
const DB_NAME = 'crypto-cert-db'

const DB_HOSTS = [
    process.env.DB_HOSTS
]

const DB_USER  = process.env.DB_USER
const DB_PASS  = process.env.DB_PASS
const DB_HOME = process.env.DB_HOME
const CACERT   = `/home/${DB_HOME}/.mongodb/root.crt`

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


const NFT_TYPES = {
  main: 'MAIN',
  certificate: 'CERTIFICATE',
  review: 'REVIEW',
}




const NFT_ADDR = '0x225774cB32E49bceA6Ac1F44F86cCE87ACd241b6'
const AUTH_PREFIX = `auth:ethr:${CHAIN_ID}:${NFT_ADDR.toLowerCase()}:`

const abi = ['function counter() public view returns (uint256)']
const NFT_CONTRACT = new ethers.Contract(NFT_ADDR, abi, PROVIDER)



let mainClient;

let reviewsQueue;
let certificatesQueue
let usersInfo

async function connectToDB() {
  try {
      // Only connect if it's not already connected
      if (!db) {
          await client.connect();
          console.log('Connected successfully to MongoDB');
      }
      db = client.db('crypto-cert-db');
      reviewsQueue = db.collection('reviews');
      certificatesQueue = db.collection('certificates')
      usersInfo = db.collection('usersInfo')
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



app.use(async (req, res, next) => {
  if (!reviewsQueue || !certificatesQueue) {
      await connectToDB();
  }
  next();
});


// Example API Route: Submit Profile
app.post('/api/profile', async function (req, res)  {


  const documents = await reviewsQueue.find({}).toArray();

  console.log('Successfully created documents', documents)

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

app.post('/api/insertReview', async (req, res) => {
  const { reviewFrom, reviewTo, reviewText, reviewType } =
    req.body

  const data = {
    reviewFrom,
    reviewTo,
    reviewText,
    reviewType,
    isAccepted: false
  }
  try {
    await reviewsQueue.insertOne(data)
  } catch (error) {
    res.status(500).json({message: 'MongoDB reviews insert error'})
    return
  }

  res
    .status(200)
    .json({
      message: 'Review inserted to queue successfully',
      data: {},
    })
})

app.post('/api/insertCertificate', async (req, res) => {
  const { imageLink, workerAddr, certificateId, receiptDate } =
    req.body

  const data = {
    workerAddr,
    imageLink,
    certificateId,
    receiptDate,
    isAccepted: false
  }
  try {
    await certificatesQueue.insertOne(data)
  } catch (error) {
    res.status(500).json({message: 'MongoDB certificates insert error'})
    return
  }

  res
    .status(200)
    .json({
      message: 'Certificate inserted to queue successfully',
      data: {},
    })
})

app.post('/api/acceptReview', async (req, res) => {
  const { id, idSig } =
    req.body

    const signerAddr = await ethers.utils.verifyMessage(id, idSig)
    if (signerAddr.toLowerCase() != ISSUER_WALLET.address.toLowerCase()) {
      res.status(401).json({ message: 'Wrong signature', data: {} })
      return
    }

    try {
      await reviewsQueue.updateOne({"_id": new ObjectId(id.toString())}, {"$set": {"isAccepted": true}})
    } catch (error) {
      console.log(error);
      
      res.status(500).json({message: 'MongoDB reviews insert error'})
      return
    }
    res
    .status(200)
    .json({
      message: 'Review updated successfully',
      data: {},
    })
})

app.post('/api/acceptCertificate', async (req, res) => {
  const { id, idSig } =
    req.body
   
    const signerAddr = await ethers.utils.verifyMessage(id, idSig)
    if (signerAddr.toLowerCase() != ISSUER_WALLET.address.toLowerCase()) {
      res.status(401).json({ message: 'Wrong signature', data: {} })
      return
    }

    try {
      await certificatesQueue.updateOne({"_id": new ObjectId(id)}, {"$set": {"isAccepted": true}})
    } catch (error) {
      res.status(500).json({message: 'MongoDB certificates insert error'})
      return
    }
    res
    .status(200)
    .json({
      message: 'Certificate updated successfully',
      data: {},
    })
})

app.get('/api/getCertificatesQueue', async (req, res) => {
  let certificates
  let result = [];

  try {
    certificates = await certificatesQueue.find({}).toArray();



    for (let i=0; i < certificates.length; i++) {
      result.push(certificates[i])
      let userInfo = await usersInfo.findOne({"address": certificates[i].workerAddr.toLowerCase()});

      result[i].fullName=userInfo?.fullName;
      result[i].image=userInfo?.image;

    }

  } catch (error) {
    res.status(500).json({message: 'Backend error'})
    return
  }

  res
    .status(200)
    .json({
      message: 'Certificates received successfully',
      data: {certificates:  result},
    })
})

app.get('/api/getReviewsQueue', async (req, res) => {
  let reviews
  let result = []
  try {
    reviews = await reviewsQueue.find({}).toArray();



    for (let i=0; i < reviews.length; i++) {
      result.push(reviews[i])
      let userInfoFrom = await usersInfo.findOne({"address": reviews[i].reviewFrom.toLowerCase()});
      let userInfoTo = await usersInfo.findOne({"address": reviews[i].reviewTo.toLowerCase()});


      result[i].fullNameFrom=userInfoFrom?.fullName;
      result[i].imageFrom=userInfoFrom?.image;

      result[i].fullNameTo=userInfoTo?.fullName;
      result[i].imageTo=userInfoTo?.image;
    }


  } catch (error) {
    console.error('ERROR', error)
    res.status(500).json({message: 'Backend error '})
    return
  }
  res
    .status(200)
    .json({
      message: 'Reviews received successfully',
      data: {reviews: result},
    })
})

app.get('/api/getUserInfo', async (req, res) => {
  const userAddress = req.query.userAddress
  

  let userInfo
  try {
    userInfo = await usersInfo.findOne({"address": userAddress.toLowerCase()});
  } catch (error) {
    res
    .status(200)
    .json({
      message: 'No user info',
      data: {},
    })
  }
  res
    .status(200)
    .json({
      message: 'UserInfo received successfully',
      data: {userInfo},
    })
})

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
    return;
  }

  const now = (await PROVIDER.getBlock('latest')).timestamp
  const metadata = {
    name: 'DONS Collection Main',
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
    return
  }

  const data = {
    address: workerAddr.toLowerCase(),
    fullName: fullName,
    image: imageLink,
  }

  try {
    await usersInfo.insertOne(data)
  } catch (error) {
    res.status(500).json({message: 'MongoDB userInfo insert error'})
    return
  }

  res
    .status(200)
    .json({
      message: 'Main NFT VC uploaded to IPFS',
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
    name: 'DONS Collection Certificate',
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
    return
  }

  res
    .status(200)
    .json({
      message: 'Certificate NFT VC uploaded to IPFS',
      data: { metadata, ipfsHash },
    })
})

const getWalletAddr = (a) => {
  return a?.split(':')[3]}

app.post('/api/getIpfsInfo', async (req,res) => {
  const  { ipfsLink } =req.body



  const promises = ipfsLink.map(item => {
    
    return pinata.gateways.get(item.split('ipfs/')[1]).then((data) => {

      return {link: item, data}
    })
  })
  
  // MAIN CERTIFICATE REVIEW





const resp = await Promise.all(promises)


let responseFinalle = []

  for(let i = 0 ; i < resp.length; i++) {
    if (resp[i].data?.data.vc.credentialSubject?.data?.type) {
      if (resp[i].data?.data.vc.credentialSubject?.data?.type === 'MAIN') {
        let test = resp[i].data?.data
        responseFinalle.push({
          bigId: resp[i].link,
          walletAddr :  getWalletAddr(resp[i].data?.data?.vc?.credentialSubject?.id),
          type: 'MAIN',
          fullName: resp[i].data?.data?.vc?.credentialSubject?.data?.fullName,
          jobTitle: resp[i].data?.data?.vc?.credentialSubject?.data?.jobTitle,
          skills: resp[i].data?.data?.vc?.credentialSubject?.data?.skills,
          dateOfHire: resp[i].data?.data?.vc?.credentialSubject?.data?.dateOfHire,
          image:   resp[i].data?.data?.image
        })
      }
// "data": {
//   "name": "Крипто$лоня₽ы Collection Digital Certificate",
//   "image": "https://ipfs.io/ipfs/bafybeidiokwtrgaujrjuccdyxxbmas6hzdzprt32ddow42da3fhkj5wuwi",
//   "description": "Metadata of a company employee's digital certificate.",
//   "vc": {
//       "type": [
//           "VerifiableCredential"
//       ],
//       "issuer": {
//           "id": "did:ethr:97:0x09A4483934C321e7a1a89c00A2cF2ef882CC6256"
//       },
//       "issuanceDate": "1729426440",
//       "credentialSubject": {
//           "id": "did:ethr:97:0x09a4483934c321e7a1a89c00a2cf2ef882cc6256",
//           "data": {
//               "type": "CERTIFICATE",
//               "certificateId": "771",
//               "receiptDate": 1729198800
//           }
//       }
//   },
//   "issuerSignature": "0x3059e31af2663bea92248924559178d4afcfee94e3b135cd9cfd5e5c6d16ec0054593209ef6f653490518715f943186d7bfe3c308ac35c15ef0a35f42c9a95ba1c"
// },

        if (resp[i].data?.data.vc.credentialSubject?.data?.type === 'CERTIFICATE') {

    let address = getWalletAddr(resp[i].data?.data?.vc?.credentialSubject?.id)

          let userInfo = await usersInfo.findOne({"address": getWalletAddr(resp[i].data?.data?.vc?.credentialSubject?.id?.toLowerCase())});
          let test = resp[i].data?.data

     
          responseFinalle.push({
            bigId: resp[i].link,

            type: 'CERTIFICATE',
            fullName: userInfo?.fullName,
            imageUser: userInfo?.image,
            certId: resp[i].data?.data?.vc?.credentialSubject?.data.certificateId,
            dateCreation: resp[i].data?.data?.vc?.credentialSubject?.receiptDate,
            imageCert: resp[i].data?.data?.image,
          })
        }

    //  на кого   "id": "did:ethr:97:0x723c39bB483F558A548652b81a87CdBbbE9FEF48",
    //     "data": {
    //         "type": "REVIEW",
    //    от кого     "from": "did:ethr:97:0x09a4483934c321e7a1a89c00a2cf2ef882cc6256",
    //         "reviewText": "21r3fr32",
    //         "reviewType": 1
    //     }
    // }
        
        if (resp[i].data?.data.vc.credentialSubject?.data?.type === 'REVIEW') {

          let test = resp[i].data?.data?.vc?.credentialSubject;

          let reviewFrom = getWalletAddr(resp[i].data?.data?.vc?.credentialSubject?.data.from)
          let reviewTo =  getWalletAddr(resp[i].data?.data?.vc?.credentialSubject?.id)

          let userInfoTo =   await usersInfo.findOne({"address": reviewTo.toLowerCase()});
          
          let userInfoFrom = await usersInfo.findOne({"address": reviewFrom.toLowerCase()});


          responseFinalle.push({
            bigId: resp[i].link,
            type: 'REVIEW',
            reviewFromFullName: userInfoFrom?.fullName,
            reviewFromImage :userInfoFrom?.image,
            reviewFrom : reviewFrom,
            reviewTo: reviewTo,
            reivewToFullName: userInfoTo?.fullName,
            reivewToImage: userInfoTo?.image,
            reviewText: resp[i].data?.data?.vc?.credentialSubject?.data?.reviewText,
            reviewType: resp[i].data?.data?.vc?.credentialSubject?.data?.reviewType,

            dateCreation: resp[i].data?.data?.vc?.credentialSubject?.receiptDate,

          })
        }
      }
    
    
  }


  res
    .status(200)
    .json({
      message: 'All ok',
      data: {responseFinalle, resp}
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
    name: 'DONS Collection Review',
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
    return
  }

  res
    .status(200)
    .json({
      message: 'Review NFT VC uploaded to IPFS',
      data: { metadata, ipfsHash },
    })
})




// Start the server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
