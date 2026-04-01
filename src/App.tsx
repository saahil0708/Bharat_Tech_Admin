import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Layout from "./Layout/Layout";
import Dashboard from "./Pages/Dashboard";
import Login from "./Pages/Login";
import MarkAttendance from "./Pages/MarkAttendance";
import AttendanceAdmin from "./Pages/AttendanceAdmin";
import ProtectedLayout from "./Layout/ProtectedLayout";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { useApiClientInit } from "./lib/useApiClientInit";

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#ff0000',
        },
        background: {
            default: '#0a0a0a',
            paper: '#121212',
        },
        text: {
            primary: '#ffffff',
            secondary: '#a0a0a0',
        },
    },
    typography: {
        fontFamily: '"Inter", sans-serif',
        h4: {
            fontWeight: 900,
            letterSpacing: '-1px',
        },
    },
    shape: {
        borderRadius: 8,
    },
});

const router = createBrowserRouter([
    {
        path: "/",
        element: <MarkAttendance />, // Public Portal
    },
    {
        path: "/login",
        element: <Login />, // Admin Secure Login
    },
    {
        path: "/admin",
        element: <ProtectedLayout />,
        children: [
            {
                element: <Layout />,
                children: [
                    {
                        index: true,
                        element: <Dashboard />,
                    },
                    {
                        path: "attendance",
                        element: <AttendanceAdmin />,
                    },
                ],
            },
        ],
    },
    {
        path: "*",
        element: <Navigate to="/" replace />
    }
]);

export default function App() {
    // Initialize API client to detect available server (localhost or production)
    useApiClientInit();
    
    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <RouterProvider router={router} />
        </ThemeProvider>
    )
}