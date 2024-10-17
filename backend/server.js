// server.js
const express = require('express');
const cors = require('cors');
const { ethers } = require("ethers");
const { PinataSDK } = require('pinata-web3')
require('dotenv').config()
const app = express();

// const JsonLdDocumentLoader =require('jsonld-document-loader')

// const cred = require('credentials-context')
// import * as vc from '@digitalbazaar/vc'
// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON bodies'

const CHAIN_ID = 97
const DID_PREFIX = `did:ethr:${CHAIN_ID}:`

const PRIVATE_KEY_BACKEND = '9ba09d2e2a9ca98f680977ed6b00ac05e5558b0fa29f3f3d97f5a75ce8c11cc5'
const ISSUER_WALLET = new ethers.Wallet(PRIVATE_KEY_BACKEND)

const PROVIDER = new ethers.providers.JsonRpcProvider('https://bsc-testnet.blockpi.network/v1/rpc/public')

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL
})

// Example API Route: Submit Profile
app.post('/api/profile', (req, res) => {
  const { name, email, bio } = req.body;

  // Here you could handle the data, save it to a database, etc.
  console.log('Profile Submitted:', { name, email, bio });

  // Send a response
  res.status(200).json({ message: 'Profile submitted successfully', data: { name, email, bio } });
});


app.post('/api/createMainVC', async (req, res) => {
    const { imageLink, workerAddr, skills, jobTitle, fullName, dateOfHire } = req.body;
  
    // Here you could handle the data, save it to a database, etc.
    console.log('createMainVC submitted:', { imageLink, workerAddr, skills, jobTitle, fullName, dateOfHire });

    const now = (await PROVIDER.getBlock('latest')).timestamp

    const metadata = {
      name: "Крипто$лоня₽ы Collection Digital Profile",
      image: imageLink,
      description: "Metadata of a company employee's digital profile.",
      vc: {
        type: [
            "VerifiableCredential"
        ],
        issuer: {
            id: DID_PREFIX + ISSUER_WALLET.address
        },
        issuanceDate: now.toString(),
        credentialSubject: {
            id: DID_PREFIX + workerAddr, 
            data: {
                type: "MAIN",
                fullName: fullName,
                jobTitle: jobTitle,
                skills: skills,
                dateOfHire: dateOfHire
            }
        }
      }
    }

    const signature = await ISSUER_WALLET.signMessage(JSON.stringify(metadata))
    metadata["issuerSignature"] = signature
    
    const blob = new Blob([JSON.stringify(metadata, null, 2)], {
      type: 'application/json'
    });
    const file = new File([blob], "json", { type: "text/plain"})
    const upload = await pinata.upload.file(file);

    const ipfsHash = upload.IpfsHash
  
    // Send a response
    res.status(200).json({ message: 'Profile submitted successfully', data: { metadata, ipfsHash } });
  });

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
