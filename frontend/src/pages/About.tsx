import React from 'react';
import { Typography } from '@mui/material';
import { useAppContext } from '../context/AppContext';

const Home: React.FC = () => {
  const { account } = useAppContext();

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
