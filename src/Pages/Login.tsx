import { useState } from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import { ShieldAlert, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [passcode, setPasscode] = useState('');
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Hardcoded secure passcode for the admin panel
        if (passcode === 'Sa@HIL-BTX@TU' || passcode === 'cyber2026') {
            localStorage.setItem('adminAuth', 'true');
            navigate('/admin');
        } else {
            setError(true);
            setPasscode('');
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0a0a0a', p: 2 }}>
            <Paper elevation={24} sx={{
                p: { xs: 4, md: 6 },
                maxWidth: 400,
                width: '100%',
                bgcolor: 'rgba(20, 20, 20, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid',
                borderColor: error ? '#ff0000' : 'rgba(255, 0, 0, 0.2)',
                borderRadius: 2,
                boxShadow: error ? '0 0 30px rgba(255,0,0,0.4)' : '0 0 20px rgba(255,0,0,0.1)',
                textAlign: 'center'
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.5)' }}>
                        <ShieldAlert color="#ff0000" size={40} />
                    </Box>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: 'Azonix', color: 'white', letterSpacing: 1, mb: 1 }}>
                    SECURE <span style={{ color: '#ff0000' }}>ACCESS</span>
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
                    Authorized personnel only. Please enter the master passcode.
                </Typography>
                <form onSubmit={handleLogin}>
                    <TextField
                        fullWidth
                        type="password"
                        placeholder="Enter Passcode..."
                        value={passcode}
                        onChange={(e) => { setPasscode(e.target.value); setError(false); }}
                        error={error}
                        helperText={error ? "INVALID PASSCODE DETECTED" : " "}
                        InputProps={{
                            startAdornment: <Lock size={18} color={error ? "#ff0000" : "#a0a0a0"} style={{ marginRight: 8 }} />,
                        }}
                        sx={{
                            mb: 3,
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                '& fieldset': { borderColor: error ? '#ff0000' : 'rgba(255,255,255,0.1)' },
                                '&:hover fieldset': { borderColor: error ? '#ff0000' : '#ff0000' },
                                '&.Mui-focused fieldset': { borderColor: '#ff0000' },
                            },
                            '& .MuiFormHelperText-root': { color: '#ff0000', fontWeight: 700, fontFamily: 'Azonix', textAlign: 'center', mt: 1 }
                        }}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        endIcon={<ArrowRight />}
                        sx={{
                            py: 1.5,
                            fontWeight: 800,
                            fontFamily: 'Azonix',
                            bgcolor: '#ff0000',
                            color: 'white',
                            '&:hover': { bgcolor: '#cc0000', boxShadow: '0 0 15px rgba(255,0,0,0.5)' }
                        }}
                    >
                        AUTHENTICATE
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default Login;
