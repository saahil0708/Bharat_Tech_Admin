import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, CircularProgress } from '@mui/material';
import { QrCode, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { rooms } from '../data/rooms';
import { apiPost } from '../lib/apiClient';

const MarkAttendance = () => {
    const navigate = useNavigate();
    const [clickCount, setClickCount] = useState(0);
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSecretLogin = () => {
        const newCount = clickCount + 1;
        setClickCount(newCount);
        if (newCount >= 5) {
            navigate('/login');
        }
        setTimeout(() => setClickCount(0), 2000); // Reset count after 2s
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;

        setLoading(true);
        setStatus('idle');
        setMessage('');

        try {
            // Query Supabase for the team matching the unique code
            const { data: team, error: fetchError } = await supabase
                .from('teams')
                .select('*')
                .eq('team_code', code.trim())
                .single();

            if (fetchError || !team) {
                setStatus('error');
                setMessage('INVALID SECURITY CODE. TEAM NOT FOUND IN SYSTEM.');
                return;
            }

            const displayName = team.team_name ? team.team_name.toUpperCase() : 'TEAM';

            if (team.is_present) {
                const roomInfo = rooms.find(r => r.name === team.room_no);
                const roomDetail = roomInfo ? `(${roomInfo.venue} - ${roomInfo.block})` : '';
                setStatus('success');
                setMessage(`WELCOME BACK, ${displayName}! YOU ARE ALREADY MARKED PRESENT AND ALLOTTED ROOM: ${team.room_no || 'TBD'} ${roomDetail}.`);
                return;
            }

            // AUTO ROOM ALLOTMENT LOGIC
            // 1. Get current occupancy of all rooms
            const { data: occupancyData, error: occupancyError } = await supabase
                .from('teams')
                .select('room_no')
                .not('room_no', 'is', null);

            if (occupancyError) throw occupancyError;

            const occupancyMap: Record<string, number> = {};
            occupancyData?.forEach((t: any) => {
                if (t.room_no) {
                    occupancyMap[t.room_no] = (occupancyMap[t.room_no] || 0) + 1;
                }
            });

            // 2. Find first room with available capacity
            let selectedRoom = "TBD";
            for (const room of rooms) {
                const currentCount = occupancyMap[room.name] || 0;
                if (currentCount < room.capacity) {
                    selectedRoom = room.name;
                    break;
                }
            }

            if (selectedRoom === "TBD") {
                console.warn("ALL ROOMS ARE FULL!");
            }

            // Mark as present and allot room
            const { error: updateError } = await supabase
                .from('teams')
                .update({ 
                    is_present: true,
                    room_no: selectedRoom
                })
                .eq('id', team.id);

            if (updateError) throw updateError;

            // Trigger Email Notification
            try {
                const updatedTeam = { ...team, is_present: true, room_no: selectedRoom };
                await apiPost('/api/emails/send-bulk', { 
                    team: updatedTeam, 
                    emailType: 'room_allotment' 
                });
                console.log(`Notification email sent to ${updatedTeam.team_name}`);
            } catch (emailErr) {
                console.error("Failed to send notification email:", emailErr);
                // We don't fail the whole process if email fails, but we log it
            }

            const roomInfo = rooms.find(r => r.name === selectedRoom);
            const roomDetail = roomInfo ? `(${roomInfo.venue} - ${roomInfo.block})` : '';

            setStatus('success');
            setMessage(`ATTENDANCE VERIFIED! WELCOME, ${displayName}. YOUR ALLOTTED ROOM IS: ${selectedRoom} ${roomDetail}`);

        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setMessage(err.message || 'SYSTEM ERROR WHILE VERIFYING SEQUENCE.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0a0a0a', p: 2 }}>
            <Paper elevation={24} sx={{
                p: { xs: 4, md: 6 },
                maxWidth: 450,
                width: '100%',
                bgcolor: 'rgba(20, 20, 20, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid',
                borderColor: status === 'error' ? '#ff0000' : status === 'success' ? '#00ff00' : 'rgba(255, 0, 0, 0.2)',
                borderRadius: 2,
                boxShadow: status === 'error' ? '0 0 30px rgba(255,0,0,0.3)' : status === 'success' ? '0 0 30px rgba(0,255,0,0.3)' : 'none',
                textAlign: 'center'
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <Box sx={{
                        p: 2,
                        borderRadius: '50%',
                        bgcolor: status === 'success' ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,0,0.1)',
                        border: '1px solid',
                        borderColor: status === 'success' ? 'rgba(0,255,0,0.5)' : 'rgba(255,0,0,0.5)'
                    }}>
                        {status === 'success' ? <CheckCircle2 color="#00ff00" size={40} /> : <QrCode color="#ff0000" size={40} />}
                    </Box>
                </Box>
                <Typography
                    variant="h5"
                    onClick={handleSecretLogin}
                    sx={{ fontWeight: 900, fontFamily: 'Azonix', color: 'white', letterSpacing: 1, mb: 1, lineHeight: 1.4, cursor: 'default', userSelect: 'none' }}
                >
                    ATTENDANCE <span style={{ color: status === 'success' ? '#00ff00' : '#ff0000' }}>PORTAL</span>
                </Typography>

                {status === 'idle' && (
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
                        Enter your team's unique registration code to mark yourselves present for the event.
                    </Typography>
                )}

                {status === 'success' && (
                    <Typography variant="body2" sx={{ color: '#00ff00', mb: 4, fontWeight: 700, fontFamily: 'Azonix', fontSize: '0.8rem', lineHeight: 1.5 }}>
                        {message}
                    </Typography>
                )}

                {status === 'error' && (
                    <Typography variant="body2" sx={{ color: '#ff0000', mb: 4, fontWeight: 700, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 1, fontFamily: 'Azonix', fontSize: '0.8rem', lineHeight: 1.5 }}>
                        <AlertCircle size={16} /> {message}
                    </Typography>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        placeholder="e.g. BHARAT-2026-X7Y9"
                        value={code}
                        onChange={(e) => { setCode(e.target.value.toUpperCase()); setStatus('idle'); }}
                        disabled={loading || status === 'success'}
                        sx={{
                            mb: 3,
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                fontWeight: 800,
                                letterSpacing: 2,
                                textAlign: 'center',
                                '& input': { textAlign: 'center' },
                                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                '&:hover fieldset': { borderColor: '#ff0000' },
                                '&.Mui-focused fieldset': { borderColor: '#ff0000' },
                            }
                        }}
                    />
                    {status !== 'success' ? (
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading || !code.trim()}
                            sx={{
                                py: 1.5,
                                fontWeight: 800,
                                fontFamily: 'Azonix',
                                bgcolor: '#ff0000',
                                color: 'white',
                                '&:hover': { bgcolor: '#cc0000', boxShadow: '0 0 15px rgba(255,0,0,0.5)' },
                                '&.Mui-disabled': { bgcolor: 'rgba(255,0,0,0.3)', color: 'rgba(255,255,255,0.3)' }
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'MARK PRESENT'}
                        </Button>
                    ) : (
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => { setCode(''); setStatus('idle'); }}
                            sx={{
                                py: 1.5,
                                fontWeight: 800,
                                fontFamily: 'Azonix',
                                color: 'white',
                                borderColor: 'rgba(255,255,255,0.2)',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', borderColor: 'white' }
                            }}
                        >
                            MARK ANOTHER TEAM
                        </Button>
                    )}
                </form>
            </Paper>
        </Box>
    );
};

export default MarkAttendance;
