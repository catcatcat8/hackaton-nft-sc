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
} from '@mui/material';
import {cloneDeep} from 'lodash';
import { useAppContext } from '../context/AppContext';
import dayjs from 'dayjs';
import axios from 'axios';
import { ALLOWED_CHAIN_ID, IPFS_BASE_LINK, NFT_CONTRACT, SCANNER_LINK } from '../constants';
import { ethers } from 'ethers';
import { acceptCertificate, acceptReview } from '../api';

// Define the structure of the user data
interface UserData {
  id: number;
  name: string;
  age: number;
  date: string;
  image: string;
}

// Mock Data: Replace this with your actual user data
const mockData: UserData[] = [
    { id: 1, name: 'Alice', age: 25, date: '2023-09-15', image: 'https://ipfs.io/ipfs/bafkreif74aqep2ecv4zqd4taskvxdi7e4zjb26x2sya3noltpc6zau32s4' },
    { id: 2, name: 'Bob', age: 30, date: '2023-07-12', image: 'https://ipfs.io/ipfs/bafkreif74aqep2ecv4zqd4taskvxdi7e4zjb26x2sya3noltpc6zau32s4' },
    { id: 3, name: 'Charlie', age: 22, date: '2023-10-01', image: 'https://ipfs.io/ipfs/bafkreif74aqep2ecv4zqd4taskvxdi7e4zjb26x2sya3noltpc6zau32s4' },
    { id: 4, name: 'David', age: 28, date: '2023-08-21', image: 'https://ipfs.io/ipfs/bafkreif74aqep2ecv4zqd4taskvxdi7e4zjb26x2sya3noltpc6zau32s4' },
  ];

