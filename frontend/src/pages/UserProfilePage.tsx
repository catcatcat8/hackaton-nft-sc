import {
  Avatar,
  Box,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Button,
  ListItemAvatar,
} from '@mui/material'
import { useAppContext } from '../context/AppContext'
import dayjs from 'dayjs'

import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { DATA, UserProfile } from '../types'

const userProfile: UserProfile = {
  fullName: 'Loading...',
  dateOfBirth: 'Loading...',
  avatar: 'https://via.placeholder.com/150',
  jobTitle: 'Loading...',
  skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'GraphQL'],
}

const UserProfilePage: React.FC = () => {
  const { myNftData: data, myMainNft, isAdmin } = useAppContext()

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        alert(`${text} copied to clipboard!`)
      },
      (err) => {
        alert(`Failed to copy: ' ${err}`)
      },
    )
  }

  return (
    <Box sx={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      {isAdmin ? (
        <Paper elevation={3} sx={{ padding: '24px', textAlign: 'center' }}>
          <Avatar
            src={
              'https://assets.techrepublic.com/uploads/2017/06/incognitohero.jpg'
            }
            alt={'ADMIN'}
            sx={{ width: 150, height: 150, margin: '0 auto' }}
          />
          <Typography variant="h4" gutterBottom sx={{ marginTop: '16px' }}>
            {'Администратор'}
          </Typography>
          <Typography variant="h6" color="textSecondary">
            {'Администратор'}
          </Typography>
        </Paper>
      ) : (
        <>
          <Paper elevation={3} sx={{ padding: '24px', textAlign: 'center' }}>
            <Avatar
              src={myMainNft?.image ?? userProfile.avatar}
              alt={myMainNft?.fullName ?? userProfile.fullName}
              sx={{ width: 150, height: 150, margin: '0 auto' }}
            />
            <Typography variant="h4" gutterBottom sx={{ marginTop: '16px' }}>
              {myMainNft?.fullName ?? userProfile.fullName}
            </Typography>
            <Typography variant="h6" color="textSecondary">
              {myMainNft?.jobTitle ?? userProfile.jobTitle}
            </Typography>
          </Paper>

          {/* Additional Info: Date of Birth and Skills */}
          <Paper elevation={3} sx={{ padding: '24px', marginTop: '24px' }}>
            <Grid container spacing={2}>
              {/* Date of Birth */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Дата устройства на работу:
                </Typography>
                <Typography variant="body1">
                  {myMainNft?.dateOfHire ?? userProfile.dateOfBirth}
                </Typography>
              </Grid>

              {/* Job Title */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Должность:
                </Typography>
                <Typography variant="body1">
                  {myMainNft?.jobTitle ?? userProfile.jobTitle}
                </Typography>
              </Grid>

              {/* Skills */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Навыки
                </Typography>
                <List>
                  {myMainNft
                    ? myMainNft?.jobTitle.split(' ').map((skill, index) => (
                        <ListItem key={index} sx={{ display: 'inline' }}>
                          <Chip label={skill} sx={{ margin: '4px' }} />
                        </ListItem>
                      ))
                    : userProfile.skills.map((skill, index) => (
                        <ListItem key={index} sx={{ display: 'inline' }}>
                          <Chip label={skill} sx={{ margin: '4px' }} />
                        </ListItem>
                      ))}
                </List>
              </Grid>
            </Grid>
          </Paper>
        </>
      )}

      <Box sx={{ marginTop: '40px', textAlign: 'left' }}>
        <Typography variant="h5" gutterBottom>
          Результат
        </Typography>
        {data?.data && (
          <List>
            {data.data.responseFinalle &&
            data.data.responseFinalle.length > 0 ? (
              (data.data.responseFinalle as DATA[]).map((item, i) => {
                if (item && item.type === 'MAIN') {
                  return (
                    <>
                      <ListItem
                        key={i}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Button
                          variant="outlined"
                          startIcon={<ContentCopyIcon />}
                          onClick={() =>
                            handleCopyToClipboard(item.bigId || '')
                          }
                          sx={{ marginTop: '8px' }}
                        >
                          IPFS
                        </Button>
                        {`Имя ${item.fullName}`}
                        <ListItemAvatar>
                          <div onClick={() => window.open(item.image)}>
                            <Avatar src={item.image} />
                          </div>
                        </ListItemAvatar>
                        <Box>
                          <ListItemText
                            primary={`Должность ${item.jobTitle}`}
                          />

                          <ListItemText primary={`Навыки ${item.skills}`} />
                        </Box>
                      </ListItem>
                      <Divider variant="middle" flexItem />
                    </>
                  )
                }

                if (item && item.type === 'CERTIFICATE') {
                  return (
                    <>
                      <ListItem
                        key={i}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Button
                          variant="outlined"
                          startIcon={<ContentCopyIcon />}
                          onClick={() =>
                            handleCopyToClipboard(item.bigId || '')
                          }
                          sx={{ marginTop: '8px' }}
                        >
                          IPFS
                        </Button>
                        {`Сертификат ${item.certId}`}
                        <ListItemAvatar>
                          <div onClick={() => window.open(item.imageCert)}>
                            <Avatar src={item.imageCert} />
                          </div>
                        </ListItemAvatar>

                        <ListItemText
                          primary={`Обладатель ${item.fullName}, id сертификата: ${item.certId}`}
                        />

                        <Button
                          variant="outlined"
                          startIcon={<ContentCopyIcon />}
                          onClick={() =>
                            handleCopyToClipboard(item.certId || '')
                          }
                          sx={{ marginTop: '8px' }}
                        >
                          Адрес
                        </Button>
                      </ListItem>
                      <Divider variant="middle" flexItem />
                    </>
                  )
                }

                return (
                  <>
                    <ListItem
                      key={i}
                      sx={{ display: 'flex', justifyContent: 'space-between' }}
                    >
                      <Button
                        variant="outlined"
                        startIcon={<ContentCopyIcon />}
                        onClick={() => handleCopyToClipboard(item.bigId || '')}
                        sx={{ marginTop: '8px' }}
                      >
                        IPFS
                      </Button>

                      <Box>
                        <Button
                          variant="outlined"
                          startIcon={<ContentCopyIcon />}
                          onClick={() =>
                            handleCopyToClipboard(item.reviewFrom || '')
                          }
                          sx={{ marginTop: '8px' }}
                        >
                          {item?.reviewFromFullName ? (
                            <>
                              <Avatar src={item.reviewFromImage} />

                              {`От ${item?.reviewFromFullName}`}
                            </>
                          ) : (
                            `От ${item?.reviewFromFullName}`
                          )}
                        </Button>

                        <Button
                          variant="outlined"
                          startIcon={<ContentCopyIcon />}
                          onClick={() =>
                            handleCopyToClipboard(item.reviewTo || '')
                          }
                          sx={{ marginTop: '8px' }}
                        >
                          {item?.reivewToFullName ? (
                            <>
                              <Avatar src={item.reivewToImage} />
                              `На {item?.reivewToFullName}`
                            </>
                          ) : (
                            `На ${item?.reviewTo}`
                          )}
                        </Button>
                        <Typography>{item?.reviewText}</Typography>
                        {item?.reviewType === 0 && (
                          <Typography sx={{ color: 'green' }}>
                            Положительный
                          </Typography>
                        )}
                        {item?.reviewType === 1 && (
                          <Typography sx={{ color: 'grey' }}>
                            Нейтральный
                          </Typography>
                        )}
                        {item?.reviewType === 2 && (
                          <Typography sx={{ color: 'red' }}>
                            Негативный{' '}
                          </Typography>
                        )}
                      </Box>
                    </ListItem>
                    <Divider variant="middle" flexItem />
                  </>
                )
              })
            ) : (
              <Typography>Данных не найдено</Typography>
            )}
          </List>
        )}
      </Box>
    </Box>
  )
}

export default UserProfilePage
