import React from 'react'
import { TextField, Button, Typography, Box } from '@mui/material'
import { useAppContext } from '../context/AppContext'
import * as Yup from 'yup'
import { ethers } from 'ethers'
import * as isIPFS from 'is-ipfs'
import { NFT_CONTRACT, SCANNER_LINK } from '../constants'
import { Field, Form, Formik } from 'formik'
import { toast } from 'react-toastify'

const Profile: React.FC = () => {
  const {
    account,
    name,
    setName,
    email,
    setEmail,
    bio,
    setBio,
    isAdmin,
    signer,
  } = useAppContext()

  const initialValues = {
    walletAddr: '',
    ipfsLink: '',
  }

  const validationSchema = Yup.object({
    walletAddr: Yup.string().required('Worker wallet is required'),
    ipfsLink: Yup.string().required('Email is required'),
  })

  function validateWallet(wallet: string) {
    let error
    if (!ethers.utils.isAddress(wallet)) {
      error = 'Invalid wallet address'
    }
    return error
  }

  function validateIpfs(ipfs: string) {
    let error
    if (!isIPFS.cid(ipfs)) {
      error = 'Invalid IPFS link'
    }
    return error
  }

  const handleSubmit = async (values: any) => {
    if (!isAdmin) {
      toast.error('NOT ADMIN!')
      return
    }

    // if (!ethers.utils.isAddress(values.walletAddr)) {
    //   alert('Ошибка нет адреса')
    //   return
    // }
    // if (!isIPFS.cid(values.ipfsLink)) {
    //   alert('Ошибка нет ипфс ссылки')
    //   return
    // }
    try {
      const tx = await NFT_CONTRACT.connect(signer!).mint(
        values.walletAddr,
        values.ipfsLink
      )

      await tx.wait()
      toast.success(`SUCCESS: ${SCANNER_LINK + tx.hash}`)
    } catch (error) {
      toast.error('WHY REJECT??')
    }
    // Further logic (e.g., sending data to blockchain or backend)
  }

  return (
    <Box sx={{ maxWidth: '500px', margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        User Page
      </Typography>
      {account ? (
        <>
          <Typography variant="body1" gutterBottom>
            Your Wallet Address: {account}
          </Typography>
        </>
      ) : (
        <Typography variant="body1">
          Please connect your wallet to see your profile information.
        </Typography>
      )}
    </Box>
  )
}

export default Profile
