import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CreateExamPage from './pages/CreateExamPage';
import TakeExamPage from './pages/TakeExamPage';
import EditExamPage from './pages/EditExamPage';
import ResultsPage from './pages/ResultsPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-exam"
          element={
            <ProtectedRoute>
              <CreateExamPage />
            </ProtectedRoute>
          } />
        <Route
          path="/edit-exam/:id"
          element={
            <ProtectedRoute>
              <EditExamPage />
            </ProtectedRoute>
          } />
        <Route
          path="/take-exam/:id"
          element={
            <ProtectedRoute>
              <TakeExamPage />
            </ProtectedRoute>
          } />
        <Route
          path="/results"
          element={
            <ProtectedRoute>
              <ResultsPage />
            </ProtectedRoute>
          } />
      </Routes>
    </Router>
  );
}

export default App;
