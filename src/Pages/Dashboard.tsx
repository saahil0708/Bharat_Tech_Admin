import { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Tooltip,
    TablePagination,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    TextField,
    InputAdornment,
    Tabs,
    Tab
} from '@mui/material';
import { Users, Database, RefreshCw, Mail, FileText, Eye, X, Search, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [teams, setTeams] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    // New Feature States
    const [selectedTeam, setSelectedTeam] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentTab, setCurrentTab] = useState(0);
    const [deleteTeamId, setDeleteTeamId] = useState<string | null>(null);
    const [editTeam, setEditTeam] = useState<any>(null);
    const [editFormData, setEditFormData] = useState<any>({});

    const fetchTeams = async () => {
        setRefreshing(true);
        if (teams.length === 0) setLoading(true);

        try {
            const from = page * rowsPerPage;
            const to = from + rowsPerPage - 1;

            let query = supabase
                .from('teams')
                .select('*', { count: 'exact' });

            if (searchTerm.trim() !== '') {
                // Safely searching common text columns based on exact schema
                query = query.or(`team_name.ilike.%${searchTerm}%,leader_name.ilike.%${searchTerm}%,team_code.ilike.%${searchTerm}%`);
            }

            const { data, error, count } = await query
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;
            setTeams(data || []);
            if (count !== null) setTotalCount(count);
        } catch (err: any) {
            console.error("Supabase Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, [page, rowsPerPage, currentTab]);

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSendMail = (team: any) => {
        console.log("Preparing to send mail to:", team.leader_email || team.email);
        alert(`Initializing Email Sequence for ${team.leader_name || 'Leader'}...`);
    };

    const handleSendInvitation = (team: any) => {
        console.log("Preparing to send invitation for team:", team.team_name || team.name);
        alert(`Generating Invitation Document for ${team.team_name || 'Team'}...`);
    };

    const handleDeleteTeam = async () => {
        if (!deleteTeamId) return;
        try {
            const { error } = await supabase.from('teams').delete().eq('id', deleteTeamId);
            if (error) throw error;
            setDeleteTeamId(null);
            fetchTeams();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const openEditModal = (team: any) => {
        setEditTeam(team);
        setEditFormData({ ...team });
    };

    const handleSaveEdit = async () => {
        try {
            const { id, created_at, ...updateData } = editFormData; // Prevent updating readonly fields
            const { error } = await supabase.from('teams').update(updateData).eq('id', id);
            if (error) throw error;
            setEditTeam(null);
            fetchTeams();
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (loading && teams.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress thickness={5} sx={{ color: 'primary.main', filter: 'drop-shadow(0 0 8px #ff0000)' }} />
            </Box>
        );
    }

    // Determine all available columns
    const allColumns = teams.length > 0 ? Object.keys(teams[0]).filter(k => k !== 'id' && k !== 'count') : [];

    // Define preferred columns to show in the minimal table view
    const preferredColumns = ['team_name', 'leader_name', 'leader_phone', 'project_description', 'team_code'];
    let displayColumns = preferredColumns.filter(c => allColumns.includes(c));
    if (displayColumns.length === 0) {
        displayColumns = allColumns.slice(0, 4); // Fallback to first 4 if preferred don't exist
    }

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ mb: 1, fontWeight: 900, fontFamily: 'Azonix' }}>
                        TEAMS <span style={{ color: '#ff0000' }}>DIRECTORY</span>
                    </Typography>
                    <Typography color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Users size={16} /> Viewing registered teams from Supabase
                    </Typography>
                </Box>
                <Tooltip title="Refresh Data">
                    <IconButton
                        onClick={fetchTeams}
                        disabled={refreshing}
                        sx={{
                            bgcolor: 'rgba(255,0,0,0.1)',
                            color: '#ff0000',
                            border: '1px solid rgba(255,0,0,0.2)',
                            borderRadius: 2,
                            p: 1.5,
                            '&:hover': { bgcolor: 'rgba(255,0,0,0.2)' },
                            ...(refreshing && { animation: 'spin 1s linear infinite' })
                        }}
                    >
                        <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Tabs & Search Bar */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, gap: 2, mb: 3 }}>
                <Tabs
                    value={currentTab}
                    onChange={(_, newValue) => { setCurrentTab(newValue); setPage(0); }}
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{ '.MuiTab-root': { fontFamily: 'Azonix', fontSize: '0.9rem', minWidth: 120 } }}
                >
                    <Tab label="DIRECTORY" />
                    <Tab label="MANAGE TEAMS" />
                </Tabs>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        placeholder="Search Teams, Leaders..."
                        variant="outlined"
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchTeams()}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Search size={18} color="#ff0000" /></InputAdornment>,
                        }}
                        sx={{
                            flexGrow: 1,
                            minWidth: { xs: '100%', md: '300px' },
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 1,
                                bgcolor: 'rgba(255,255,255,0.02)',
                                '& fieldset': { borderColor: 'rgba(255,0,0,0.2)' },
                                '&:hover fieldset': { borderColor: 'rgba(255,0,0,0.5)' },
                                '&.Mui-focused fieldset': { borderColor: '#ff0000' }
                            }
                        }}
                    />
                    <Button
                        variant="contained"
                        onClick={() => { setPage(0); fetchTeams(); }}
                        sx={{ borderRadius: 0.5, fontFamily: 'Azonix', px: 3, boxShadow: '0 0 10px rgba(255,0,0,0.3)' }}
                    >
                        SEARCH
                    </Button>
                </Box>
            </Box>

            {error && (
                <Paper sx={{ p: 2, mb: 3, bgcolor: 'rgba(255,0,0,0.1)', border: '1px solid #ff0000', color: '#ff0000' }}>
                    Error loading teams: {error}
                </Paper>
            )}

            <TableContainer component={Paper} sx={{ bgcolor: 'background.paper', borderRadius: 1, border: '1px solid rgba(255,255,255,0.05)' }}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'rgba(255,0,0,0.05)' }}>
                            {displayColumns.map((col) => (
                                <TableCell key={col} sx={{ fontWeight: 800, color: 'primary.main', textTransform: 'uppercase', py: 2, fontFamily: 'Azonix' }}>
                                    {col.replace(/_/g, ' ')}
                                </TableCell>
                            ))}
                            {displayColumns.length > 0 && <TableCell sx={{ fontWeight: 800, color: 'primary.main', textTransform: 'uppercase', py: 2, textAlign: 'right', fontFamily: 'Azonix' }}>ACTIONS</TableCell>}
                            {displayColumns.length === 0 && <TableCell sx={{ fontWeight: 800, color: 'primary.main', py: 2, textAlign: 'center', fontFamily: 'Azonix' }}>SYSTEM STATUS</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {teams.length > 0 ? (
                            teams.map((team, idx) => (
                                <TableRow
                                    key={team.id || idx}
                                    sx={{
                                        '&:last-child td, &:last-child th': { border: 0 },
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
                                        transition: '0.2s'
                                    }}
                                >
                                    {displayColumns.map((col) => {
                                        const val = team[col];
                                        let content = val;
                                        if (typeof val === 'boolean') {
                                            content = <Chip size="small" label={val ? 'Yes' : 'No'} color={val ? 'success' : 'default'} />;
                                        } else if (typeof val === 'object' && val !== null) {
                                            content = JSON.stringify(val);
                                        } else if (typeof val === 'string' && col.includes('at') && val.includes('T')) {
                                            content = new Date(val).toLocaleDateString();
                                        }
                                        return (
                                            <TableCell key={col} sx={{ py: 2, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                                                {content || '-'}
                                            </TableCell>
                                        );
                                    })}
                                    <TableCell sx={{ py: 2, textAlign: 'right', whiteSpace: 'nowrap' }}>
                                        {currentTab === 0 ? (
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    color="primary"
                                                    startIcon={<Eye size={16} />}
                                                    onClick={() => setSelectedTeam(team)}
                                                    sx={{ fontWeight: 800, borderRadius: 0.6, px: 2 }}
                                                >
                                                    VIEW
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    startIcon={<Mail size={16} />}
                                                    onClick={() => handleSendMail(team)}
                                                    sx={{ fontWeight: 800, borderRadius: 0.6, px: 2, bgcolor: 'rgba(255,0,0,0.1)', color: '#ff0000', border: '1px solid rgba(255,0,0,0.5)', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}
                                                >
                                                    MAIL
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    startIcon={<FileText size={16} />}
                                                    onClick={() => handleSendInvitation(team)}
                                                    sx={{ fontWeight: 800, borderRadius: 0.6, px: 2, bgcolor: 'rgba(0, 255, 0, 0.1)', color: '#00ff00', border: '1px solid rgba(0, 255, 0, 0.5)', '&:hover': { bgcolor: '#00ff00', color: 'black' } }}
                                                >
                                                    INVITE
                                                </Button>
                                            </Stack>
                                        ) : (
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<Edit size={16} />}
                                                    onClick={() => openEditModal(team)}
                                                    sx={{ fontWeight: 800, borderRadius: 0.6, px: 2, color: '#00ccff', borderColor: 'rgba(0,204,255,0.5)', '&:hover': { bgcolor: 'rgba(0,204,255,0.1)', borderColor: '#00ccff' } }}
                                                >
                                                    EDIT
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    startIcon={<Trash2 size={16} />}
                                                    onClick={() => setDeleteTeamId(team.id)}
                                                    sx={{ fontWeight: 800, borderRadius: 0.6, px: 2, bgcolor: 'rgba(255,0,0,0.1)', color: '#ff0000', border: '1px solid rgba(255,0,0,0.5)', '&:hover': { bgcolor: '#ff0000', color: 'white' } }}
                                                >
                                                    DELETE
                                                </Button>
                                            </Stack>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={(displayColumns.length || 0) + 1} align="center" sx={{ py: 10 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, opacity: 0.8 }}>
                                        <Box sx={{
                                            p: 3,
                                            borderRadius: '50%',
                                            bgcolor: 'rgba(255,0,0,0.05)',
                                            border: '1px dashed rgba(255,0,0,0.3)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Database size={48} color="#ff0000" />
                                        </Box>
                                        <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 800, letterSpacing: 1 }}>
                                            NO DATA ENCOUNTERED
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 350, textAlign: 'center', lineHeight: 1.6 }}>
                                            The system could not locate any registered teams matching your criteria.
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {teams.length > 0 && (
                    <TablePagination
                        component="div"
                        count={totalCount}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        sx={{
                            borderTop: '1px solid rgba(255, 0, 0, 0.1)',
                            color: 'text.secondary',
                            '.MuiTablePagination-selectIcon': { color: 'text.secondary' },
                            '.MuiTablePagination-actions button': { color: 'text.secondary' }
                        }}
                    />
                )}
            </TableContainer>

            {/* View More Details Modal */}
            <Dialog
                open={Boolean(selectedTeam)}
                onClose={() => setSelectedTeam(null)}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: '#0a0a0a',
                        border: '1px solid #ff0000',
                        boxShadow: '0 0 20px rgba(255,0,0,0.2)',
                        backgroundImage: 'none',
                        borderRadius: 1
                    }
                }}
            >
                {selectedTeam && (
                    <>
                        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <Typography variant="h5" sx={{ fontWeight: 900, color: 'white', display: 'flex', alignItems: 'center', gap: 2, fontFamily: 'Azonix' }}>
                                <Users color="#ff0000" /> TEAM <span style={{ color: '#ff0000' }}>DETAILS</span>
                            </Typography>
                            <IconButton onClick={() => setSelectedTeam(null)} sx={{ color: 'text.secondary', '&:hover': { color: '#ff0000', bgcolor: 'rgba(255,0,0,0.1)' } }}>
                                <X />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent sx={{ mt: 3, pb: 4 }}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                                {allColumns.map((col) => {
                                    const val = selectedTeam[col];
                                    let content = val;
                                    if (typeof val === 'boolean') {
                                        content = <Chip size="small" label={val ? 'Yes' : 'No'} color={val ? 'success' : 'default'} />;
                                    } else if (typeof val === 'object' && val !== null) {
                                        content = JSON.stringify(val);
                                    } else if (typeof val === 'string' && col.includes('at') && val.includes('T')) {
                                        content = new Date(val).toLocaleString();
                                    }

                                    // Make links clickable
                                    if (typeof val === 'string' && val.startsWith('http')) {
                                        content = <a href={val} target="_blank" rel="noreferrer" style={{ color: '#ff0000', textDecoration: 'none', wordBreak: 'break-all' }}>{val}</a>
                                    }

                                    return (
                                        <Paper key={col} sx={{
                                            p: 2,
                                            bgcolor: 'rgba(255,255,255,0.02)',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            borderRadius: 1,
                                            height: '100%'
                                        }}>
                                            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 1, opacity: 0.8 }}>
                                                {col.replace(/_/g, ' ')}
                                            </Typography>
                                            <Typography variant="body1" sx={{ color: 'text.primary', wordBreak: 'break-word', fontWeight: 500 }}>
                                                {content || <span style={{ opacity: 0.3 }}>-</span>}
                                            </Typography>
                                        </Paper>
                                    );
                                })}
                            </Box>
                        </DialogContent>
                        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.1)', justifyContent: 'space-between' }}>
                            <Stack direction="row" spacing={2}>
                                <Button
                                    variant="outlined"
                                    startIcon={<Mail size={16} />}
                                    onClick={() => handleSendMail(selectedTeam)}
                                    sx={{ fontWeight: 800, color: '#ff0000', borderRadius: 0.6, borderColor: 'rgba(255,0,0,0.5)', '&:hover': { bgcolor: 'rgba(255,0,0,0.1)', borderColor: '#ff0000' } }}
                                >
                                    MAIL LEADER
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<FileText size={16} />}
                                    onClick={() => handleSendInvitation(selectedTeam)}
                                    sx={{ fontWeight: 800, color: '#00ff00', borderRadius: 0.6, borderColor: 'rgba(0,255,0,0.5)', '&:hover': { bgcolor: 'rgba(0,255,0,0.1)', borderColor: '#00ff00' } }}
                                >
                                    SEND INVITATION
                                </Button>
                            </Stack>
                            <Button variant="contained" color="primary" onClick={() => setSelectedTeam(null)} sx={{ fontWeight: 800, borderRadius: 0.5 }}>
                                CLOSE
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog
                open={Boolean(deleteTeamId)}
                onClose={() => setDeleteTeamId(null)}
                PaperProps={{
                    sx: { bgcolor: '#0a0a0a', border: '1px solid #ff0000', borderRadius: 1 }
                }}
            >
                <DialogTitle sx={{ color: 'white', fontWeight: 900, fontFamily: 'Azonix' }}>CONFIRM DELETION</DialogTitle>
                <DialogContent>
                    <Typography color="text.secondary">Are you completely sure you want to delete this team from the database? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteTeamId(null)} sx={{ color: 'text.secondary', fontWeight: 800 }}>CANCEL</Button>
                    <Button onClick={handleDeleteTeam} variant="contained" color="error" sx={{ fontWeight: 800, borderRadius: 0.5 }}>DELETE FOREVER</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Team Modal */}
            <Dialog
                open={Boolean(editTeam)}
                onClose={() => setEditTeam(null)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { bgcolor: '#0a0a0a', border: '1px solid #00ccff', borderRadius: 1, boxShadow: '0 0 20px rgba(0,204,255,0.2)' }
                }}
            >
                <DialogTitle sx={{ color: 'white', fontWeight: 900, borderBottom: '1px solid rgba(255,255,255,0.1)', fontFamily: 'Azonix' }}>
                    EDIT TEAM DETAILS
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        {allColumns.map(col => {
                            if (col === 'created_at') return null; // Prevent editing timestamps
                            return (
                                <TextField
                                    key={col}
                                    label={col.replace(/_/g, ' ').toUpperCase()}
                                    value={editFormData[col] || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, [col]: e.target.value })}
                                    variant="outlined"
                                    fullWidth
                                    InputLabelProps={{ shrink: true, sx: { color: 'primary.main', fontWeight: 800 } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            bgcolor: 'rgba(255,255,255,0.02)',
                                            color: 'white',
                                            '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                            '&:hover fieldset': { borderColor: '#00ccff' },
                                            '&.Mui-focused fieldset': { borderColor: '#00ccff' }
                                        }
                                    }}
                                />
                            )
                        })}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <Button onClick={() => setEditTeam(null)} sx={{ color: 'text.secondary', fontWeight: 800 }}>CANCEL</Button>
                    <Button onClick={handleSaveEdit} variant="contained" sx={{ bgcolor: '#00ccff', color: 'black', fontWeight: 800, borderRadius: 0.5, '&:hover': { bgcolor: '#0099cc' } }}>
                        SAVE CHANGES
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Dashboard;
