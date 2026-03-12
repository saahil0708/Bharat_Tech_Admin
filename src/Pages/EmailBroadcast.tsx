import { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Stack,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    LinearProgress,
    Tooltip,
    IconButton
} from '@mui/material';
import { Mail, Send, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';

const EmailBroadcast = () => {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleSend = async () => {
        setConfirmOpen(false);
        setSending(true);
        setStatus({ type: null, message: '' });

        try {
            const response = await fetch('http://localhost:5000/send-mails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ subject, body }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus({ type: 'success', message: `Successfully sent emails to ${data.sent} teams!` });
                setSubject('');
                setBody('');
            } else {
                throw new Error(data.error || 'Failed to send emails');
            }
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setSending(false);
        }
    };

    return (
        <Box maxWidth="md" sx={{ mx: 'auto' }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 900, fontFamily: 'Azonix' }}>
                    EMAIL <span style={{ color: '#ff0000' }}>BROADCAST</span>
                </Typography>
                <Typography color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Mail size={16} /> Send dynamic emails to all registered teams
                </Typography>
            </Box>

            {status.type && (
                <Alert 
                    severity={status.type} 
                    sx={{ mb: 3, bgcolor: status.type === 'success' ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,0,0.1)', border: `1px solid ${status.type === 'success' ? '#00ff00' : '#ff0000'}`, color: status.type === 'success' ? '#00ff00' : '#ff0000' }}
                    icon={status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                >
                    {status.message}
                </Alert>
            )}

            <Paper sx={{ p: 4, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2 }}>
                <Stack spacing={4}>
                    <Box>
                        <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 800, mb: 1, fontFamily: 'Azonix' }}>
                            CAMPAIGN SUBJECT
                        </Typography>
                        <TextField
                            fullWidth
                            placeholder="e.g. Important Update: Bharat Tech Xperience 2024"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'rgba(255,255,255,0.02)',
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                    '&:hover fieldset': { borderColor: 'rgba(255,0,0,0.5)' },
                                    '&.Mui-focused fieldset': { borderColor: '#ff0000' }
                                }
                            }}
                        />
                    </Box>

                    <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 800, fontFamily: 'Azonix' }}>
                                EMAIL BODY (HTML SUPPORTED)
                            </Typography>
                            <Tooltip title="You can use {{team_name}}, {{leader_name}}, {{email}}, and {{team_id}} as variables.">
                                <IconButton size="small" sx={{ color: 'primary.main' }}>
                                    <Info size={18} />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                        <TextField
                            fullWidth
                            multiline
                            rows={12}
                            placeholder="Hello {{leader_name}}, welcome to Bharat Tech..."
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'rgba(255,255,255,0.02)',
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                    '&:hover fieldset': { borderColor: 'rgba(255,0,0,0.5)' },
                                    '&.Mui-focused fieldset': { borderColor: '#ff0000' }
                                }
                            }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Variables: <code style={{ color: '#ff0000' }}>{"{{team_name}}"}</code>, <code style={{ color: '#ff0000' }}>{"{{leader_name}}"}</code>, <code style={{ color: '#ff0000' }}>{"{{email}}"}</code>
                        </Typography>
                    </Box>

                    <Box sx={{ pt: 2 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={sending || !subject || !body}
                            onClick={() => setConfirmOpen(true)}
                            startIcon={sending ? <CircularProgress size={20} color="inherit" /> : <Send size={20} />}
                            sx={{ 
                                py: 2, 
                                fontWeight: 900, 
                                fontFamily: 'Azonix', 
                                letterSpacing: 1,
                                boxShadow: '0 4px 15px rgba(255,0,0,0.3)',
                                '&:hover': { boxShadow: '0 6px 20px rgba(255,0,0,0.5)' }
                            }}
                        >
                            {sending ? 'DISPATCHING EMAILS...' : 'INITIATE BROADCAST'}
                        </Button>
                    </Box>
                </Stack>
            </Paper>

            {sending && (
                <Box sx={{ mt: 4 }}>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 1 }}>
                        Processing batch queue... please do not close this window.
                    </Typography>
                    <LinearProgress color="primary" sx={{ height: 8, borderRadius: 4 }} />
                </Box>
            )}

            {/* Confirmation Dialog */}
            <Dialog 
                open={confirmOpen} 
                onClose={() => setConfirmOpen(false)}
                PaperProps={{ sx: { bgcolor: '#0a0a0a', border: '1px solid #ff0000', borderRadius: 1 } }}
            >
                <DialogTitle sx={{ color: 'white', fontWeight: 900, fontFamily: 'Azonix' }}>CONFIRM BROADCAST</DialogTitle>
                <DialogContent>
                    <Typography color="text.secondary">
                        You are about to send this email to <strong>ALL registered teams</strong> in the database. This action cannot be reversed.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setConfirmOpen(false)} sx={{ color: 'text.secondary', fontWeight: 800 }}>CANCEL</Button>
                    <Button onClick={handleSend} variant="contained" color="primary" sx={{ fontWeight: 900, borderRadius: 0.5 }}>SEND TO ALL</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EmailBroadcast;
