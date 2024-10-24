import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react'
import detectEthereumProvider from '@metamask/detect-provider'
import { JsonRpcSigner, Network, Web3Provider } from '@ethersproject/providers'
import { ALLOWED_CHAIN_ID, NFT_CONTRACT } from '../constants'
import { BigNumber } from 'ethers'
import {
  checkIsAdmin,
  getAllNftsInfo,
  getUserNftUris,
  isNftHolder,
} from '../contractFuncs'
import axios from 'axios'
import { redirect } from 'react-router-dom'
import { eraseCookie, getCookie, setCookie } from '../pages/AuthPage'
import { getCertificatesQueue, getReviewsQueue } from '../api'
import { DATA, UserProfile } from '../types'
import { toast } from 'react-toastify'

// Define types for the context state
interface AppContextProps {
  account: string | null
  connectWallet: () => Promise<void>
  name: string
  setName: (name: string) => void
  email: string
  setEmail: (email: string) => void
  bio: string
  setBio: (bio: string) => void
  signer: JsonRpcSigner | null
  setSigner: (signer: JsonRpcSigner) => void
  network: Network | null
  setNetwork: (network: Network) => void
  isAdmin: boolean | null
  setIsAdmin: (isAdmin: boolean) => void
  isHolder: boolean | null
  setIsHolder: (isHolder: boolean) => void
  myNftData: any
  setMyNftData: (nftData: any) => void
  certificatesData: any
  setCertificatesData: (nftData: any) => void
  reviewsData: any
  setReviewsData: (nftData: any) => void
  myMainNft?: null | UserProfile
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
  setIsAdmin: () => {},
  isHolder: null,
  setIsHolder: () => {},
  myNftData: null,
  setMyNftData: () => {},
  certificatesData: null,
  setCertificatesData: () => {},
  reviewsData: null,
  setReviewsData: () => {},
  myMainNft: null,
})

interface AppProviderProps {
  children: ReactNode
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null)
  const [name, setName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [bio, setBio] = useState<string>('')

  const [provider, setProvider] = useState<Web3Provider | null>(null)
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null)
  const [network, setNetwork] = useState<Network | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [isHolder, setIsHolder] = useState<boolean | null>(null)
  const [myNftData, setMyNftData] = useState<any | null>(null)
  const [myMainNft, setMyMainNft] = useState<any | null>(null)

  const [certificatesData, setCertificatesData] = useState<any | null>(null)
  const [reviewsData, setReviewsData] = useState<any | null>(null)

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

    window.location.href = '/'
  }

  const getAccounts = async () => {
    const provider = setupProvider()
    const accounts: string[] = await provider.send('eth_accounts', [])
    setAccount(accounts[0])
    return accounts
  }

  const getIsHolder = useCallback(async () => {
    if (account) {
      const isHolder = await isNftHolder(account)
      setIsHolder(isHolder)
    }
  }, [account])

  useEffect(() => {
    if (account && myNftData) {
      console.log('MY MAIN NFT', myNftData)

      console.log(
        'DEBUG',
        (myNftData.data?.responseFinalle as DATA[]).find(
          (item) =>
            item &&
            item?.walletAddr &&
            account?.toLowerCase() === item?.walletAddr.toLowerCase() &&
            item?.type === 'MAIN',
        ),
      )
      setMyMainNft(
        (myNftData.data?.responseFinalle as DATA[]).find(
          (item) =>
            item &&
            item?.walletAddr &&
            account?.toLowerCase() === item?.walletAddr.toLowerCase() &&
            item?.type === 'MAIN',
        ),
      )
    }
  }, [account, myNftData])

  const getAllNftsInfoMain = useCallback(async () => {
    let responseData: any = null

    try {
      if (isAdmin) {
        const data = await getAllNftsInfo()

        const preparedData = data.map((item) => item.tokenUri)

        const response = await axios.post(
          'http://localhost:5000/api/getIpfsInfo',
          { ipfsLink: preparedData },
        )
        responseData = response.data

        setMyNftData(responseData)
      } else if (account) {
        const data = await getUserNftUris(account)

        const preparedData = data?.tokenUris

        const response = await axios.post(
          'http://localhost:5000/api/getIpfsInfo',
          { ipfsLink: preparedData },
        )
        responseData = response.data

        setMyNftData(responseData)
      }
    } catch (error) {
      toast.error(`BACKEND ERROR ${error}`)
      return
    }
  }, [isAdmin, account])

  const getQueuesData = useCallback(async () => {
    const dataCertificates = await getCertificatesQueue()
    const dataReviews = await getReviewsQueue()

    setReviewsData(dataReviews)
    setCertificatesData(dataCertificates)

    try {
    } catch (error) {
      toast.error('BACKEND ERROR')
      return
    }
  }, [])

  // Check if MetaMask is connected on app load
  useEffect(() => {
    if (window.ethereum) {
      const checkConnection = async () => {
        const provider = setupProvider()
        if (provider) {
          const accounts = await provider.send('eth_accounts', [])
          if (accounts.length > 0) {
            if (accounts.length > 0) {
              setAccount(accounts[0])
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

            if (!account) {
              // window.location.href ='/auth'
            }

            // eraseCookie('redirectedAuth')
          }
        }
      }

      checkConnection()

      // setTimeout(()=> {
      if (!account && !getCookie('redirectedAuth')) {
        setCookie('redirectedAuth', 'true', 1)
        // window.location.href = '/auth'
      }

      getQueuesData()
    } else {
      if (!window.location.href.includes('setup-extension')) {
        window.location.href = '/setup-extension'
      }
    }
  }, [])

  useEffect(() => {
    getAllNftsInfoMain()
  }, [isAdmin])

  useEffect(() => {
    getIsHolder()
    // getAllNftsInfo()
  }, [account])

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
        signer,
        setSigner,
        network,
        setNetwork,
        isAdmin,
        setIsAdmin,
        isHolder,
        setIsHolder,
        myNftData,
        setMyNftData,
        reviewsData,
        setReviewsData,
        certificatesData,
        setCertificatesData,
        myMainNft,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

// Export the useContext hook for easy usage
export const useAppContext = () => React.useContext(AppContext)
