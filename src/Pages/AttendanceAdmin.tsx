import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Tooltip, TextField, InputAdornment, Button, TablePagination } from '@mui/material';
import { CheckCircle2, XCircle, Search, RefreshCw, Users, FileDown } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const AttendanceAdmin = () => {
    const [teams, setTeams] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [institutionFilter, setInstitutionFilter] = useState('');
    const [referenceFilter, setReferenceFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [globalPresentCount, setGlobalPresentCount] = useState(0);
    const [filteredCount, setFilteredCount] = useState(0);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const from = page * rowsPerPage;
            const to = from + rowsPerPage - 1;

            // Fetch data for the main list (filtered for present teams)
            let query = supabase.from('teams').select('*', { count: 'exact' }).eq('is_present', true);
            if (searchTerm.trim() !== '') {
                query = query.or(`team_name.ilike.%${searchTerm}%,team_code.ilike.%${searchTerm}%,institution_name.ilike.%${searchTerm}%`);
            }

            if (institutionFilter.trim() !== '') {
                query = query.ilike('institution_name', `%${institutionFilter}%`);
            }
            if (referenceFilter.trim() !== '') {
                query = query.ilike('reference_source', `%${referenceFilter}%`);
            }
            const { data, count, error } = await query
                .order('created_at', { ascending: true })
                .range(from, to);

            if (error) throw error;
            setTeams(data || []);
            if (count !== null) setFilteredCount(count);

            // Fetch global counts for the header
            const [{ count: presentCount }, { count: totalTeamsCount }] = await Promise.all([
                supabase.from('teams').select('*', { count: 'exact', head: true }).eq('is_present', true),
                supabase.from('teams').select('*', { count: 'exact', head: true })
            ]);

            if (presentCount !== null) setGlobalPresentCount(presentCount);
            if (totalTeamsCount !== null) setTotalCount(totalTeamsCount);

        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, [searchTerm, institutionFilter, referenceFilter, page, rowsPerPage]);

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleExportCSV = async () => {
        setLoading(true);
        try {
            // Fetch ALL teams in the database, ignoring current filters for "overall data"
            const { data: allTeams, error } = await supabase
                .from('teams')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;
            if (!allTeams || allTeams.length === 0) {
                alert("No data available to export.");
                return;
            }

            // Dynamically determine all columns from the first record
            const exportColumns = Object.keys(allTeams[0]).filter(k => k !== 'count');
            const headers = exportColumns.map(col => col.replace(/_/g, ' ').toUpperCase());
            const csvRows = [headers.join(',')];

            allTeams.forEach(team => {
                const row = exportColumns.map(col => {
                    let val = team[col];
                    if (val === null || val === undefined) return '""';
                    if (typeof val === 'boolean') val = val ? "YES" : "NO";
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
            link.setAttribute("download", `attendance_complete_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            alert(`Export successful! ${allTeams.length} records processed.`);
        } catch (err: any) {
            console.error(err);
            alert("Failed to export: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Remove local presentCount calculation as it only reflects current page

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ mb: 1, fontWeight: 900, fontFamily: 'Azonix' }}>
                        ATTENDANCE <span style={{ color: '#ff0000' }}>MONITOR</span>
                    </Typography>
                    <Typography color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Users size={16} /> Live tracking of team check-ins
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, md: 4 } }}>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h3" sx={{ fontWeight: 900, color: '#00ff00', fontFamily: 'Azonix', lineHeight: 1 }}>
                            {globalPresentCount} <span style={{ fontSize: '1.5rem', color: 'text.secondary' }}>/ {totalCount}</span>
                        </Typography>
                        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800 }}>TEAMS PRESENT</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Refresh Data">
                            <IconButton
                                onClick={fetchAttendance}
                                sx={{ bgcolor: 'rgba(255,0,0,0.1)', color: '#ff0000', border: '1px solid rgba(255,0,0,0.2)', borderRadius: 2, p: 1.5 }}
                            >
                                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Export Report">
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
            </Box>

            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                    placeholder="Search by Team Name, Code or Institution..."
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Search size={18} color="#ff0000" /></InputAdornment> }}
                    sx={{
                        width: { xs: '100%', md: '400px' },
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
                    sx={{
                        width: { xs: '100%', md: '300px' },
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
                    sx={{
                        width: { xs: '100%', md: '300px' },
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 1,
                            bgcolor: 'rgba(255,255,255,0.02)',
                            '& fieldset': { borderColor: 'rgba(255,0,0,0.2)' },
                            '&:hover fieldset': { borderColor: 'rgba(255,0,0,0.5)' },
                            '&.Mui-focused fieldset': { borderColor: '#ff0000' }
                        }
                    }}
                />
            </Box>

            <TableContainer component={Paper} sx={{ bgcolor: 'background.paper', borderRadius: 1, border: '1px solid rgba(255,255,255,0.05)' }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'rgba(255,0,0,0.05)' }}>
                            <TableCell sx={{ fontWeight: 800, color: 'primary.main', fontFamily: 'Azonix' }}>TEAM NAME</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: 'primary.main', fontFamily: 'Azonix' }}>UNIQUE CODE</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: 'primary.main', fontFamily: 'Azonix' }}>ROOM NO</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: 'primary.main', fontFamily: 'Azonix', textAlign: 'center' }}>STATUS</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {teams.map((team) => (
                            <TableRow key={team.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                                <TableCell sx={{ fontWeight: 600, color: 'white' }}>{team.team_name || 'N/A'}</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontFamily: 'monospace', letterSpacing: 1 }}>{team.team_code || '---'}</TableCell>
                                <TableCell sx={{ color: '#00ff00', fontWeight: 700 }}>{team.room_no || 'NOT ASSIGNED'}</TableCell>
                                <TableCell sx={{ textAlign: 'center' }}>
                                    {team.is_present ? (
                                        <Chip
                                            icon={<CheckCircle2 size={16} />}
                                            label="PRESENT"
                                            color="success"
                                            variant="outlined"
                                            sx={{ fontWeight: 800, borderColor: 'rgba(0,255,0,0.5)', bgcolor: 'rgba(0,255,0,0.1)' }}
                                        />
                                    ) : (
                                        <Chip
                                            icon={<XCircle size={16} />}
                                            label="ABSENT"
                                            color="error"
                                            variant="outlined"
                                            sx={{ fontWeight: 800, borderColor: 'rgba(255,0,0,0.3)', color: 'text.secondary' }}
                                        />
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {teams.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={3} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                                    No teams found.
                                </TableCell>
                            </TableRow>
                        )}
                        {loading && teams.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} align="center" sx={{ py: 10 }}>
                                    <RefreshCw className="animate-spin" color="#ff0000" />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {teams.length > 0 && (
                    <TablePagination
                        component="div"
                        count={filteredCount}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[10, 20, 50]}
                        sx={{
                            borderTop: '1px solid rgba(255, 0, 0, 0.1)',
                            color: 'text.secondary',
                            '.MuiTablePagination-selectIcon': { color: 'text.secondary' },
                            '.MuiTablePagination-actions button': { color: 'text.secondary' }
                        }}
                    />
                )}
            </TableContainer>
        </Box>
    );
};

export default AttendanceAdmin;
