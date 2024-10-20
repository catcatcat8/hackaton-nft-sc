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
  } from '@mui/material';
  
  interface UserProfile {
    fullName: string;
    dateOfBirth: string;
    avatar: string;
    jobTitle: string;
    skills: string[];
  }
  
  const userProfile: UserProfile = {
    fullName: 'ЛЕХА ФРОНТ',
    dateOfBirth: '1990-06-15',
    avatar: 'https://via.placeholder.com/150',
    jobTitle: 'Full Stack Developer',
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'GraphQL'],
  };
  
  const UserProfilePage: React.FC = () => {
    return (
      <Box sx={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
        {/* Avatar and Name */}
        <Paper elevation={3} sx={{ padding: '24px', textAlign: 'center' }}>
          <Avatar
            src={userProfile.avatar}
            alt={userProfile.fullName}
            sx={{ width: 150, height: 150, margin: '0 auto' }}
          />
          <Typography variant="h4" gutterBottom sx={{ marginTop: '16px' }}>
            {userProfile.fullName}
          </Typography>
          <Typography variant="h6" color="textSecondary">
            {userProfile.jobTitle}
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
              <Typography variant="body1">{userProfile.dateOfBirth}</Typography>
            </Grid>
  
            {/* Job Title */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Должность:
              </Typography>
              <Typography variant="body1">{userProfile.jobTitle}</Typography>
            </Grid>
  
            {/* Skills */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Навыки
              </Typography>
              <List>
                {userProfile.skills.map((skill, index) => (
                  <ListItem key={index} sx={{ display: 'inline' }}>
                    <Chip label={skill} sx={{ margin: '4px' }} />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    );
  };
  
  export default UserProfilePage;