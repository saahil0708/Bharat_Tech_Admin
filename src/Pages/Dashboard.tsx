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
    Tab,
    Select,
    MenuItem,
    FormControl,
    Divider
} from '@mui/material';
import { Users, Database, RefreshCw, Mail, FileText, Eye, X, Search, Edit, Trash2, FileDown, Hotel, MessageCircle, CheckCircle2, Plus, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { rooms } from '../data/rooms';
import { apiPost } from '../lib/apiClient';

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
    const [institutionFilter, setInstitutionFilter] = useState('');
    const [referenceFilter, setReferenceFilter] = useState('');
    const [currentTab, setCurrentTab] = useState(0);
    const [deleteTeamId, setDeleteTeamId] = useState<string | null>(null);
    const [editTeam, setEditTeam] = useState<any>(null);
    const [editFormData, setEditFormData] = useState<any>({});
    const [processingSelectionId, setProcessingSelectionId] = useState<string | null>(null);
    const [sendingBulkMails, setSendingBulkMails] = useState(false);
    const [bulkEmailType, setBulkEmailType] = useState('selection');

    // WhatsApp Hub
    const [whatsappHubOpen, setWhatsappHubOpen] = useState(false);
    const [waSelectedTeams, setWaSelectedTeams] = useState<any[]>([]);
    const [waSentStatus, setWaSentStatus] = useState<Record<string, boolean>>({});
    const [waMessageTemplate, setWaMessageTemplate] = useState(
        `Congratulations {{leader_name}}!\nYour team *{{team_name}}* has been selected for Bharat Tech.\nPlease join our official WhatsApp group for further updates:\nhttps://chat.whatsapp.com/GePM6IT1MzT8foOlENFczL?mode=gi_t`
    );
    const [waSearchTerm, setWaSearchTerm] = useState('');

    // Team Member Edit States
    const [editTeamMembers, setEditTeamMembers] = useState<any[]>([]);
    const [fetchingMembers, setFetchingMembers] = useState(false);
    const [initialMembers, setInitialMembers] = useState<any[]>([]); // To track deletions

    const openWhatsappHub = async () => {
        setRefreshing(true);
        try {
            const { data: selectedTeams, error } = await supabase
                .from('teams')
                .select('*')
                .eq('is_selected', true);

            if (error) throw error;
            setWaSelectedTeams(selectedTeams || []);
            setWhatsappHubOpen(true);
        } catch (err: any) {
            alert("Error fetching teams: " + err.message);
        } finally {
            setRefreshing(false);
        }
    };

    const fetchTeams = async () => {
        setRefreshing(true);
        if (teams.length === 0) setLoading(true);

        try {
            const from = page * rowsPerPage;
            const to = from + rowsPerPage - 1;

            let query = supabase
                .from('teams')
                .select('*', { count: 'exact' });

            if (currentTab === 2) {
                query = query.eq('is_selected', true);
            }

            if (searchTerm.trim() !== '') {
                // Safely searching common text columns including institution
                query = query.or(`team_name.ilike.%${searchTerm}%,leader_name.ilike.%${searchTerm}%,team_code.ilike.%${searchTerm}%,institution_name.ilike.%${searchTerm}%`);
            }

            if (institutionFilter.trim() !== '') {
                query = query.ilike('institution_name', `%${institutionFilter}%`);
            }

            if (referenceFilter.trim() !== '') {
                query = query.ilike('reference_source', `%${referenceFilter}%`);
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

    const openEditModal = async (team: any) => {
        setEditTeam(team);
        setEditFormData({ ...team });
        setFetchingMembers(true);
        try {
            const { data, error } = await supabase
                .from('team_members')
                .select('*')
                .eq('team_id', team.id);
            if (error) throw error;
            setEditTeamMembers(data || []);
            setInitialMembers(data || []);
        } catch (err: any) {
            console.error("Error fetching members:", err);
            alert("Could not load team members.");
        } finally {
            setFetchingMembers(false);
        }
    };

    const handleAddMember = () => {
        setEditTeamMembers([...editTeamMembers, { name: '', email: '', phone: '' }]);
    };

    const handleRemoveMember = (index: number) => {
        const newMembers = [...editTeamMembers];
        newMembers.splice(index, 1);
        setEditTeamMembers(newMembers);
    };

    const handleMemberChange = (index: number, field: string, value: string) => {
        const newMembers = [...editTeamMembers];
        newMembers[index] = { ...newMembers[index], [field]: value };
        setEditTeamMembers(newMembers);
    };

    const handleSaveEdit = async () => {
        try {
            const { id, created_at, ...updateData } = editFormData; // Prevent updating readonly fields
            
            // 1. Update Team Basic Details
            const { error: teamError } = await supabase.from('teams').update(updateData).eq('id', id);
            if (teamError) throw teamError;

            // 2. Synchronize Team Members
            // Deletions
            const membersToDelete = initialMembers.filter(initial => !editTeamMembers.find(current => current.id === initial.id));
            if (membersToDelete.length > 0) {
                const { error: deleteError } = await supabase.from('team_members').delete().in('id', membersToDelete.map(m => m.id));
                if (deleteError) throw deleteError;
            }

            // Updates & Insertions
            const membersToSync = editTeamMembers.map(m => ({ ...m, team_id: id }));
            const { error: syncError } = await supabase.from('team_members').upsert(membersToSync);
            if (syncError) throw syncError;

            alert("Team and members updated successfully!");
            setEditTeam(null);
            fetchTeams();
        } catch (err: any) {
            console.error("Save Error:", err);
            alert(err.message);
        }
    };

    const handleToggleSelection = async (team: any) => {
        setProcessingSelectionId(team.id);
        try {
            const newStatus = !team.is_selected;
            const { error } = await supabase.from('teams').update({ is_selected: newStatus }).eq('id', team.id);
            if (error) throw error;

            if (newStatus) {
                try {
                    const res = await apiPost('/api/emails/send-selection', { team });
                    if (!res.ok) throw new Error('Failed to send email');
                } catch (emailErr) {
                    console.error('Email error:', emailErr);
                    alert(`Team ${team.team_name || team.leader_name} selected but failed to send email. Check if the server (Render/Local) is reachable.`);
                }
            }

            fetchTeams();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setProcessingSelectionId(null);
        }
    };

    const handleExportCSV = async () => {
        setRefreshing(true);
        try {
            // Fetch ALL teams in the database, ignoring current filters for "overall data"
            const { data: allTeams, error } = await supabase
                .from('teams')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (!allTeams || allTeams.length === 0) {
                alert("No data available to export.");
                return;
            }

            // Dynamically determine all columns from the first record
            const exportColumns = Object.keys(allTeams[0]).filter(k => k !== 'count');
            const headers = exportColumns.map(col => col.replace(/_/g, ' ').toUpperCase());
            const csvRows = [headers.join(',')];

            // Map teams data to CSV rows
            allTeams.forEach(team => {
                const row = exportColumns.map(col => {
                    let val = team[col];
                    if (val === null || val === undefined) return '""';
                    // Escape quotes and wrap in quotes to handle commas within values
                    return `"${String(val).replace(/"/g, '""')}"`;
                });
                csvRows.push(row.join(','));
            });

            const csvContent = csvRows.join("\n");
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `teams_directory_complete_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            alert(`Export successful! ${allTeams.length} records processed.`);
        } catch (err: any) {
            console.error("Export Error:", err);
            alert("Failed to export: " + err.message);
        } finally {
            setRefreshing(false);
        }
    };

    const handleSendBulkMails = async () => {
        const typeLabels: Record<string, string> = {
            selection: "Selection/Congratulations",
            invitation: "Official Invitation Document",
            room_allotment: "Room Allotment Details"
        };
        const confirmation = window.confirm(`Are you sure you want to send "${typeLabels[bulkEmailType]}" emails to all selected teams? This might take a while.`);
        if (!confirmation) return;

        setSendingBulkMails(true);
        try {
            // Fetch all selected teams to ensure we have everyone, not just the current page
            const { data: selectedTeams, error } = await supabase.from('teams').select('*').eq('is_selected', true);

            if (error) throw error;
            if (!selectedTeams || selectedTeams.length === 0) {
                alert("No selected teams found.");
                setSendingBulkMails(false);
                return;
            }

            let successCount = 0;
            let failCount = 0;

            for (const team of selectedTeams) {
                try {
                    const res = await apiPost('/api/emails/send-bulk', { team, emailType: bulkEmailType });
                    if (!res.ok) throw new Error('Failed');
                    successCount++;
                } catch (emailErr) {
                    console.error('Email error for team:', team.team_name, emailErr);
                    failCount++;
                }
            }

            alert(`Finished sending bulk emails.\nSuccess: ${successCount}\nFailed: ${failCount}`);
        } catch (err: any) {
            console.error("Error fetching selected teams:", err);
            alert("Error: " + err.message);
        } finally {
            setSendingBulkMails(false);
        }
    };

    const handleAssignRooms = async () => {
        const confirmAssign = window.confirm("Are you sure you want to randomly assign rooms to all selected teams? This will overwrite existing assignments.");
        if (!confirmAssign) return;

        setRefreshing(true);
        try {
            // Fetch ALL selected teams, not just the current page
            const { data: allSelectedTeams, error: fetchError } = await supabase
                .from('teams')
                .select('*')
                .eq('is_selected', true);

            if (fetchError) throw fetchError;
            if (!allSelectedTeams || allSelectedTeams.length === 0) {
                alert("No selected teams found to assign.");
                return;
            }

            // Shuffle teams randomly
            const shuffledTeams = [...allSelectedTeams].sort(() => Math.random() - 0.5);
            
            let teamIdx = 0;
            const updates = [];

            for (const room of rooms) {
                for (let i = 0; i < room.capacity && teamIdx < shuffledTeams.length; i++) {
                    const team = shuffledTeams[teamIdx++];
                    updates.push(
                        supabase.from('teams').update({ room_no: room.name }).eq('id', team.id)
                    );
                }
            }

            if (teamIdx < shuffledTeams.length) {
                alert(`Warning: Not enough room capacity! Only ${teamIdx} out of ${shuffledTeams.length} teams were assigned rooms.`);
            }

            await Promise.all(updates);
            alert(`Successfully assigned rooms to ${teamIdx} teams.`);
            fetchTeams();
        } catch (err: any) {
            console.error(err);
            alert("Error assigning rooms: " + err.message);
        } finally {
            setRefreshing(false);
        }
    };

    const handleClearRooms = async () => {
        const confirmClear = window.confirm("Are you sure you want to clear room assignments for all selected teams?");
        if (!confirmClear) return;

        setRefreshing(true);
        try {
            const { error } = await supabase
                .from('teams')
                .update({ room_no: null })
                .eq('is_selected', true);

            if (error) throw error;
            
            alert("Successfully cleared all room assignments for selected teams.");
            fetchTeams();
        } catch (err: any) {
            console.error(err);
            alert("Error clearing rooms: " + err.message);
        } finally {
            setRefreshing(false);
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
    const preferredColumns = ['team_name', 'leader_name', 'leader_phone', 'institution_name', 'team_code'];
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
                    <Box sx={{ display: 'flex', gap: 1 }}>
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
                        <Tooltip title="Export to CSV">
                            <Button
                                variant="contained"
                                onClick={handleExportCSV}
                                sx={{ bgcolor: '#00ff00', color: 'black', minWidth: '48px', px: 0, borderRadius: 2, '&:hover': { bgcolor: '#00cc00' } }}
                                >
                                <FileDown size={20} />
                            </Button>
                        </Tooltip>
                    </Box>
            </Box>

            {/* Tabs & Search Bar */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'flex-start' }, gap: 2, mb: 3 }}>
                <Tabs
                    value={currentTab}
                    onChange={(_, newValue) => { setCurrentTab(newValue); setPage(0); }}
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{ '.MuiTab-root': { fontFamily: 'Azonix', fontSize: '0.9rem', minWidth: 120 } }}
                >
                    <Tab label="DIRECTORY" />
                    <Tab label="MANAGE TEAMS" />
                    <Tab label="SELECTED TEAMS" />
                </Tabs>

                <Stack spacing={2} sx={{ width: { xs: '100%', md: 'auto' }, alignItems: { xs: 'stretch', md: 'flex-end' } }}>
                    {/* Bulk Email UI (On Top of Searchbar) */}
                    {currentTab === 2 && (
                        <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: { xs: 'flex-start', md: 'flex-end' }, flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                onClick={handleClearRooms}
                                disabled={refreshing}
                                sx={{
                                    borderRadius: 0.5,
                                    fontFamily: 'Azonix',
                                    px: 3,
                                    bgcolor: 'rgba(255,0,0,0.1)',
                                    color: '#ff0000',
                                    border: '1px solid rgba(255,0,0,0.5)',
                                    fontWeight: 800,
                                    boxShadow: 'none',
                                    '&:hover': { bgcolor: '#ff0000', color: 'black' },
                                    '&.Mui-disabled': { bgcolor: 'rgba(255,0,0,0.05)', color: 'rgba(255,0,0,0.2)' }
                                }}
                                startIcon={<Trash2 size={18} />}
                            >
                                CLEAR ROOMS
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleAssignRooms}
                                disabled={refreshing}
                                sx={{
                                    borderRadius: 0.5,
                                    fontFamily: 'Azonix',
                                    px: 3,
                                    bgcolor: 'rgba(0,191,255,0.1)',
                                    color: '#00bfff',
                                    border: '1px solid rgba(0,191,255,0.5)',
                                    fontWeight: 800,
                                    boxShadow: 'none',
                                    '&:hover': { bgcolor: '#00bfff', color: 'black' },
                                    '&.Mui-disabled': { bgcolor: 'rgba(0,191,255,0.05)', color: 'rgba(0,191,255,0.2)' }
                                }}
                                startIcon={<Hotel size={18} />}
                            >
                                ALLOT ROOMS
                            </Button>
                            <Button
                                variant="contained"
                                onClick={openWhatsappHub}
                                disabled={refreshing}
                                sx={{
                                    borderRadius: 0.5,
                                    fontFamily: 'Azonix',
                                    px: 3,
                                    bgcolor: 'rgba(37,211,102,0.1)',
                                    color: '#25D366',
                                    border: '1px solid rgba(37,211,102,0.5)',
                                    fontWeight: 800,
                                    boxShadow: 'none',
                                    '&:hover': { bgcolor: '#25D366', color: 'black' },
                                    '&.Mui-disabled': { bgcolor: 'rgba(37,211,102,0.05)', color: 'rgba(37,211,102,0.2)' }
                                }}
                                startIcon={<MessageCircle size={18} />}
                            >
                                WHATSAPP GROUP
                            </Button>
                            <FormControl size="small" sx={{
                                minWidth: 260,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1,
                                    bgcolor: 'rgba(0,255,0,0.05)',
                                    color: '#00ff00',
                                    fontFamily: 'Azonix',
                                    fontSize: '0.8rem',
                                    '& fieldset': { borderColor: 'rgba(0,255,0,0.3)' },
                                    '&:hover fieldset': { borderColor: 'rgba(0,255,0,0.7)' },
                                    '&.Mui-focused fieldset': { borderColor: '#00ff00' }
                                },
                                '& .MuiSelect-icon': { color: '#00ff00' }
                            }}>
                                <Select
                                    value={bulkEmailType}
                                    onChange={(e) => setBulkEmailType(e.target.value)}
                                    // Make sure Paper matches dark theme
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                bgcolor: '#1a1a1a',
                                                border: '1px solid #00ff00',
                                                '& .MuiMenuItem-root': {
                                                    fontFamily: 'Azonix',
                                                    fontSize: '0.8rem',
                                                    color: '#fff',
                                                    '&:hover': { bgcolor: 'rgba(0,255,0,0.2)', color: '#00ff00' },
                                                    '&.Mui-selected': { bgcolor: 'rgba(0,255,0,0.3) !important', color: '#00ff00' }
                                                }
                                            }
                                        }
                                    }}
                                >
                                    <MenuItem value="selection">CONGRATULATIONS EMAIL</MenuItem>
                                    <MenuItem value="invitation">INVITATION DOC EMAIL</MenuItem>
                                    <MenuItem value="room_allotment">ROOM ALLOTMENT EMAIL</MenuItem>
                                </Select>
                            </FormControl>
                            <Button
                                variant="contained"
                                onClick={handleSendBulkMails}
                                disabled={sendingBulkMails}
                                sx={{
                                    borderRadius: 0.5,
                                    fontFamily: 'Azonix',
                                    px: 3,
                                    bgcolor: '#00ff00',
                                    color: '#000',
                                    fontWeight: 800,
                                    borderColor: 'transparent',
                                    '&:hover': { bgcolor: '#00cc00' },
                                    '&.Mui-disabled': { bgcolor: 'rgba(0,255,0,0.3)', color: 'rgba(0,0,0,0.5)' }
                                }}
                                startIcon={<Mail size={18} />}
                            >
                                {sendingBulkMails ? 'SENDING...' : 'SEND'}
                            </Button>
                        </Box>
                    )}

                    {/* Search Bar UI */}
                    <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
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
                                minWidth: { xs: '100%', md: '250px' },
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1,
                                    bgcolor: 'rgba(255,255,255,0.02)',
                                    '& fieldset': { borderColor: 'rgba(255,0,0,0.2)' },
                                    '&:hover fieldset': { borderColor: 'rgba(255,0,0,0.5)' },
                                    '&.Mui-focused fieldset': { borderColor: '#ff0000' }
                                }
                            }}
                        />
                        <TextField
                            placeholder="Filter by Institution..."
                            variant="outlined"
                            size="small"
                            value={institutionFilter}
                            onChange={(e) => setInstitutionFilter(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchTeams()}
                            sx={{
                                flexGrow: 1,
                                minWidth: { xs: '100%', md: '200px' },
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1,
                                    bgcolor: 'rgba(255,255,255,0.02)',
                                    '& fieldset': { borderColor: 'rgba(255,0,0,0.2)' },
                                    '&:hover fieldset': { borderColor: 'rgba(255,0,0,0.5)' },
                                    '&.Mui-focused fieldset': { borderColor: '#ff0000' }
                                }
                            }}
                        />
                        <TextField
                            placeholder="Filter by Reference..."
                            variant="outlined"
                            size="small"
                            value={referenceFilter}
                            onChange={(e) => setReferenceFilter(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchTeams()}
                            sx={{
                                flexGrow: 1,
                                minWidth: { xs: '100%', md: '200px' },
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
                </Stack>
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
                                        
                                        let displayContent: React.ReactNode = content || '-';
                                        if (typeof content === 'string' && content.length > 50) {
                                            displayContent = (
                                                <>
                                                    {content.substring(0, 50)}
                                                    <span 
                                                        style={{ color: '#ff0000', cursor: 'pointer', marginLeft: '4px', fontWeight: 'bold' }} 
                                                        onClick={() => setSelectedTeam(team)}
                                                    >
                                                        see more...
                                                    </span>
                                                </>
                                            );
                                        }

                                        return (
                                            <TableCell key={col} sx={{ py: 2, color: 'text.secondary', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {displayContent}
                                            </TableCell>
                                        );
                                    })}
                                    <TableCell sx={{ py: 2, textAlign: 'right', whiteSpace: 'nowrap' }}>
                                        {currentTab === 0 || currentTab === 2 ? (
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
                                                    disabled={processingSelectionId === team.id}
                                                    onClick={() => handleToggleSelection(team)}
                                                    sx={{
                                                        fontWeight: 800, borderRadius: 0.6, px: 2,
                                                        bgcolor: team.is_selected ? 'rgba(255,165,0,0.1)' : 'rgba(0,191,255,0.1)',
                                                        color: team.is_selected ? '#ffa500' : '#00bfff',
                                                        border: `1px solid ${team.is_selected ? 'rgba(255,165,0,0.5)' : 'rgba(0,191,255,0.5)'}`,
                                                        '&:hover': { bgcolor: team.is_selected ? '#ffa500' : '#00bfff', color: team.is_selected ? 'black' : 'white' }
                                                    }}
                                                >
                                                    {processingSelectionId === team.id ? 'PROCESSING...' : team.is_selected ? 'DESELECT' : 'SELECT'}
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
                            if (col === 'created_at' || col === 'id' || col === 'is_selected' || col === 'is_present' || col === 'room_no') return null; // Filter logic
                            return (
                                <TextField
                                    key={col}
                                    label={col.replace(/_/g, ' ').toUpperCase()}
                                    value={editFormData[col] || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, [col]: e.target.value })}
                                    variant="outlined"
                                    size="small"
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

                        <Box sx={{ mt: 2 }}>
                            <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.1)' }}>
                                <Typography sx={{ fontFamily: 'Azonix', color: '#00ccff', fontSize: '0.8rem', letterSpacing: 2 }}>
                                    TEAM MEMBERS
                                </Typography>
                            </Divider>

                            {fetchingMembers ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                    <CircularProgress size={24} sx={{ color: '#00ccff' }} />
                                </Box>
                            ) : (
                                <Stack spacing={2}>
                                    {editTeamMembers.map((member, idx) => (
                                        <Box key={idx} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 1, position: 'relative' }}>
                                            <IconButton 
                                                onClick={() => handleRemoveMember(idx)}
                                                sx={{ position: 'absolute', top: 4, right: 4, color: 'rgba(255,0,0,0.5)', '&:hover': { color: '#ff0000' } }}
                                                size="small"
                                            >
                                                <XCircle size={18} />
                                            </IconButton>
                                            <Stack spacing={2}>
                                                <TextField
                                                    label="MEMBER NAME"
                                                    value={member.name || ''}
                                                    onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                                                    variant="standard"
                                                    size="small"
                                                    fullWidth
                                                    InputLabelProps={{ shrink: true, sx: { color: 'text.secondary', fontSize: '0.7rem' } }}
                                                />
                                                <Box sx={{ display: 'flex', gap: 2 }}>
                                                    <TextField
                                                        label="EMAIL"
                                                        value={member.email || ''}
                                                        onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                                                        variant="standard"
                                                        size="small"
                                                        fullWidth
                                                        InputLabelProps={{ shrink: true, sx: { color: 'text.secondary', fontSize: '0.7rem' } }}
                                                    />
                                                    <TextField
                                                        label="PHONE"
                                                        value={member.phone || ''}
                                                        onChange={(e) => handleMemberChange(idx, 'phone', e.target.value)}
                                                        variant="standard"
                                                        size="small"
                                                        fullWidth
                                                        InputLabelProps={{ shrink: true, sx: { color: 'text.secondary', fontSize: '0.7rem' } }}
                                                    />
                                                </Box>
                                            </Stack>
                                        </Box>
                                    ))}
                                    
                                    <Button
                                        variant="outlined"
                                        startIcon={<Plus size={16} />}
                                        onClick={handleAddMember}
                                        fullWidth
                                        sx={{ 
                                            borderStyle: 'dashed', 
                                            color: '#00ccff', 
                                            borderColor: 'rgba(0,204,255,0.3)',
                                            '&:hover': { borderStyle: 'dashed', borderColor: '#00ccff', bgcolor: 'rgba(0,204,255,0.05)' }
                                        }}
                                    >
                                        ADD MEMBER
                                    </Button>
                                </Stack>
                            )}
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <Button onClick={() => setEditTeam(null)} sx={{ color: 'text.secondary', fontWeight: 800 }}>CANCEL</Button>
                    <Button onClick={handleSaveEdit} variant="contained" sx={{ bgcolor: '#00ccff', color: 'black', fontWeight: 800, borderRadius: 0.5, '&:hover': { bgcolor: '#0099cc' } }}>
                        SAVE CHANGES
                    </Button>
                </DialogActions>
            </Dialog>

            {/* WhatsApp Hub Modal */}
            <Dialog 
                open={whatsappHubOpen} 
                onClose={() => setWhatsappHubOpen(false)} 
                maxWidth="md" 
                fullWidth 
                PaperProps={{ sx: { bgcolor: '#0a0a0a', border: '1px solid #25D366', borderRadius: 1 } }}
            >
                <DialogTitle sx={{ color: 'white', fontWeight: 900, fontFamily: 'Azonix', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    WHATSAPP <span style={{ color: '#25D366' }}>BROADCASTER</span>
                </DialogTitle>
                <DialogContent sx={{ p: {xs: 2, md: 3} }}>
                    <Typography color="text.secondary" mb={3} sx={{ mt: 1 }}>
                        Native WhatsApp does not allow sending bulk messages to unsaved contacts. Use this rapid-fire list to quickly send the group invite to all selected leaders one by one.
                    </Typography>
                    
                    <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(37,211,102,0.05)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: 1 }}>
                        <Typography sx={{ color: '#25D366', fontWeight: 800, mb: 1.5, fontSize: '0.75rem', letterSpacing: 1 }}>EDIT MESSAGE TEMPLATE</Typography>
                        <TextField
                            multiline
                            rows={4}
                            value={waMessageTemplate}
                            onChange={(e) => setWaMessageTemplate(e.target.value)}
                            fullWidth
                            variant="standard"
                            placeholder="Type your message here..."
                            helperText="Use {{leader_name}} and {{team_name}} as placeholders"
                            FormHelperTextProps={{ sx: { color: 'rgba(255,255,255,0.4)' } }}
                            sx={{
                                '& .MuiInputBase-root': {
                                    color: 'white',
                                    fontSize: '0.9rem',
                                    fontFamily: 'inherit',
                                    lineHeight: 1.5,
                                    '&:before': { borderColor: 'rgba(37,211,102,0.3)' },
                                    '&:after': { borderColor: '#25D366' }
                                }
                            }}
                        />
                    </Box>

                    <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Users size={14} /> RECIPIENTS ({waSelectedTeams.length})
                        </Typography>
                        <TextField
                            size="small"
                            placeholder="Search team or leader..."
                            value={waSearchTerm}
                            onChange={(e) => setWaSearchTerm(e.target.value)}
                            sx={{
                                width: { xs: '100%', md: '250px' },
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'rgba(255,255,255,0.02)',
                                    color: 'white',
                                    borderRadius: 1,
                                    fontSize: '0.85rem',
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                    '&:hover fieldset': { borderColor: '#25D366' },
                                    '&.Mui-focused fieldset': { borderColor: '#25D366' }
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search size={16} color="rgba(255,255,255,0.5)" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>

                    <Stack spacing={2} sx={{ maxHeight: '40vh', overflowY: 'auto', pr: 1 }}>
                        {waSelectedTeams
                            .filter(team => 
                                (team.team_name?.toLowerCase() || '').includes(waSearchTerm.toLowerCase()) || 
                                (team.leader_name?.toLowerCase() || '').includes(waSearchTerm.toLowerCase())
                            )
                            .map((team) => {
                            const isSent = waSentStatus[team.id];
                            const phoneFixed = team.leader_phone?.replace(/\D/g, '') || '';
                            const phone = phoneFixed.length === 10 ? '91' + phoneFixed : phoneFixed;
                            
                            // Process parameters in template
                            const personalizedMsg = waMessageTemplate
                                .replace(/{{leader_name}}/g, team.leader_name || 'Leader')
                                .replace(/{{team_name}}/g, team.team_name || 'Team');
                            
                            const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(personalizedMsg)}`;

                            return (
                                <Box key={team.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.02)', border: isSent ? '1px solid rgba(37,211,102,0.5)' : '1px solid rgba(255,255,255,0.05)', borderRadius: 1 }}>
                                    <Box>
                                        <Typography sx={{ color: 'white', fontWeight: 800 }}>{team.team_name || 'Unnamed Team'}</Typography>
                                        <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{team.leader_name} | {team.leader_phone}</Typography>
                                    </Box>
                                    <Button
                                        variant="outlined"
                                        startIcon={isSent ? <CheckCircle2 size={16} /> : <MessageCircle size={16} />}
                                        onClick={() => {
                                            if (!phoneFixed) {
                                                alert("No valid phone number for this team.");
                                                return;
                                            }
                                            window.open(waLink, '_blank');
                                            setWaSentStatus(prev => ({ ...prev, [team.id]: true }));
                                        }}
                                        sx={{
                                            fontWeight: 800,
                                            minWidth: '120px',
                                            color: isSent ? '#25D366' : 'white',
                                            borderColor: isSent ? '#25D366' : 'rgba(255,255,255,0.3)',
                                            bgcolor: isSent ? 'rgba(37,211,102,0.1)' : 'transparent',
                                            '&:hover': { bgcolor: 'rgba(37,211,102,0.2)', borderColor: '#25D366', color: '#25D366' }
                                        }}
                                    >
                                        {isSent ? 'SENT' : 'SEND WA'}
                                    </Button>
                                </Box>
                            )
                        })}
                        {waSelectedTeams.length === 0 && (
                            <Typography sx={{ textAlign: 'center', p: 3, color: 'text.secondary' }}>No selected teams found to broadcast.</Typography>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <Button onClick={() => setWhatsappHubOpen(false)} sx={{ color: 'text.secondary', fontWeight: 800 }}>CLOSE</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Dashboard;
