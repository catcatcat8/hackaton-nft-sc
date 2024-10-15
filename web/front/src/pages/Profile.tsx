import React from 'react';
import { TextField, Button, Typography, Box } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

interface ProfileProps {
  account: string | null;
}

// Validation schema using Yup
const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email format').required('Email is required'),
  bio: Yup.string(),
});

const Profile: React.FC<ProfileProps> = ({ account }) => {
  const initialValues = {
    name: '',
    email: '',
    bio: '',
  };

  const handleSubmit = (values: any) => {
    console.log('Form Submitted:', values);
    // Further logic (e.g., sending data to blockchain or backend)
  };

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
                  name="name"
                  label="Name"
                  fullWidth
                  margin="normal"
                  error={touched.name && !!errors.name}
                  helperText={touched.name && errors.name}
                  required
                />
                <Field
                  as={TextField}
                  name="email"
                  label="Email"
                  type="email"
                  fullWidth
                  margin="normal"
                  error={touched.email && !!errors.email}
                  helperText={touched.email && errors.email}
                  required
                />
                <Field
                  as={TextField}
                  name="bio"
                  label="Bio"
                  fullWidth
                  multiline
                  rows={4}
                  margin="normal"
                />
                <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                  Submit
                </Button>
              </Form>
            )}
          </Formik>
        </>
      ) : (
        <Typography variant="body1">Please connect your wallet to see your profile information.</Typography>
      )}
    </Box>
  );
};

export default Profile;
