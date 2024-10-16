import React, { useState } from 'react'
import { TextField, Button, Typography, Box } from '@mui/material'
import { useAppContext } from '../context/AppContext'
import * as Yup from 'yup'
import { ethers } from 'ethers'
import * as isIPFS from 'is-ipfs'
import { IPFS_BASE_LINK, NFT_CONTRACT, PINATA, SCANNER_LINK } from '../constants'
import { Field, Form, Formik } from 'formik'
import axios from 'axios'
import { PinataSDK } from 'pinata-web3'
import manPicture from '../man_picture.jpg'

interface IMainNFTForm {
  walletAddr: string
  ipfsLink: string
  fullName: string
  skills: string
  jobTitle: string
  dateOfHire: string
}

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

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const initialValues: IMainNFTForm = {
    walletAddr: '',
    ipfsLink: '',
    fullName: '',
    skills: '',
    jobTitle: '',
    dateOfHire: '',
  }

  const validationSchema = Yup.object({
    walletAddr: Yup.string().required('Worker wallet is required'),
    ipfsLink: Yup.string().required('Email is required'),
    fullName: Yup.string().required('Full name is required'),
    skills: Yup.string().required('Skills are required'),
    jobTitle: Yup.string().required('Job title is required'),
    dateOfHire: Yup.string().required('Date of hire'),
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

  const handleSubmit = async (values: IMainNFTForm) => {
    alert('ZXC?')
    if (!isAdmin) {
      alert('NOT ADMIN!')
      return
    }

    if (!selectedFile) {
      alert('NO IMAGE TO UPLOAD')
      return
    }

    // if (!ethers.utils.isAddress(values.walletAddr)) {
    //   alert('WTF? ITS NOT ETH ADDR')
    //   return
    // }
    // if (!isIPFS.cid(values.ipfsLink)) {
    //   alert('WTF? NOT IPFS LINK')
    //   return
    // }
    console.log(0);

    try {
      const upload = await PINATA.upload.file(selectedFile)
      console.log(5);

      alert(`hash загруженной на ипфс картинки ${IPFS_BASE_LINK + upload.IpfsHash}`)
    } catch (error) {
      alert('IPFS ERROR :(')
    }
    console.log(6);

    try {
      console.log('signer', signer)

      try {
        const response = await axios.post(
          'http://localhost:5000/api/vcCreate',
          {}
        )
        // console.log('Success:', response.link);
      } catch (error) {
        console.error('Error vc:', error)
      }

      const tx = await NFT_CONTRACT.connect(signer!).mint(
        values.walletAddr,
        values.ipfsLink
      )

      await tx.wait()
      alert(`SUCCESS: ${SCANNER_LINK + tx.hash}`)
    } catch (error) {
      alert('WHY REJECT??')
    }
    console.log('Form Submitted:', values)
    // Further logic (e.g., sending data to blockchain or backend)
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
            onSubmit={(handleSubmit)}
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
