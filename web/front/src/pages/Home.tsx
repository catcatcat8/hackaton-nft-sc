import React from 'react';
import { Typography } from '@mui/material';

interface HomeProps {
  account: string | null;
}

const Home: React.FC<HomeProps> = ({ account }) => {
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
