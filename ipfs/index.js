const { PinataSDK } = require("pinata-web3")
const fs = require("fs")
require("dotenv").config()

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL
})

async function upload(){
  try {
    const blob = new Blob([fs.readFileSync("drill-monkey-01.jpg.webp")]);
    const file = new File([blob], "drill-monkey-01.jpg.webp", { type: "text/plain"})
    const upload = await pinata.upload.file(file);
    var nft = {
        "name": "coolMonkey",
        "description": "UGAGAGAGGAGA...",
        "image": "https://ipfs.io/ipfs/" + upload["IpfsHash"],
        "extraData": "https://our_backend.com/1.json"
    };
    const blob1 = new Blob([JSON.stringify(nft, null, 2)], {
        type: 'application/json'
    });
    const file1 = new File([blob1], "json", { type: "text/plain"})
    const upload1 = await pinata.upload.file(file1);
    
    console.log(upload1)
  } catch (error) {
    console.log(error)
  }
}

upload()