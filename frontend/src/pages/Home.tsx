import React from 'react';
import { Typography } from '@mui/material';

interface HomeProps {
  account: string | null;
  isAdmin: boolean | null;
}

const Home: React.FC<HomeProps> = ({ account, isAdmin }) => {
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
      {isAdmin ? (
        <Typography variant="body1">IT'S ADMIN, ADMIN PANEL FOR HIM</Typography>
      ) : (
        <Typography variant="body1">COMMON WORKER</Typography>
      )}
    </div>
  );
};

export default Home;
