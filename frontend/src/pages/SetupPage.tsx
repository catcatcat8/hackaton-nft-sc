import React from 'react'
import { Box, Typography, Button, Paper, Avatar } from '@mui/material'
import { useNavigate } from 'react-router-dom'

// Sample warning image (you can replace this with your own image URL)
const warningImage =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJZaVpfhv3kgZA46GoqfVNIFhR6pXIdX4_Rg&s'

const SetupPage: React.FC = () => {
  const navigate = useNavigate()

  const handleGoBack = () => {
    window.location.href = 'https://metamask.io/download/'
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: '24px',
      }}
    >
      <Paper elevation={3} sx={{ padding: '40px', textAlign: 'center' }}>
        {/* Warning Image */}
        <Avatar
          src={warningImage}
          alt="Установите метамаск"
          sx={{
            width: 150,
            height: 150,
            marginBottom: '16px',
            margin: '0 auto',
          }}
        />

        {/* Error Text */}
        <Typography variant="h3" color="error" gutterBottom>
          Нет приложения MetaMask
        </Typography>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Для доступа к приложению необходимо установить MetaMask
        </Typography>

        {/* Go Back Button */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleGoBack}
          sx={{ marginTop: '16px' }}
        >
          Установить
        </Button>
      </Paper>
    </Box>
  )
}

export default SetupPage
