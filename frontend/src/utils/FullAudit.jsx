import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, CircularProgress, Chip } from '@mui/material';
import api from '../services/api';

const FullAudit = () => {
    const [logs, setLogs] = useState([]);
    const [isRunning, setIsRunning] = useState(false);

    const endpointsToTest = [
        // --- AUTH ---
        { url: '/auth/signin', desc: 'Login (POST - Skip Audit)' }, // Just for reference

        // --- SPECIFIC ROUTES ---
        { url: '/routes', desc: 'Danh sách lộ trình (Real)' },
        { url: '/stations', desc: 'Danh sách trạm (Real)' },
        { url: '/trips', desc: 'Danh sách chuyến đi (Real)' },
        { url: '/trips/my-schedule', desc: 'Lịch trình tài xế (Driver Only)' },

        // --- GENERIC CRUD MODELS ---
        { url: '/students', desc: 'Danh sách học sinh (Generic)' },
        { url: '/users', desc: 'Danh sách người dùng (Generic)' },
        { url: '/buses', desc: 'Danh sách xe buýt (Generic)' },
        { url: '/schedules', desc: 'Danh sách lịch trình (Generic)' },
        { url: '/notifications', desc: 'Danh sách thông báo (Generic)' },
        { url: '/alerts', desc: 'Cảnh báo (Generic)' },
        { url: '/locations', desc: 'Vị trí (Generic)' },
    ];

    const runAudit = async () => {
        setIsRunning(true);
        setLogs([]);
        console.log("--- BẮT ĐẦU TỔNG KIỂM TRA API ---");

        const newLogs = [];

        for (const endpoint of endpointsToTest) {
            try {
                const start = Date.now();
                const res = await api.get(endpoint.url);
                const duration = Date.now() - start;
                
                let statusIcon = '✅';
                let statusText = `${res.status} OK`;
                let dataSummary = '';

                if (Array.isArray(res.data)) {
                    dataSummary = `Mảng ${res.data.length} phần tử`;
                    if (res.data.length === 0) statusIcon = '⚠️';
                } else if (res.data?.data && Array.isArray(res.data.data)) {
                     dataSummary = `Mảng ${res.data.data.length} phần tử (trong .data)`;
                } else {
                    dataSummary = 'Object/Other';
                }

                const logMsg = `${statusIcon} [${statusText}] ${endpoint.url} -> ${dataSummary} (${duration}ms)`;
                console.log(logMsg);
                console.log('   Data:', res.data);
                
                newLogs.push({ 
                    status: 'success', 
                    msg: logMsg, 
                    detail: res.data 
                });

            } catch (err) {
                let statusIcon = '❌';
                let statusText = err.response?.status || 'Error';
                let errorMsg = err.response?.statusText || err.message;
                
                if (err.response?.status === 403 || err.response?.status === 401) {
                    statusIcon = '⛔'; // Permission denied
                }

                const logMsg = `${statusIcon} [${statusText}] ${endpoint.url} -> ${errorMsg}`;
                console.error(logMsg);
                
                newLogs.push({ 
                    status: 'error', 
                    msg: logMsg,
                    detail: err.response?.data
                });
            }
            // Update logs in real-time (or close to it)
            setLogs([...newLogs]);
        }

        console.log("--- KẾT THÚC KIỂM TRA ---");
        setIsRunning(false);
    };

    return (
        <Paper sx={{ p: 3, mt: 3, bgcolor: '#1e1e1e', color: '#fff' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#4caf50' }}>
                    🛡️ API Full Audit Tool
                </Typography>
                <Button 
                    variant="contained" 
                    color="warning" 
                    onClick={runAudit}
                    disabled={isRunning}
                    startIcon={isRunning ? <CircularProgress size={20} color="inherit"/> : null}
                >
                    {isRunning ? 'Đang quét...' : 'Chạy kiểm tra ngay'}
                </Button>
            </Box>

            <Box sx={{ 
                maxHeight: '400px', 
                overflowY: 'auto', 
                fontFamily: 'monospace', 
                fontSize: '0.9rem',
                bgcolor: '#000',
                p: 2,
                borderRadius: 1
            }}>
                {logs.length === 0 && <Typography color="gray">Nhấn nút để bắt đầu quét...</Typography>}
                {logs.map((log, index) => (
                    <Box key={index} sx={{ mb: 1, borderBottom: '1px solid #333', pb: 0.5 }}>
                        <Typography component="span" sx={{ mr: 1 }}>
                            {log.msg}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
};

export default FullAudit;
