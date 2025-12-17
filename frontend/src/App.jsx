import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './components/Landing';
import Registration from './components/Register/Register';
import Onboarding from './components/Onboarding';
// import Dashboard from './components/Dashboard'; 
import NotFound from './components/NotFound';
import ProtectedRoute from './components/Shared/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Registration />} />

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        /> */}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;