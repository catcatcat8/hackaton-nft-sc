import React from 'react';
import { Typography, Stack } from '@mui/material';
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
      <Stack paddingY={3}>
        <Typography variant="h4" gutterBottom>
          Start working with STRUACHKA
        </Typography>
        {account ? (
          <Typography variant="body1">Connected Wallet: {account}</Typography>
        ) : (
          <Typography variant="body1">Please connect your MetaMask wallet.</Typography>
        )}
        <button onClick={() => onTestBackend()}>
          KEK
        </button>
      </Stack>
    </div>
  );
};

export default Home;
