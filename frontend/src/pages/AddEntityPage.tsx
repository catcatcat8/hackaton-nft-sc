import React, { useState } from 'react'
import {
  Box,
  Button,
  Switch,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Input,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { Dayjs } from 'dayjs'
import { IPFS_BASE_LINK, PINATA } from '../constants'
import axios from 'axios'
import { useAppContext } from '../context/AppContext'
import { ethers } from 'ethers'

enum ReviewType {
  bad = 'bad',
  neutral = 'neutral',
  positive = 'positive',
}

interface Review {
  target: null | string
  text: string | null
  type: ReviewType | null
}

interface Certificate {
  id: null | string
  date: Dayjs | null
  file: File | null
}

const reviewBaseState = { target: null, text: null, type: null }
const diplomaBaseState = { id: null, date: null, file: null }

const AddEntityPage: React.FC = () => {
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

  const [isFormOne, setIsFormOne] = useState(true) // Control which form to show
  const [formOneData, setFormOneData] = useState<Review>(reviewBaseState)
  const [formTwoData, setFormTwoData] = useState<Certificate>({
    id: null,
    date: null,
    file: null,
  })

  function validateWallet(wallet: string) {
    let error
    if (!ethers.utils.isAddress(wallet)) {
      error = 'Invalid wallet address'
    }
    return error
  }

  // Handle form submission
  const handleFormOneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await axios.post(
        'http://localhost:5000/api/insertReview',
        {
          reviewFrom: account,
          reviewTo: formOneData.target,
          reviewText: formOneData.text,
          reviewType: formOneData.type,
        },
      )
      if (response.status == 200) {
        alert(`BACKEND SUCCESS`)
      }
    } catch (error) {
      alert('BACKEND ERROR')
      return
    }
  }

  const [file, setFile] = useState<File | null>(null) // State to handle file input

  const handleFormTwoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formTwoData.file) {
      alert('NO FILE TO UPLOAD')
      return
    }

    let fileLink: string = ''
    try {
      const upload = await PINATA.upload.file(formTwoData.file)
      fileLink = IPFS_BASE_LINK + upload.IpfsHash
      alert(
        `hash загруженного на ipfs сертификата ${IPFS_BASE_LINK + upload.IpfsHash}`,
      )
    } catch (error) {
      alert('IPFS ERROR :(')
      return
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/insertCertificate',
        {
          imageLink: fileLink,
          workerAddr: account,
          certificateId: formTwoData.id,
          receiptDate: formTwoData.date?.unix(),
        },
      )
      if (response.status == 200) {
        alert(`BACKEND SUCCESS`)
      }
    } catch (error) {
      alert('BACKEND ERROR')
      return
    }
  }

  return (
    <Box sx={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Добавление информации
      </Typography>

      {/* Switch to toggle between Form 1 and Form 2 */}
      <Box sx={{ marginBottom: '20px' }}>
        <Typography variant="body1" gutterBottom>
          {isFormOne
            ? 'Оставить отзыв'
            : 'Добавить сертификат о дополнительной квалификации'}
        </Typography>
        <Switch
          checked={!isFormOne}
          onChange={() => {
            if (isFormOne) {
              setFormOneData(reviewBaseState)
            } else {
              setFormTwoData(diplomaBaseState)
            }

            setIsFormOne(!isFormOne)
          }}
          color="primary"
        />
      </Box>

      {/* Form 1 */}
      {isFormOne ? (
        <form onSubmit={handleFormOneSubmit}>
          <TextField
            label="На кого отзыв"
            fullWidth
            margin="normal"
            value={formOneData.target}
            onChange={(e) =>
              setFormOneData({ ...formOneData, target: e.target.value })
            }
            required
          />
          <TextField
            label="Текст отзыва"
            fullWidth
            margin="normal"
            value={formOneData.text}
            onChange={(e) =>
              setFormOneData({ ...formOneData, text: e.target.value })
            }
            required
          />
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Тип отзыва</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="review-type"
              value={formOneData.type}
              label="Тип отзыва"
              onChange={(e) =>
                setFormOneData({
                  ...formOneData,
                  type: e.target.value as ReviewType,
                })
              }
            >
              <MenuItem value={0}>Положительный</MenuItem>
              <MenuItem value={1}>Нейтральный</MenuItem>
              <MenuItem value={2}>Отрицательный</MenuItem>
            </Select>
          </FormControl>
          <Button type="submit" variant="contained" color="primary">
            Оставить отзыв
          </Button>
        </form>
      ) : (
        // Form 2
        <form onSubmit={handleFormTwoSubmit}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TextField
              label="Номер сертификата"
              fullWidth
              margin="normal"
              value={formTwoData.id}
              onChange={(e) =>
                setFormTwoData({ ...formTwoData, id: e.target.value })
              }
              required
            />
            <Box sx={{ width: '100%' }}>
              <DatePicker
                sx={{ width: '100%' }}
                label="Дата получения"
                value={formTwoData.date}
                onChange={(newDate) =>
                  setFormTwoData({ ...formTwoData, date: newDate })
                }
              />
            </Box>
            <Input
              type="file"
              fullWidth
              margin="dense"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFormTwoData({
                  ...formTwoData,
                  file: e.target?.files ? e.target?.files[0] : null,
                })
              }}
              inputProps={{ accept: '.png, .jpg, .jpeg, .pdf' }} // Limit file types if needed
            />
            <Button type="submit" variant="contained" color="primary">
              Загрузить сертификат
            </Button>
          </LocalizationProvider>
        </form>
      )}
    </Box>
  )
}

export default AddEntityPage
