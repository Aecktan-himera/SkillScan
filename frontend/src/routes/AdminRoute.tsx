import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader'; // Импорт кастомного Loader

const AdminRoute: React.FC = () => {
  const { user, isInitializing } = useAuth();
  
  if (isInitializing) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="text-emerald-500" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (user.role !== 'admin') {
    return <Navigate to="/topics" replace />;
  }
  
  return <Outlet />;
};

export default AdminRoute;