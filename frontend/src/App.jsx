import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EventGroupsPage from './pages/EventGroupsPage';
import EventGroupDetailPage from './pages/EventGroupDetailPage';
import EventDetailPage from './pages/EventDetailPage';
import CheckInPage from './pages/CheckInPage';
import AttendancePage from './pages/AttendancePage';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Navbar />
                    <Routes>
                        {/* Public routes */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/check-in" element={<CheckInPage />} />

                        {/* Protected routes */}
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/event-groups" element={
                            <ProtectedRoute>
                                <EventGroupsPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/event-groups/:groupId" element={
                            <ProtectedRoute>
                                <EventGroupDetailPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/events/:eventId" element={
                            <ProtectedRoute>
                                <EventDetailPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/events/:eventId/attendance" element={
                            <ProtectedRoute>
                                <AttendancePage />
                            </ProtectedRoute>
                        } />

                        {/* Default redirect */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
