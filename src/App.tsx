import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import NavBar from './components/layout/NavBar';
import Footer from './components/layout/Footer';
import Breadcrumbs from './components/layout/Breadcrumbs';
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import TestPage from './pages/protected/TestPage';
import HistoryPage from './pages/protected/HistoryPage';
import ProfilePage from './pages/protected/ProfilePage';
import AdminPanel from './pages/admin/AdminPanel';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminTopics from './pages/admin/AdminTopics';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDashboard from './pages/admin/AdminDashboard';
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';
import AdminSidebar from './components/admin/AdminSidebar';
import NotFoundPage from './pages/public/NotFoundPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <div className="flex flex-col min-h-screen">
            <NavBar />
            
            <main className="flex-grow">
              <Routes>
                <Route path="/admin/*" element={
  <AdminRoute>
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <Breadcrumbs />
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="questions" element={<AdminQuestions />} />
          <Route path="topics" element={<AdminTopics />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </div>
  </AdminRoute>
} />
                
                <Route path="*" element={
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Breadcrumbs />
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      
                      <Route path="/test/:topic" element={
                        <PrivateRoute>
                          <TestPage />
                        </PrivateRoute>
                      } />
                      
                      <Route path="/history" element={
                        <PrivateRoute>
                          <HistoryPage />
                        </PrivateRoute>
                      } />
                      
                      <Route path="/profile" element={
                        <PrivateRoute>
                          <ProfilePage />
                        </PrivateRoute>
                      } />
                      
                      <Route path="/topics" element={
                        <PrivateRoute>
                          <div>Страница тем</div>
                        </PrivateRoute>
                      } />
                      
<Route path="/admin" element={
  <PrivateRoute>
    <AdminRoute>
      <AdminPanel />
    </AdminRoute>
  </PrivateRoute>
} />

                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </div>
                } />
              </Routes>
            </main>
            
            <Footer />
          </div>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;