import { Navigate, Outlet } from 'react-router-dom';

const ProtectedLayout = () => {
    // Check for secure authentication token
    const isAuthenticated = localStorage.getItem('adminAuth') === 'true';

    // If not authenticated, deflect back to secure login portal
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Authorized
    return <Outlet />;
};

export default ProtectedLayout;
