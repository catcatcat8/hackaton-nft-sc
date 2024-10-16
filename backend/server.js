// server.js
const express = require('express');
const cors = require('cors');
const app = express();

// const JsonLdDocumentLoader =require('jsonld-document-loader')

// const cred = require('credentials-context')
// import * as vc from '@digitalbazaar/vc'
// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON bodies'

// Example API Route: Submit Profile
app.post('/api/profile', (req, res) => {
  const { name, email, bio } = req.body;

  // Here you could handle the data, save it to a database, etc.
  console.log('Profile Submitted:', { name, email, bio });

  // Send a response
  res.status(200).json({ message: 'Profile submitted successfully', data: { name, email, bio } });
});


app.post('/api/vcCreate', (req, res) => {
    const { name, email, bio } = req.body;
  
    // Here you could handle the data, save it to a database, etc.
    console.log('Profile Submitted:', { name, email, bio });
  
    // Send a response
    res.status(200).json({ message: 'Profile submitted successfully', data: { name, email, bio } });


    
  });

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
