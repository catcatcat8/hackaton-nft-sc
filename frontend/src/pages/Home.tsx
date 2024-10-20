import React from 'react';
import { Typography } from '@mui/material';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';
import { acceptCertificate, acceptReview, getCertificatesQueue, getReviewsQueue } from '../api';

const Home: React.FC = () => {
  const { account } = useAppContext();

  const onTestBackend = async() => {
    await acceptCertificate('671459777ce30654de9ace8c')
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
      <button onClick={() => onTestBackend()}>
        KEK
      </button>
    </div>
  );
};

export default Home;
