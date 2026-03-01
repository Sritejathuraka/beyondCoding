import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import RichTextEditor from '../components/RichTextEditor';
import { topics } from '../data/mockData';
import { 
  saveArticle, 
  getArticleById, 
  updateArticle, 
  calculateReadTime 
} from '../services/articleService';

// Helper to strip HTML tags for word count
const stripHtml = (html: string): string => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

const ArticleEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      const article = getArticleById(id);
      if (article) {
        setTitle(article.title);
        setDescription(article.description);
        setContent(article.content);
        setCategory(article.category);
      }
    }
  }, [id]);

  const handleSaveDraft = () => {
    if (!title.trim()) {
      alert('Please add a title');
      return;
    }

    setSaving(true);
    
    const articleData = {
      title,
      description,
      content,
      category: category || 'GENERAL',
      author: 'Sriteja',
      date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      readTime: calculateReadTime(content),
      published: false,
    };

    if (isEditing && id) {
      updateArticle(id, articleData);
    } else {
      saveArticle(articleData);
    }

    setSaving(false);
    navigate('/dashboard');
  };

  const handlePublish = () => {
    if (!title.trim()) {
      alert('Please add a title');
      return;
    }
    if (!content.trim()) {
      alert('Please add some content');
      return;
    }
    if (!category) {
      alert('Please select a category');
      return;
    }

    setSaving(true);

    const articleData = {
      title,
      description,
      content,
      category,
      author: 'Sriteja',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      readTime: calculateReadTime(content),
      published: true,
    };

    if (isEditing && id) {
      updateArticle(id, articleData);
    } else {
      saveArticle(articleData);
    }

    setSaving(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Editor Header */}
      <header className="border-b border-[var(--color-border)] bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">
            <span className="text-[var(--color-text)]">Beyond</span>
            <span className="text-[var(--color-primary)]">code</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="px-4 py-2 text-sm border border-[var(--color-border)] rounded-full hover:bg-gray-50 transition-colors"
            >
              Save Draft
            </button>
            <button
              onClick={handlePublish}
              disabled={saving}
              className="px-4 py-2 text-sm bg-[var(--color-primary)] text-white rounded-full hover:bg-[#a84a3a] transition-colors"
            >
              {saving ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>
      </header>

      {/* Editor Content */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        {showPreview ? (
          /* Preview Mode */
          <div className="bg-white rounded-xl p-8 border border-[var(--color-border)]">
            <span className="inline-block px-3 py-1 bg-[#fbe8de] text-[var(--color-primary)] text-xs font-medium rounded-full mb-4">
              {category || 'GENERAL'}
            </span>
            <h1 className="text-4xl font-bold mb-4">{title || 'Untitled Article'}</h1>
            <p className="text-[var(--color-text-muted)] mb-6">{description}</p>
            <div className="flex items-center gap-3 mb-8 pb-8 border-b border-[var(--color-border)]">
              <div className="w-10 h-10 bg-[var(--color-text-muted)] rounded-full flex items-center justify-center text-white text-sm font-medium">
                ST
              </div>
              <div>
                <p className="font-medium">Sriteja</p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {calculateReadTime(stripHtml(content))}
                </p>
              </div>
            </div>
            <article 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: content || '<em>No content yet...</em>' }}
            />
          </div>
        ) : (
          /* Edit Mode */
          <div className="space-y-6">
            {/* Category Selector */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full md:w-auto px-4 py-2 border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:border-[var(--color-primary)]"
              >
                <option value="">Select a category</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.name.toUpperCase()}>
                    {topic.icon} {topic.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Title Input */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title..."
              className="w-full text-4xl font-bold bg-transparent border-none outline-none placeholder-gray-300"
            />

            {/* Description Input */}
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description (shown in article cards)..."
              className="w-full text-lg text-[var(--color-text-muted)] bg-transparent border-none outline-none placeholder-gray-300"
            />

            {/* Rich Text Editor */}
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Start writing your article..."
            />

            {/* Word count */}
            <div className="text-right text-sm text-[var(--color-text-muted)]">
              {stripHtml(content).trim().split(/\s+/).filter(Boolean).length} words · {calculateReadTime(stripHtml(content))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ArticleEditor;
