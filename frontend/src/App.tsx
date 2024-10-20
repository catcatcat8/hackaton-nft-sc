import React from 'react';
import { AppBar, Toolbar, Typography, Container, Button } from '@mui/material';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import Home from './pages/Home';
import Profile from './pages/Profile';
import About from './pages/About';
import AddEntityPage from './pages/AddEntityPage';
import MyDataPage from './pages/MyData';
import UserProfilePage from './pages/UserProfilePage';
import SetupPage from './pages/SetupPage';
import AuthPage from './pages/AuthPage';

const App: React.FC = () => {
  const { account, connectWallet, isAdmin, isHolder } = useAppContext();

  return (
    <Router>
      <div>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Diamond Enterprise System
            </Typography>
            <nav>
            <Link to="/" style={{ color: '#fff', textDecoration: 'none', marginRight: '10px' }}>
                Главная
              </Link>
              {isHolder && (  <Link to="/add-entity" style={{ color: '#fff', textDecoration: 'none', marginRight: '10px' }}>
                Добавить информацию
              </Link>)}
          
          
              {isAdmin && (  <Link to="/profile" style={{ color: '#fff', textDecoration: 'none', marginRight: '10px' }}>
                Добавить сотрудника
              </Link>
            )}
           
              {isHolder && (  <Link to="/my-data" style={{ color: '#fff', textDecoration: 'none', marginRight: '10px' }}>
                Мои данные
              </Link>)}
            

            </nav>
            {account ? (
              <Typography variant="body1">{`Connected: ${account.substring(0, 6)}...${account.substring(account.length - 4)}`}</Typography>
            ) : (
              <Button color="inherit" onClick={connectWallet}>
                Подключить кошелек
              </Button>
            )}
          </Toolbar>
        </AppBar>
        <Container>
          <Routes>
            <Route path="/" element={<UserProfilePage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/about" element={<About />} />
            <Route path="/add-entity" element={<AddEntityPage />} /> {/* New Route */}
            <Route path="/my-data" element={<MyDataPage />} /> {/* New Route */}
            <Route path="/setup-extension" element={<SetupPage />} /> {/* New Route */}
            <Route path="/setup-extension" element={<SetupPage />} /> {/* New Route */}
            <Route path="/auth" element={<AuthPage />} />
            
          </Routes>
        </Container>
      </div>
    </Router>
  );
};

export default App;
