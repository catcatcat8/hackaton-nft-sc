// src/pages/FilterSortPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Switch,
  Divider,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import {cloneDeep} from 'lodash';
import { useAppContext } from '../context/AppContext';
import dayjs from 'dayjs';

// Define the structure of the user data
interface UserData {
  id: number;
  name: string;
  age: number;
  date: string;
  image: string;
}



const MyDataPage: React.FC = () => {
  const {
    reviewsData,
    certificatesData
  } = useAppContext()
  const [data, setData] = useState<any[]>(cloneDeep(certificatesData)); // This state holds the data displayed
  const [searchTerm, setSearchTerm] = useState(''); // Filter term
  const [sortField, setSortField] = useState<keyof UserData>('name'); // Field to sort by
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // Sort order (asc or desc)
  const [sortRType,sortFieldReviewType] = useState<number | null | string>(null)

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        alert(`${text} copied to clipboard!`);
      },
      (err) => {
        alert(`Failed to copy: ' ${err}`);
      }
    );
  };

 


  const [isQueuesState, setIsQueusState] = useState(true); // Set is queues state
  const [isCertificates, setIsCertificates] = useState(true) ; // Set is certificates data


  // Filter and sort logic
  const handleFilterAndSort = async() => {
    let filteredData = data;

    if (isQueuesState && isCertificates) {
      filteredData = cloneDeep(certificatesData);

      
    }
    else if (isQueuesState && !isCertificates){

      filteredData = cloneDeep(reviewsData);
    }

    console.log('DATA', data, 'filtereddata', filteredData)
    // Filter: If searchTerm is not empty, filter the data
    if (searchTerm) {
   

      filteredData = filteredData.filter((item) => {

        if (item?.fullName) {
        return item.fullName.toLowerCase().includes(searchTerm.toLowerCase())
        }

        if (item?.fullNameTo) {
          return item.fullNameTo.toLowerCase().includes(searchTerm.toLowerCase())
        }
      
      })
      
    }

    if (!isCertificates && sortRType) {
      filteredData = filteredData.filter((item) => {

       return  item?.reviewType === sortRType
      
      })
    }

    // Sort: Sort by the selected field and order
    filteredData.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a[sortField] > b[sortField] ? 1 : -1;
      } else {
        return a[sortField] < b[sortField] ? 1 : -1;
      }
    });

    // Update the displayed data
    setData(filteredData);
  };

  // Reset to original data
  const handleReset = () => {
    setData(certificatesData);
    setSearchTerm('');
    setSortField('name');
    setSortOrder('asc');
  };

  useEffect(() => {
    if (isQueuesState && isCertificates) {
      setData(cloneDeep(certificatesData))
    }
    else if (isQueuesState && !isCertificates){
      setData(cloneDeep(reviewsData))
    }

   }, [isQueuesState, isCertificates])

  

  return (
    <Box sx={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Поиск данных
      </Typography>

      {/* Filter: Text Input */}
      <TextField
        label="Search by Name"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Sort: Dropdown for sorting field */}
      <FormControl fullWidth margin="normal">
        <InputLabel>Sort By</InputLabel>
        <Select
          value={sortField}
          onChange={(e) => setSortField(e.target.value as keyof UserData)}
        >
          <MenuItem value="name">Name</MenuItem>
          <MenuItem value="age">Age</MenuItem>
          <MenuItem value="date">Date</MenuItem>
        </Select>
      </FormControl>

  {!isCertificates && (
    <FormControl fullWidth margin="normal">
    <InputLabel>Тип отзыва</InputLabel>
    <Select
      value={sortRType}
      onChange={(e) => sortFieldReviewType(e.target.value as string)}
    >
      <MenuItem value={0}>Положительный</MenuItem>
      <MenuItem value={1}>Нейтральный</MenuItem>
      <MenuItem value={2}>Отрицательный</MenuItem>
    </Select>
  </FormControl>
  )}
     

      {/* Sort: Dropdown for sorting order */}
      <FormControl fullWidth margin="normal">
        <InputLabel>Sort Order</InputLabel>
        <Select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
        >
          <MenuItem value="asc">Ascending</MenuItem>
          <MenuItem value="desc">Descending</MenuItem>
        </Select>
      </FormControl>

      {/* Buttons */}
      <Button
        variant="contained"
        color="primary"
        sx={{ marginTop: '16px', marginRight: '8px' }}
        onClick={handleFilterAndSort}
      >
        Apply
      </Button>
      <Button
        variant="outlined"
        sx={{ marginTop: '16px' }}
        onClick={handleReset}
      >
        Reset
      </Button>

      <Box sx={{ marginBottom: '20px' }}>
        <Typography variant="body1" gutterBottom>
          {isQueuesState ? 'Очередь на рассмотрение' : 'Существующие NFT'}
        </Typography>
        <Switch
          checked={!isQueuesState}
          onChange={() => {
            if (isQueuesState && isCertificates) {
              // setData(cloneDeep())
            }
            else {
              // setData(diplomaBaseState)
            }
            
            setIsQueusState(!isQueuesState)}}
          color="primary"
        />
      </Box>
      <Box sx={{ marginBottom: '20px' }}>
        <Typography variant="body1" gutterBottom>
          {isCertificates ? 'Сертификаты' : 'Отзывы'}
        </Typography>
        <Switch
          checked={!isCertificates}
          onChange={() => {
            if (isQueuesState && isCertificates) {
              setData(cloneDeep(certificatesData))
            }
            else if (isQueuesState && !isCertificates){
              setData(cloneDeep(reviewsData))
            }
            
            setIsCertificates(!isCertificates)}}
          color="primary"
        />
      </Box>


      {/* Data Display */}
      <Box sx={{ marginTop: '40px', textAlign: 'left' }}>
        <Typography variant="h5" gutterBottom>
          Результат
        </Typography>
        <List>
          {data && data.length > 0 ? (
            data.map((item) => {
              
              if (isCertificates) {
                return(
                  <>
                  <ListItem key={item._id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  {/* Avatar for image */}
                  Сертификат
                  <ListItemAvatar>
                      <div onClick={() => window.open(item.imageLink)}>
                    <Avatar src={item.imageLink} alt={item.name} />
                    </div>
                  </ListItemAvatar>
  
                  {/* User Info */}
                  <ListItemText
                    primary={`Обладатель ${item.fullName}, id сертификата: ${item.certificateId}, Date: ${dayjs(item.receiptDate)}`}
                  />
  
  <Button
          variant="outlined"
          startIcon={<ContentCopyIcon />}
          onClick={() => handleCopyToClipboard(item.workerAddr)}
          sx={{ marginTop: '8px' }}
        >
          Адрес
          </Button>

                  {/* Button for each list item */}
                  {!item.isAccepted && (
                    <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => console.log(`Button clicked for ${item.name}`)}
                  >
                    Подтвердить
                  </Button>
                  )}
                  
                </ListItem>
                <Divider  variant="middle" flexItem />

                </>
              )
              }
              
              return(
                <>
                <ListItem key={item._id} sx={{ display: 'flex',  justifyContent: 'space-between' }}>
                {/* Avatar for image */}
                {/* <ListItemAvatar>
                    <div onClick={() => window.open(item.image)}>
                  <Avatar src={item.image} alt={item.name} />
                  </div>
                </ListItemAvatar> */}

                {/* User Info */}
                {/* <ListItemText
                  primary={`От кого ${item.reviewFrom}, На кого ${item.reviewTo}, Date: x`}
                /> */}
                
          <Box>

          <Button
          variant="outlined"
          startIcon={<ContentCopyIcon />}
          onClick={() => handleCopyToClipboard(item.reviewFrom)}
          sx={{ marginTop: '8px' }}
        >
          {item?.fullNameFrom ? 
          (         <>
                              <Avatar src={item.imageFrom}  />

          {`От ${item?.fullNameFrom}`}

          </>
          ): (`От ${item?.reviewFrom}`)
        }
          </Button>    

   
          <Button
          variant="outlined"
          startIcon={<ContentCopyIcon />}
          onClick={() => handleCopyToClipboard(item.reviewTo)}
          sx={{ marginTop: '8px' }}
        >

          {item?.fullNameTo ? 
          (        <> 
                              <Avatar src={item.imageFrom}  />

          `На ${item?.fullNameTo}`

          </>
          ): (`На ${item?.reviewTo}`)
        }
          </Button>  
          <Typography>{item?.reviewText}</Typography>
          {item?.reviewType === 0 && (
              <Typography sx={{color: 'green'}}>
                Положительный
                </Typography>
          )}
              {item?.reviewType === 1 && (
              <Typography sx={{color: 'grey'}}>
                Нейтральный
                </Typography>
          )}
               {item?.reviewType === 2 && (
              <Typography sx={{color: 'red'}}>
Негативный                </Typography>
          )}
        
          </Box>
          
           

{/* <Button
          variant="outlined"
          startIcon={<ContentCopyIcon />}
          onClick={() => handleCopyToClipboard(item.workerAddr)}
          sx={{ marginTop: '8px' }}
        >
          
          </Button>
          <Button
          variant="outlined"
          startIcon={<ContentCopyIcon />}
          onClick={() => handleCopyToClipboard(item.workerAddr)}
          sx={{ marginTop: '8px' }}
        >
          Адрес
          </Button>     */}

                {/* Button for each list item */}
                {!item.isAccepted && (
                   <Button
                   variant="contained"
                   color="secondary"
                   onClick={() => console.log(`Button clicked for ${item}`)}
                 >  
                   Подтвердить
                 </Button>
                )}
               
              </ListItem>
              <Divider  variant="middle" flexItem />
                </>
            )})
          ) : ( 
            <Typography>Данных не найдено</Typography>
          )}
        </List>
      </Box>
    </Box>
  );
};

export default MyDataPage;
