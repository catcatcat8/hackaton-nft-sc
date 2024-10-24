import React, { useState } from 'react'
import { TextField, Button, Typography, Box } from '@mui/material'
import { useAppContext } from '../context/AppContext'
import { ethers } from 'ethers'

import {
  ALLOWED_CHAIN_ID,
  REACT_APP_BACKEND_BASE_URL,
  IPFS_BASE_LINK,
  NFT_CONTRACT,
  PINATA,
  SCANNER_LINK,
} from '../constants'
import { Field, Form, Formik } from 'formik'
import axios from 'axios'

import { toast } from 'react-toastify'

interface IMainNFTForm {
  walletAddr: string
  ipfsLink: string
  fullName: string
  skills: string
  jobTitle: string
  dateOfHire: string
}

const Profile: React.FC = () => {
  const { account, isAdmin, signer } = useAppContext()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0])
    }
  }

  const initialValues: IMainNFTForm = {
    walletAddr: '',
    ipfsLink: '',
    fullName: '',
    skills: '',
    jobTitle: '',
    dateOfHire: '',
  }

  function validateWallet(wallet: string) {
    let error
    if (!ethers.utils.isAddress(wallet)) {
      error = 'Invalid wallet address'
    }
    return error
  }

  const handleSubmit = async (values: IMainNFTForm) => {
    toast.success('Начало операции')
    if (!isAdmin) {
      toast.error('NOT ADMIN!')
      return
    }

    if (!selectedFile) {
      toast.error('NO IMAGE TO UPLOAD')
      return
    }

    const CURRENT_NFT_ID = await NFT_CONTRACT.counter()
    const sigToSign = `auth:ethr:${ALLOWED_CHAIN_ID}:${NFT_CONTRACT.address.toLowerCase()}:${CURRENT_NFT_ID.toString()}`

    let signature: string = ''
    try {
      signature = await signer!.signMessage(sigToSign)
    } catch (error) {
      toast.error('SIG ERROR')
      return
    }

    let imageLink: string = ''
    try {
      const upload = await PINATA.upload.file(selectedFile)
      imageLink = IPFS_BASE_LINK + upload.IpfsHash
      toast.success(
        `hash загруженной на ипфс картинки ${IPFS_BASE_LINK + upload.IpfsHash}`
      )
    } catch (error) {
      toast.error('IPFS ERROR :(')
      return
    }

    let responseData: any = null
    try {
      const response = await axios.post(
        `${REACT_APP_BACKEND_BASE_URL}/api/createMainVC`,
        {
          imageLink: imageLink,
          workerAddr: values.walletAddr,
          skills: values.skills,
          jobTitle: values.jobTitle,
          fullName: values.fullName,
          dateOfHire: values.dateOfHire,
          challengeSig: signature,
        }
      )
      responseData = response.data
      toast.success(
        `BACKEND SUCCESS: ${IPFS_BASE_LINK + responseData.data.ipfsHash}`
      )
    } catch (error) {
      toast.error('BACKEND ERROR')
      return
    }

    if (responseData) {
      try {
        const tx = await NFT_CONTRACT.connect(signer!).mint(
          values.walletAddr,
          responseData.data.ipfsHash
        )
        await tx.wait()
        toast.success(`TX SUCCESS: ${SCANNER_LINK + tx.hash}`)

        window.location.reload()
      } catch (error) {
        console.log(error)
        toast.error('WHY REJECT??')
      }
    }
  }

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
          <Formik
            initialValues={initialValues}
            // validationSchema={validationSchema} // IF NOT COMMENTED SUBMIT NOT WORKS
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <Field
                  as={TextField}
                  name="walletAddr"
                  label="Worker address"
                  fullWidth
                  margin="normal"
                  validate={validateWallet}
                  error={touched.walletAddr && !!errors.walletAddr}
                  helperText={touched.walletAddr && errors.walletAddr}
                  required
                />
                <Field
                  as={TextField}
                  name="fullName"
                  label="Full name"
                  fullWidth
                  margin="normal"
                  error={touched.fullName && !!errors.fullName}
                  helperText={touched.fullName && errors.fullName}
                  required
                />
                <Field
                  as={TextField}
                  name="jobTitle"
                  label="Job title"
                  fullWidth
                  margin="normal"
                  error={touched.jobTitle && !!errors.jobTitle}
                  helperText={touched.jobTitle && errors.jobTitle}
                  required
                />
                <Field
                  as={TextField}
                  name="dateOfHire"
                  label="Date of hire"
                  fullWidth
                  margin="normal"
                  error={touched.dateOfHire && !!errors.dateOfHire}
                  helperText={touched.dateOfHire && errors.dateOfHire}
                  required
                />
                {/* <Field
                  as={TextField}
                  name="ipfsLink"
                  label="IPFS metadata link"
                  type="email"
                  fullWidth
                  margin="normal"
                  // error={touched.ipfsLink && !!errors.ipfsLink}
                  // helperText={touched.ipfsLink && errors.ipfsLink}
                  required
                /> */}
                {/* <Field
                  as={TextField}
                  name="ipfsLink"
                  label="IPFS metadata link"
                  fullWidth
                  multiline
                  margin="normal"
                  validate={validateIpfs}
                  error={touched.ipfsLink && !!errors.ipfsLink}
                  helperText={touched.ipfsLink && errors.ipfsLink}
                  required
                /> */}
                <Field
                  as={TextField}
                  name="skills"
                  label="Skills"
                  fullWidth
                  multiline
                  rows={4}
                  margin="normal"
                />
                <label className="form-label"> Choose Image </label>
                <input type="file" onChange={changeHandler} />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                >
                  Create NFT
                </Button>
              </Form>
            )}
          </Formik>
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
