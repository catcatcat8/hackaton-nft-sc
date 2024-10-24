import React, { useEffect } from 'react'
import { Box, Typography, Button, Paper, Avatar } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

export function setCookie(name: string, value: string, days: number) {
  var expires = ''
  if (days) {
    var date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    expires = '; expires=' + date.toUTCString()
  }
  document.cookie = name + '=' + (value || '') + expires + '; path=/'
}
export function getCookie(name: string) {
  var nameEQ = name + '='
  var ca = document.cookie.split(';')
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i]
    while (c.charAt(0) == ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}
export function eraseCookie(name: string) {
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
}

// Sample warning image (you can replace this with your own image URL)
const warningImage =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJZaVpfhv3kgZA46GoqfVNIFhR6pXIdX4_Rg&s'

const AuthPage: React.FC = () => {
  const { account, connectWallet, isAdmin, isHolder, signer } = useAppContext()

  useEffect(() => {
    if (signer) {
      // window.location.href='/'
    }
  }, [signer])

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
          alt="Подклчите кошелек"
          sx={{
            width: 150,
            height: 150,
            marginBottom: '16px',
            margin: '0 auto',
          }}
        />

        {/* Error Text */}
        <Typography variant="h3" color="error" gutterBottom>
          Подключите кошелек
        </Typography>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Для доступа к приложению необходимо подключиться к кошельку
        </Typography>

        {/* Go Back Button */}
        <Button
          variant="contained"
          color="primary"
          onClick={connectWallet}
          sx={{ marginTop: '16px' }}
        >
          Подключить кошелек
        </Button>
      </Paper>
    </Box>
  )
}

export default AuthPage
