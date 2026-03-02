import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage, ArticleEditor, ArticleView, Dashboard, CourseEditor, CourseView, CourseChapterView, Login, ForgotPassword, CoursesPage, BlogsPage, AboutPage, ContactPage } from './pages';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/article/:id" element={<ArticleView />} />
          <Route path="/course/:id" element={<CourseView />} />
          <Route path="/course/:courseId/chapter/:articleId" element={<CourseChapterView />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Protected admin routes - require admin/author role */}
          <Route path="/write" element={
            <ProtectedRoute requireAdmin><ArticleEditor /></ProtectedRoute>
          } />
          <Route path="/write/:id" element={
            <ProtectedRoute requireAdmin><ArticleEditor /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute requireAdmin><Dashboard /></ProtectedRoute>
          } />
          <Route path="/course/new" element={
            <ProtectedRoute requireAdmin><CourseEditor /></ProtectedRoute>
          } />
          <Route path="/course/:id/edit" element={
            <ProtectedRoute requireAdmin><CourseEditor /></ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App
