import React, { useEffect, useState } from 'react'
import { AppBar, Toolbar, Typography, Container, Button } from '@mui/material'
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'
import detectEthereumProvider from '@metamask/detect-provider'
import Home from './pages/Home'
import Profile from './pages/Profile'
import About from './pages/About'
import {
  ExternalProvider,
  JsonRpcSigner,
  Network,
  Web3Provider,
} from '@ethersproject/providers'
import { ethers } from 'ethers'
import { ALLOWED_CHAIN_ID, NFT_ADDR, NFT_CONTRACT } from './constants'

declare global {
  interface Window {
    ethereum: ExternalProvider
  }
}

const App: React.FC = () => {
  const [provider, setProvider] = useState<Web3Provider | null>(null)
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null)
  const [account, setAccount] = useState<string | null>(null)
  const [network, setNetwork] = useState<Network | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  const setupProvider = () => {
    if (!window.ethereum) throw Error('Could not find Metamask extension')
    if (provider) return provider

    const newProvider = new Web3Provider(window.ethereum)
    setProvider(newProvider)

    return newProvider
  }

  const connectWallet = async () => {
    const provider = setupProvider()
    const accounts: string[] = await provider.send('eth_requestAccounts', [])
    const network: Network = await provider.getNetwork()
    if (network.chainId != ALLOWED_CHAIN_ID) {
      try {
        await provider.send('wallet_switchEthereumChain', [
          { chainId: ALLOWED_CHAIN_ID },
        ])
      } catch (switchError) {
        await provider.send('wallet_addEthereumChain', [
          {
            chainId: '0x61',
            chainName: 'Smart Chain - Testnet',
            rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
            blockExplorerUrls: ['https://testnet.bscscan.com'],
            nativeCurrency: {
              symbol: 'BNB',
              decimals: 18,
            },
          },
        ])
      }
    }
    const signer: JsonRpcSigner = provider.getSigner()
    setNetwork(network)
    setAccount(accounts[0])
    setSigner(signer)

    const isAdmin = await checkIsAdmin(accounts[0])
    setIsAdmin(isAdmin)
  }

  const getAccounts = async () => {
    const provider = setupProvider()
    const accounts: string[] = await provider.send('eth_accounts', [])
    setAccount(accounts[0])
    return accounts
  }

  const checkIsAdmin = async (user: string): Promise<boolean> => {
    const adminRole = await NFT_CONTRACT.ADMIN_ROLE()
    return await NFT_CONTRACT.hasRole(adminRole, user)
  }

  return (
    <Router>
      <div>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              My DApp with MetaMask
            </Typography>
            <nav>
              <Link
                to="/"
                style={{
                  color: '#fff',
                  textDecoration: 'none',
                  marginRight: '10px',
                }}
              >
                Home
              </Link>
              <Link
                to="/profile"
                style={{
                  color: '#fff',
                  textDecoration: 'none',
                  marginRight: '10px',
                }}
              >
                Profile
              </Link>
              <Link
                to="/admin"
                style={{ color: '#fff', textDecoration: 'none' }}
              >
                Admin
              </Link>
              <Link
                to="/about"
                style={{ color: '#fff', textDecoration: 'none' }}
              >
                About
              </Link>
            </nav>
            {account ? (
              <Typography variant="body1">{`Connected: ${account.substring(
                0,
                6
              )}...${account.substring(account.length - 4)}`}</Typography>
            ) : (
              <Button color="inherit" onClick={connectWallet}>
                Connect Wallet
              </Button>
            )}
          </Toolbar>
        </AppBar>
        <Container>
          <Routes>
            <Route path="/" element={<Home account={account} isAdmin={isAdmin} />} />
            <Route path="/profile" element={<Profile account={account} signer={signer} isAdmin={isAdmin} />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Container>
      </div>
    </Router>
  )
}

export default App
