// src/components/QrCodeGenerator.tsx

import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button, TextField, Box, Typography } from '@mui/material'

import { TelegramIcon, TelegramShareButton, VKShareCount } from 'react-share'

const QrCodeGenerator: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('')
  const [qrValue, setQrValue] = useState<string>('')

  // Function to generate the QR code
  const handleGenerate = () => {
    setQrValue(inputValue)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mt: 3,
      }}
    >
      <TextField
        label="Введите ссылку для генерации"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={handleGenerate}>
        Сгенерировать ссылку
      </Button>

      {/* QR code will be displayed here */}
      {qrValue && (
        <>
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <QRCodeSVG value={qrValue} size={256} />
          </Box>
          <Box
            sx={{
              display: 'flex',
              width: '100%',
              justifyContent: 'center',
              justifyItems: 'center',
            }}
          >
            <Box sx={{ mt: 2 }}>
              <TelegramShareButton url={inputValue}>
                <>
                  <TelegramIcon size={32} />
                  <Typography>Отправить в телеграм</Typography>
                </>
              </TelegramShareButton>
            </Box>
          </Box>
        </>
      )}
    </Box>
  )
}

export default QrCodeGenerator
