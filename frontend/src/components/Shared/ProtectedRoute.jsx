import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (!token) {
    return (
      <Navigate 
        to="/" 
        state={{ 
          from: location,
          showLogin: true,
          sessionExpired: false
        }} 
        replace 
      />
    );
  }

  return children;
};

export default ProtectedRoute;