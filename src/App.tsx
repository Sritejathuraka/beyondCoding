import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage, ArticleEditor, ArticleView, Dashboard, CourseEditor, CourseView } from './pages';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/write" element={<ArticleEditor />} />
        <Route path="/write/:id" element={<ArticleEditor />} />
        <Route path="/article/:id" element={<ArticleView />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/course/new" element={<CourseEditor />} />
        <Route path="/course/:id" element={<CourseView />} />
        <Route path="/course/:id/edit" element={<CourseEditor />} />
      </Routes>
    </Router>
  );
}

export default App
