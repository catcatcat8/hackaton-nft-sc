import React from 'react';
import { AppBar, Toolbar, Typography, Container, Button } from '@mui/material';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import Home from './pages/Home';
import Profile from './pages/Profile';
import About from './pages/About';
import './App.css';

const App: React.FC = () => {
  const { account, connectWallet, isAdmin } = useAppContext();

  return (
    <Router>
      <div>
        <AppBar position="static" sx={{backgroundColor:'black'}}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, color:'#d79c05'}}>
              STRUACHKA
            </Typography>
            <nav>
              <Link to="/" style={{ color: '#d79c05', textDecoration: 'none', marginRight: '10px' }}>
                Home
              </Link>
              {isAdmin && (  <Link to="/profile" style={{ color: '#d79c05', textDecoration: 'none', marginRight: '10px' }}>
                Profile
              </Link>
            )}
            
              <Link to="/about" style={{ color: '#d79c05', textDecoration: 'none', marginRight:'15px'}}>
                About
              </Link>
            </nav>
            {account ? (
              <Typography variant="body1">{`Connected: ${account.substring(0, 6)}...${account.substring(account.length - 4)}`}</Typography>
            ) : (
              <Button className="button" color="primary" onClick={connectWallet} variant="outlined" >
                Connect Wallet
              </Button>
            )}
          </Toolbar>
        </AppBar>
        <Container>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
};

export default App;
