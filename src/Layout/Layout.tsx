import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    Avatar,
    Button,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    ShieldCheck,
    LogOut
} from 'lucide-react';

const Layout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('adminAuth');
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: 'background.default', minHeight: '100vh' }}>
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    bgcolor: 'rgba(10, 10, 10, 0.8)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(255, 0, 0, 0.1)',
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 4 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{
                            width: 36,
                            height: 36,
                            bgcolor: 'primary.main',
                            borderRadius: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 15px rgba(255, 0, 0, 0.5)'
                        }}>
                            <ShieldCheck color="white" size={20} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'Azonix', color: 'white', letterSpacing: -0.5, display: { xs: 'none', sm: 'block' } }}>
                            BHARAT TECH <span style={{ color: '#ff0000' }}>ADMIN</span>
                        </Typography>
                    </Box>

                    {/* Navigation Buttons */}
                    <Box sx={{ display: 'flex', gap: { xs: 1, md: 3 }, flexGrow: 1, justifyContent: { xs: 'flex-start', sm: 'center' }, ml: { xs: 2, sm: 0 } }}>
                        <Button
                            onClick={() => navigate('/admin')}
                            sx={{
                                fontFamily: 'Azonix',
                                color: location.pathname === '/admin' ? '#ff0000' : 'text.secondary',
                                fontWeight: 800,
                                '&:hover': { color: 'white' }
                            }}
                        >
                            DIRECTORY
                        </Button>
                        <Button
                            onClick={() => navigate('/admin/attendance')}
                            sx={{
                                fontFamily: 'Azonix',
                                color: location.pathname === '/admin/attendance' ? '#ff0000' : 'text.secondary',
                                fontWeight: 800,
                                '&:hover': { color: 'white' }
                            }}
                        >
                            ATTENDANCE
                        </Button>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, fontFamily: 'Azonix' }}>
                        <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'Azonix' }}>Admin</Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 800, fontSize: '0.9rem', width: 32, height: 32, fontFamily: 'Azonix' }}>A</Avatar>
                        <Tooltip title="Secure Logout">
                            <IconButton onClick={handleLogout} sx={{ color: 'text.secondary', '&:hover': { color: '#ff0000', bgcolor: 'rgba(255,0,0,0.1)' } }}>
                                <LogOut size={20} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, overflow: 'auto' }}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout;
