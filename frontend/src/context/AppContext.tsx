import React, { createContext, useState, useEffect, ReactNode } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import { JsonRpcSigner, Network, Web3Provider } from '@ethersproject/providers';
import { ALLOWED_CHAIN_ID, NFT_CONTRACT } from '../constants';

// Define types for the context state
interface AppContextProps {
  account: string | null;
  connectWallet: () => Promise<void>;
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  bio: string;
  setBio: (bio: string) => void;
  signer: JsonRpcSigner | null;
  setSigner: (signer : JsonRpcSigner) => void;
  network: Network | null;
  setNetwork: (network: Network)=> void;
  isAdmin: boolean | null;
  setIsAdmin: (isAdmin: boolean)=> void;

}

// Create the context with default values
const AppContext = createContext<AppContextProps>({
  account: null,
  connectWallet: async () => {},
  name: '',
  setName: () => {},
  email: '',
  setEmail: () => {},
  bio: '',
  setBio: () => {},
  setSigner: () => {},
  signer: null,
  network: null,
  setNetwork: () => {},
  isAdmin: null,
  setIsAdmin: () =>{}
});

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [bio, setBio] = useState<string>('');

  const [provider, setProvider] = useState<Web3Provider | null>(null)
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null)
  const [network, setNetwork] = useState<Network | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  const setupProvider = () => {
    if (!window.ethereum) throw Error('Could not find Metamask extension')
    if (provider) return provider

    const newProvider = new Web3Provider(window.ethereum)
    console.log(newProvider);
    
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

  // Check if MetaMask is connected on app load
  useEffect(() => {
    const checkConnection = async () => {
        const provider = setupProvider()
        if (provider) {
        const accounts = await provider.send('eth_accounts', []);
        if (accounts.length > 0) {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
          const signer: JsonRpcSigner = await provider.getSigner()
          const network: Network = await provider.getNetwork()
  
          setNetwork(network)
  
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
  
  
          setAccount(accounts[0])
          setSigner(signer)
      
          const isAdmin = await checkIsAdmin(accounts[0])
          setIsAdmin(isAdmin)
        } 
      }

    };

  

    checkConnection();
  }, []);

  return (
    <AppContext.Provider
      value={{
        account,
        connectWallet,
        name,
        setName,
        email,
        setEmail,
        bio,
        setBio,
        signer, setSigner,
        network, setNetwork,
        isAdmin, setIsAdmin
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Export the useContext hook for easy usage
export const useAppContext = () => React.useContext(AppContext);