const MyDataPage: React.FC = () => {
  const {
    reviewsData,
    certificatesData,
    signer
  } = useAppContext()
  const [data, setData] = useState<any[]>(cloneDeep(certificatesData)); // This state holds the data displayed
  const [searchTerm, setSearchTerm] = useState(''); // Filter term
  const [sortField, setSortField] = useState<keyof UserData>('name'); // Field to sort by
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // Sort order (asc or desc)



 


  const [isQueuesState, setIsQueusState] = useState(true); // Set is queues state
  const [isCertificates, setIsCertificates] = useState(true) ; // Set is certificates data


  // Filter and sort logic
  const handleFilterAndSort = () => {
    let filteredData = data;

    // Filter: If searchTerm is not empty, filter the data
    if (searchTerm) {
      filteredData = filteredData.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
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

   const mintCertificate = async (values: any) => {

    alert('todo: лоадер на кнопку')
    
    const CURRENT_NFT_ID = await NFT_CONTRACT.counter()
    const sigToSign = `auth:ethr:${ALLOWED_CHAIN_ID}:${NFT_CONTRACT.address.toLowerCase()}:${CURRENT_NFT_ID.toString()}`

    let signature: string = ''
    try {
      signature = await signer!.signMessage(sigToSign)
    } catch (error) {
      alert('SIG ERROR')
      return
    }
    

    let signatureForDbUpdate: string = ''
    try {
      signatureForDbUpdate = await signer!.signMessage(values._id)
    } catch (error) {
      alert('SIG ERROR')
      return
    }

    let responseData: any = null
    try {
      console.log(values);
      
      const response = await axios.post(
        'http://localhost:5000/api/createCertificateVC',
        {imageLink: values.imageLink, workerAddr: values.workerAddr, certificateId: values.certificateId, receiptDate: values.receiptDate, challengeSig: signature}
      ) 
      responseData = response.data
      console.log("RESP FROM BACK", response.data);
      alert(`BACKEND SUCCESS: ${IPFS_BASE_LINK + responseData.data.ipfsHash}`)
    } catch (error) {
      alert('BACKEND ERROR')
      return
    }

    let txWaited: ethers.ContractReceipt | null = null
    if (responseData) {
      try {
        const tx = await NFT_CONTRACT.connect(signer!).mint(
          values.workerAddr,
          responseData.data.ipfsHash
        )
        txWaited = await tx.wait()
        alert(`TX SUCCESS: ${SCANNER_LINK + tx.hash}`)
      } catch (error) {
        console.log(error)
        alert('WHY REJECT??')
      }
    }

    let response: any = null
    if (txWaited?.transactionHash) {
      try {
        response = await acceptCertificate(values._id, signatureForDbUpdate)
      } catch (error) {
        alert('BACKEND ERROR')
        return
      }
    }

    if (response == 200) {
      alert('транза прошла, в дб флаг поменяли, на этом моменте кнопку у этого итема можно убирать')
      return
    }
   }

   const mintReview = async (values: any) => {
    alert('todo: лоадер на кнопку')
    const CURRENT_NFT_ID = await NFT_CONTRACT.counter()
    const sigToSign = `auth:ethr:${ALLOWED_CHAIN_ID}:${NFT_CONTRACT.address.toLowerCase()}:${CURRENT_NFT_ID.toString()}`

    let signature: string = ''
    try {
      signature = await signer!.signMessage(sigToSign)
    } catch (error) {
      alert('SIG ERROR')
      return
    }
    

    let signatureForDbUpdate: string = ''
    try {
      signatureForDbUpdate = await signer!.signMessage(values._id)
    } catch (error) {
      alert('SIG ERROR')
      return
    }

    let responseData: any = null
    try {
      const response = await axios.post(
        'http://localhost:5000/api/createReviewVC',
        {reviewFrom: values.reviewFrom, reviewTo: values.reviewTo, reviewText: values.reviewText, reviewType: values.reviewType, challengeSig: signature}
      ) 
      responseData = response.data
      console.log("RESP FROM BACK", response.data);
      alert(`BACKEND SUCCESS: ${IPFS_BASE_LINK + responseData.data.ipfsHash}`)
    } catch (error) {
      alert('BACKEND ERROR')
      return
    }

    let txWaited: ethers.ContractReceipt | null = null
    if (responseData) {
      try {
        const tx = await NFT_CONTRACT.connect(signer!).mint(
          values.reviewTo,
          responseData.data.ipfsHash
        )
        txWaited = await tx.wait()
        alert(`TX SUCCESS: ${SCANNER_LINK + tx.hash}`)
      } catch (error) {
        console.log(error)
        alert('WHY REJECT??')
      }
    }

    let response: any = null
    if (txWaited?.transactionHash) {
      try {
        response = await acceptReview(values._id, signatureForDbUpdate)
      } catch (error) {
        alert('BACKEND ERROR')
        return
      }
    }
    
    if (response == 200) {
      console.log("RESP", response);
      
      alert('транза прошла, в дб флаг поменяли, на этом моменте кнопку у этого итема можно убирать')
      return
    }

   }
  

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
                  <ListItem key={item._id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  {/* Avatar for image */}
                  <ListItemAvatar>
                      <div onClick={() => window.open(item.imageLink)}>
                    <Avatar src={item.imageLink} alt={item.name} />
                    </div>
                  </ListItemAvatar>
  
                  {/* User Info */}
                  <ListItemText
                    primary={`${item.workerAddr}, id сертификата: ${item.certificateId}, Date: ${dayjs(item.receiptDate)}`}
                  />
  
                  {/* Button for each list item */}
                  {!item.isAccepted && (
                    <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => mintCertificate(item)}
                  >
                    Подтвердить
                  </Button>
                  )}
                  
                </ListItem>
              )
              }
              
              return(
                <ListItem key={item._id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                {/* Avatar for image */}
                {/* <ListItemAvatar>
                    <div onClick={() => window.open(item.image)}>
                  <Avatar src={item.image} alt={item.name} />
                  </div>
                </ListItemAvatar> */}

                {/* User Info */}
                <ListItemText
                  primary={`От кого ${item.reviewFrom}, На кого ${item.reviewTo}, Date: x`}
                />

                {/* Button for each list item */}
                {!item.isAccepted && (
                   <Button
                   variant="contained"
                   color="secondary"
                   onClick={() => mintReview(item)}
                 >
                   Подтвердить
                 </Button>
                )}
               
              </ListItem>
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
