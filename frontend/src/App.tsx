import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import NavBar from './components/layout/NavBar';
import Footer from './components/layout/Footer';
import Breadcrumbs from './components/layout/Breadcrumbs';
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import TopicsPage from './pages/protected/TopicsPage';
import TestPage from './pages/protected/TestPage';
import HistoryPage from './pages/protected/HistoryPage';
import ProfilePage from './pages/protected/ProfilePage';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminTopics from './pages/admin/AdminTopics';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDashboard from './pages/admin/AdminDashboard';
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';
import AdminSidebar from './components/admin/AdminSidebar';
import QuestionEditPage from './pages/admin/QuestionEditPage';
import TopicEditPage from './pages/admin/TopicEditPage';
import NotFoundPage from './pages/public/NotFoundPage';
import ThemedBackground from './components/common/ThemedBackground';
import "virtual:uno.css";

function App() {
  const { user } = useAuth();
  
  // Обертка с фоновым изображением
  const ContentWrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemedBackground>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumbs />
        {children}
      </div>
    </ThemedBackground>
  );

  // Обновленные обертки
  const HomeWithWrapper = () => <ContentWrapper><HomePage /></ContentWrapper>;
  const LoginWithWrapper = () => <ContentWrapper><LoginPage /></ContentWrapper>;
  const RegisterWithWrapper = () => <ContentWrapper><RegisterPage /></ContentWrapper>;
  const TestWithWrapper = () => <ContentWrapper><TestPage /></ContentWrapper>;
  const HistoryWithWrapper = () => <ContentWrapper><HistoryPage /></ContentWrapper>;
  const ProfileWithWrapper = () => <ContentWrapper><ProfilePage /></ContentWrapper>;
  const TopicsWithWrapper = () => <ContentWrapper><TopicsPage /></ContentWrapper>;
  const NotFoundWithWrapper = () => <ContentWrapper><NotFoundPage /></ContentWrapper>;

  // Обертка для админки
  const AdminLayout = () => (
    <ThemedBackground>
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <Breadcrumbs />
          <Outlet />
        </div>
      </div>
    </ThemedBackground>
  );


  return (
        
          <div className="flex flex-col min-h-screen dark:bg-gray-800">
            <NavBar />
            <main className="flex-grow">
              <Routes>
                
                {/* Публичные роуты */}
                <Route path="/login" element={<LoginWithWrapper />} />
                <Route path="/register" element={<RegisterWithWrapper />} />

                {/* Редирект для авторизованных */}
                <Route path="/" element={
                  user ? <Navigate to="/topics" replace /> : <HomeWithWrapper />
                } />

                {/* Защищенные роуты */}
                <Route element={<PrivateRoute />}>
                  <Route path="/test/:topic_id" element={<TestWithWrapper />} />
                  <Route path="/history" element={<HistoryWithWrapper />} />
                  <Route path="/profile" element={<ProfileWithWrapper />} />
                  <Route path="/topics" element={<TopicsWithWrapper />} />
                </Route>

                {/* Админские роуты */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="questions" element={<AdminQuestions />} />
                    <Route path="questions/new" element={<QuestionEditPage />} />
                    <Route path="questions/:id" element={<QuestionEditPage />} />
                    <Route path="topics" element={<AdminTopics />} />
                    <Route path="topics/new" element={<TopicEditPage />} />
                    <Route path="topics/:id" element={<TopicEditPage />} />
                    <Route path="users" element={<AdminUsers />} />
                  </Route>
                </Route>

                {/* 404 - Должен быть последним */}
                <Route path="*" element={<NotFoundWithWrapper />} />
              </Routes>
            </main>
            <Footer />
          </div>
        
  );
}

export default App;