import React from 'react';
import { Typography } from '@mui/material';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';
import { acceptCertificate, acceptReview, getCertificatesQueue, getReviewsQueue, getUserInfo } from '../api';

const Home: React.FC = () => {
  const { account } = useAppContext();

  const onTestBackend = async() => {
    console.log(await getUserInfo('0xA704ea83e43Eaa076A1F428cA8879fEA5e1f9b63'))
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Home Page
      </Typography>
      {account ? (
        <Typography variant="body1">Connected Wallet: {account}</Typography>
      ) : (
        <Typography variant="body1">Please connect your MetaMask wallet.</Typography>
      )}
   
    </div>
  );
};

export default Home;
