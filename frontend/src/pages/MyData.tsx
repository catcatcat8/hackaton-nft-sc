// src/pages/FilterSortPage.tsx
import React, { useState } from 'react';
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
} from '@mui/material';

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
  const [data, setData] = useState<UserData[]>(mockData); // This state holds the data displayed
  const [searchTerm, setSearchTerm] = useState(''); // Filter term
  const [sortField, setSortField] = useState<keyof UserData>('name'); // Field to sort by
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // Sort order (asc or desc)

  // Filter and sort logic
  const handleFilterAndSort = () => {
    let filteredData = mockData;

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
    setData(mockData);
    setSearchTerm('');
    setSortField('name');
    setSortOrder('asc');
  };

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

      {/* Data Display */}
      <Box sx={{ marginTop: '40px', textAlign: 'left' }}>
        <Typography variant="h5" gutterBottom>
          Результат
        </Typography>
        <List>
          {data.length > 0 ? (
            data.map((item) => (
                <ListItem key={item.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                {/* Avatar for image */}
                <ListItemAvatar>
                    <div onClick={() => window.open(item.image)}>
                  <Avatar src={item.image} alt={item.name} />
                  </div>
                </ListItemAvatar>

                {/* User Info */}
                <ListItemText
                  primary={`${item.name}, Age: ${item.age}, Date: ${item.date}`}
                />

                {/* Button for each list item */}
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => console.log(`Button clicked for ${item.name}`)}
                >
                  Action
                </Button>
              </ListItem>
            ))
          ) : ( 
            <Typography>Данных не найдено</Typography>
          )}
        </List>
      </Box>
    </Box>
  );
};

export default MyDataPage;
