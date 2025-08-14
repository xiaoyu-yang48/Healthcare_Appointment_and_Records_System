import React from 'react';
import { Container, Paper, Typography, Button, Box } from '@mui/material';
import { t, setLanguage, getLanguage } from '../utils/i18n';

const TestLanguage = () => {
  const currentLanguage = getLanguage();

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            {t('system_name')}
          </Typography>
          
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Language Test Page
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3 }}>
            Current Language: {currentLanguage === 'en' ? 'English' : '中文'} ({currentLanguage})
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
            <Typography variant="h6">{t('login')}</Typography>
            <Typography variant="h6">{t('register')}</Typography>
            <Typography variant="h6">{t('dashboard')}</Typography>
            <Typography variant="h6">{t('appointments')}</Typography>
            <Typography variant="h6">{t('messages')}</Typography>
            <Typography variant="h6">{t('profile')}</Typography>
            <Typography variant="h6">{t('settings')}</Typography>
          </Box>
          
          <Box sx={{ mt: 4 }}>
            <Button 
              variant="contained" 
              onClick={() => setLanguage(currentLanguage === 'en' ? 'zh' : 'en')}
              sx={{ mr: 2 }}
            >
              {currentLanguage === 'en' ? t('chinese') : t('english')}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default TestLanguage;
