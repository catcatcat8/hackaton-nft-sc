import React from 'react';
import { Typography } from '@mui/material';

interface ProfileProps {
  account: string | null;
}

const Profile: React.FC<ProfileProps> = ({ account }) => {
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Profile Page
      </Typography>
      {account ? (
        <Typography variant="body1">Your Wallet Address: {account}</Typography>
      ) : (
        <Typography variant="body1">Please connect your wallet to see your profile information.</Typography>
      )}
    </div>
  );
};

export default Profile;
