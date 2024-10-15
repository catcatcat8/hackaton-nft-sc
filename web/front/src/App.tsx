import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Container, Button } from '@mui/material';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import detectEthereumProvider from '@metamask/detect-provider';
import Home from './pages/Home';
import Profile from './pages/Profile';
import About from './pages/About';

const App: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);

  // Detect MetaMask and request wallet connection
  const connectWallet = async () => {
    const provider: any = await detectEthereumProvider();
    if (provider) {
      try {
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } catch (error) {
        console.error('User denied wallet connection');
      }
    } else {
      console.error('MetaMask not found. Please install it.');
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      const provider: any = await detectEthereumProvider();
      if (provider) {
        const accounts = await provider.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      }
    };

    checkConnection();
  }, []);

  return (
    <Router>
      <div>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              My DApp with MetaMask
            </Typography>
            <nav>
              <Link to="/" style={{ color: '#fff', textDecoration: 'none', marginRight: '10px' }}>
                Home
              </Link>
              <Link to="/profile" style={{ color: '#fff', textDecoration: 'none', marginRight: '10px' }}>
                Profile
              </Link>
              <Link to="/about" style={{ color: '#fff', textDecoration: 'none' }}>
                About
              </Link>
            </nav>
            {account ? (
              <Typography variant="body1">{`Connected: ${account.substring(0, 6)}...${account.substring(account.length - 4)}`}</Typography>
            ) : (
              <Button color="inherit" onClick={connectWallet}>
                Connect Wallet
              </Button>
            )}
          </Toolbar>
        </AppBar>
        <Container>
          <Routes>
            <Route path="/" element={<Home account={account} />} />
            <Route path="/profile" element={<Profile account={account} />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
};

export default App;
