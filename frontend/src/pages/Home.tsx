import React from 'react';
import { Typography } from '@mui/material';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';

const Home: React.FC = () => {
  const { account } = useAppContext();

  const onTestBackend = async() => {
    try {
      const response = await axios.post('http://localhost:5000/api/profile', {kek: 123});
      console.log('Profile Submitted:', response.data);
    } catch (error) {
      console.error('Error submitting profile:', error);
    }
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
