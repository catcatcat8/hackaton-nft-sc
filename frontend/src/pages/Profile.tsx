import React from 'react';
import { TextField, Button, Typography, Box } from '@mui/material';
import { useAppContext } from '../context/AppContext';
import * as Yup from 'yup'
import { ethers } from 'ethers';
import * as isIPFS from 'is-ipfs'
import { NFT_CONTRACT, SCANNER_LINK } from '../constants';
import { Field, Form, Formik } from 'formik';
import axios from 'axios';


const Profile: React.FC = () => {
  const { account, name, setName, email, setEmail, bio, setBio, isAdmin, signer } = useAppContext();

  const initialValues = {
    walletAddr: '',
    ipfsLink: '',
  }



  const validationSchema = Yup.object({
    walletAddr: Yup.string().required('Worker wallet is required'),
    ipfsLink: Yup.string().required('Email is required'),
  })
  
  function validateWallet(wallet: string) {
    let error;
    if (!ethers.utils.isAddress(wallet)) {
      error = 'Invalid wallet address';
    }
    return error;
  }
  
  function validateIpfs(ipfs: string) {
    let error;
    if (!isIPFS.cid(ipfs)) {
      error = 'Invalid IPFS link';
    }
    return error;
  }

  const handleSubmit = async (values: any) => {
    if (!isAdmin) {
      alert('NOT ADMIN!')
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
    try {
      console.log('signer', signer)


        try {
          const response = await axios.post('http://localhost:5000/api/vcCreate', {});
          // console.log('Success:', response.link);
        } catch (error) {
          console.error('Error vc:', error);
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
            validationSchema={validationSchema}
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
                <Field
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
                />
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


  

export default Profile;