import React, { useState } from 'react';
import { Button, Box, Typography, Paper } from '@mui/material';
import UserForm from '../components/UserForm';
import { useAuth } from '../context/AuthContext';
import { t } from '../utils/i18n';

const TestUserForm = () => {
    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const { user } = useAuth();

    const mockUser = {
        _id: 'test123',
        name: 'Test Doctor',
        email: 'test@example.com',
        role: 'doctor',
        phone: '1234567890',
        specialization: 'Cardiology',
        department: 'Heart Center',
        isActive: true
    };

    const handleSuccess = () => {
        console.log('User form operation successful');
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                {t('user_form.edit_user')} - Test Page
            </Typography>
            
            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                    UserForm Internationalization Test
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    This page tests the UserForm component's internationalization functionality.
                    Click the buttons below to test different scenarios.
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button 
                        variant="contained" 
                        onClick={() => setOpenAdd(true)}
                        sx={{ mb: 1 }}
                    >
                        Test Add User Form
                    </Button>
                    
                    <Button 
                        variant="outlined" 
                        onClick={() => setOpenEdit(true)}
                        sx={{ mb: 1 }}
                    >
                        Test Edit User Form
                    </Button>
                </Box>
            </Paper>

            {/* Add User Form */}
            <UserForm
                open={openAdd}
                onClose={() => setOpenAdd(false)}
                onSuccess={handleSuccess}
            />

            {/* Edit User Form */}
            <UserForm
                open={openEdit}
                onClose={() => setOpenEdit(false)}
                user={mockUser}
                onSuccess={handleSuccess}
            />
        </Box>
    );
};

export default TestUserForm;
