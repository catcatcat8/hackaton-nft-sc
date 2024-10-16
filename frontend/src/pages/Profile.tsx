import React from 'react';
import { TextField, Button, Typography, Box } from '@mui/material';
import { useAppContext } from '../context/AppContext';

const Profile: React.FC = () => {
  const { account, name, setName, email, setEmail, bio, setBio } = useAppContext();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Form Submitted:', { name, email, bio });
  };

  return (
    <Box sx={{ maxWidth: '500px', margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Profile Page
      </Typography>
      {account ? (
        <>
          <Typography variant="body1" gutterBottom>
            Your Wallet Address: {account}
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Name"
              fullWidth
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Bio"
              fullWidth
              multiline
              rows={4}
              margin="normal"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </form>
        </>
      ) : (
        <Typography variant="body1">Please connect your wallet to see your profile information.</Typography>
      )}
    </Box>
  );
};

export default Profile;
