import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { topics } from '../data/mockData';
import { getMyArticles, type StoredArticle } from '../services/articleService';
import { saveCourse, getCourseById, updateCourse } from '../services/courseService';
import type { CourseChapter } from '../types';
import { useToast } from '../contexts/ToastContext';
import RichTextEditor from '../components/RichTextEditor';

// Storage key for auto-saving course editor state (Safari tab discard protection)
const getStorageKey = (courseId: string | undefined) => `course-editor-${courseId || 'new'}`;

const CourseEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📚');
  const [category, setCategory] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [chapters, setChapters] = useState<CourseChapter[]>([]);
  const [availableArticles, setAvailableArticles] = useState<StoredArticle[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [restoredFromCache, setRestoredFromCache] = useState(false);

  // Standalone chapter editor state
  const [showChapterEditor, setShowChapterEditor] = useState(false);
  const [editingChapter, setEditingChapter] = useState<CourseChapter | null>(null);
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterDescription, setChapterDescription] = useState('');
  const [chapterContent, setChapterContent] = useState('');

  // Auto-save to sessionStorage (protects against Safari tab discard)
  const saveToSession = useCallback(() => {
    if (loading) return;
    const data = { title, description, icon, category, estimatedTime, chapters, showChapterEditor, chapterTitle, chapterDescription, chapterContent, editingChapter };
    sessionStorage.setItem(getStorageKey(id), JSON.stringify(data));
  }, [id, title, description, icon, category, estimatedTime, chapters, showChapterEditor, chapterTitle, chapterDescription, chapterContent, editingChapter, loading]);

  // Save to sessionStorage whenever form data changes
  useEffect(() => {
    saveToSession();
  }, [saveToSession]);

  // Also save when page becomes hidden (Safari discards soon after)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveToSession();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [saveToSession]);

  useEffect(() => {
    const loadData = async () => {
      // First, try to restore from sessionStorage (Safari tab discard recovery)
      const cached = sessionStorage.getItem(getStorageKey(id));
      if (cached) {
        try {
          const data = JSON.parse(cached);
          setTitle(data.title || '');
          setDescription(data.description || '');
          setIcon(data.icon || '📚');
          setCategory(data.category || '');
          setEstimatedTime(data.estimatedTime || '');
          setChapters(data.chapters || []);
          setShowChapterEditor(data.showChapterEditor || false);
          setChapterTitle(data.chapterTitle || '');
          setChapterDescription(data.chapterDescription || '');
          setChapterContent(data.chapterContent || '');
          setEditingChapter(data.editingChapter || null);
          setRestoredFromCache(true);
        } catch (e) {
          console.warn('Failed to restore course editor state:', e);
        }
      }

      // Load available articles
      const articles = await getMyArticles();
      setAvailableArticles(articles.filter(a => a.published));

      // Load existing course if editing (and not restored from cache)
      if (id && !cached) {
        const course = await getCourseById(id);
        if (course) {
          setTitle(course.title);
          setDescription(course.description);
          setIcon(course.icon);
          setCategory(course.category);
          setEstimatedTime(course.estimatedTime);
          setChapters(course.chapters);
        }
      }
      setLoading(false);
    };
    loadData();
  }, [id]);

  // Show toast when data restored from cache (Safari tab recovery)
  useEffect(() => {
    if (!loading && restoredFromCache) {
      toast.info('Draft restored from session');
      setRestoredFromCache(false);
    }
  }, [loading, restoredFromCache, toast]);

  const addChapter = (articleId: string) => {
    const article = availableArticles.find(a => a.id === articleId);
    if (!article) return;

    // Check if already added
    if (chapters.some(ch => ch.articleId === articleId)) {
      toast.warning('This article is already in the course');
      return;
    }

    const newChapter: CourseChapter = {
      id: crypto.randomUUID(),
      articleId: article.id,
      title: article.title,
      order: chapters.length + 1,
    };

    setChapters([...chapters, newChapter]);
  };

  const removeChapter = (chapterId: string) => {
    const updated = chapters
      .filter(ch => ch.id !== chapterId)
      .map((ch, index) => ({ ...ch, order: index + 1 }));
    setChapters(updated);
  };

  const moveChapter = (chapterId: string, direction: 'up' | 'down') => {
    const index = chapters.findIndex(ch => ch.id === chapterId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= chapters.length) return;

    const updated = [...chapters];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    
    // Update order
    updated.forEach((ch, i) => {
      ch.order = i + 1;
    });

    setChapters(updated);
  };

  // Open editor for new standalone chapter
  const openNewChapterEditor = () => {
    setEditingChapter(null);
    setChapterTitle('');
    setChapterDescription('');
    setChapterContent('');
    setShowChapterEditor(true);
  };

  // Open editor for editing existing standalone chapter
  const openEditChapterEditor = (chapter: CourseChapter) => {
    if (chapter.articleId) {
      toast.info('Article-linked chapters cannot be edited here. Edit the original article instead.');
      return;
    }
    setEditingChapter(chapter);
    setChapterTitle(chapter.title);
    setChapterDescription(chapter.description || '');
    setChapterContent(chapter.content || '');
    setShowChapterEditor(true);
  };

  // Save standalone chapter
  const saveStandaloneChapter = () => {
    if (!chapterTitle.trim()) {
      toast.warning('Please add a chapter title');
      return;
    }
    if (!chapterContent.trim()) {
      toast.warning('Please add chapter content');
      return;
    }

    if (editingChapter) {
      // Update existing chapter
      const updated = chapters.map(ch => 
        ch.id === editingChapter.id 
          ? { ...ch, title: chapterTitle, description: chapterDescription, content: chapterContent }
          : ch
      );
      setChapters(updated);
    } else {
      // Add new chapter
      const newChapter: CourseChapter = {
        id: crypto.randomUUID(),
        title: chapterTitle,
        description: chapterDescription,
        content: chapterContent,
        order: chapters.length + 1,
      };
      setChapters([...chapters, newChapter]);
    }

    setShowChapterEditor(false);
    setEditingChapter(null);
    setChapterTitle('');
    setChapterDescription('');
    setChapterContent('');
  };

  const handleSave = async (publish: boolean) => {
    if (!title.trim()) {
      toast.warning('Please add a course title');
      return;
    }
    if (chapters.length === 0) {
      toast.warning('Please add at least one chapter');
      return;
    }

    setSaving(true);

    const courseData = {
      title,
      description,
      icon,
      category: category || 'GENERAL',
      chapters,
      author: 'Sriteja',
      estimatedTime: estimatedTime || `${chapters.length * 10} min`,
      published: publish,
    };

    try {
      if (isEditing && id) {
        await updateCourse(id, courseData);
      } else {
        await saveCourse(courseData);
      }
      // Clear session cache on successful save
      sessionStorage.removeItem(getStorageKey(id));
      toast.success(publish ? 'Course published!' : 'Draft saved');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('Failed to save course: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const icons = ['📚', '🎓', '💡', '🚀', '🤖', '📱', '⚡', '🔥', '🎯', '💻', '🧠', '🔧'];

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">
            <span className="text-[var(--color-text-muted)]">Beyond</span>
            <span className="text-[var(--color-primary)]">code</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="px-4 py-2 text-sm border border-[var(--color-border)] text-[var(--color-text)] rounded-full hover:bg-[var(--color-background)] transition-colors"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="px-4 py-2 text-sm bg-[var(--color-primary)] text-white rounded-full hover:opacity-90 transition-colors"
            >
              {saving ? 'Publishing...' : 'Publish Course'}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-8">
          {isEditing ? 'Edit Course' : 'Create New Course'}
        </h1>

        <div className="space-y-6">
          {/* Icon Selector */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
              Course Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {icons.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`w-10 h-10 text-xl rounded-lg border transition-colors ${
                    icon === emoji
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/20'
                      : 'border-[var(--color-border)] hover:bg-[var(--color-surface)]'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
              Course Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Introduction to LLMs"
              className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50 focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will students learn in this course?"
              rows={3}
              className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50 focus:outline-none focus:border-[var(--color-primary)] resize-none"
            />
          </div>

          {/* Category & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
              >
                <option value="" className="bg-[var(--color-surface)]">Select a category</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.name.toUpperCase()} className="bg-[var(--color-surface)]">
                    {topic.icon} {topic.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                Estimated Time
              </label>
              <input
                type="text"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                placeholder="e.g., 2 hours"
                className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50 focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>

          {/* Chapters */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
              Chapters ({chapters.length})
            </label>
            
            {/* Add Chapter Options */}
            <div className="mb-4 flex gap-3">
              {/* Add from existing article */}
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addChapter(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="flex-1 px-4 py-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
              >
                <option value="" className="bg-[var(--color-surface)]">📄 Add existing article...</option>
                {availableArticles
                  .filter(a => !chapters.some(ch => ch.articleId === a.id))
                  .map((article) => (
                    <option key={article.id} value={article.id} className="bg-[var(--color-surface)]">
                      {article.title}
                    </option>
                  ))}
              </select>
              
              {/* Write new chapter */}
              <button
                type="button"
                onClick={openNewChapterEditor}
                className="px-4 py-3 border border-[var(--color-primary)] text-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary)]/10 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Write New Chapter
              </button>
            </div>

            {/* Chapter List */}
            {chapters.length === 0 ? (
              <div className="text-center py-12 bg-[var(--color-surface)] rounded-lg border-2 border-dashed border-[var(--color-border)]">
                <p className="text-[var(--color-text-muted)]">
                  No chapters yet. Add existing articles or write new chapters.
                </p>
                <div className="flex items-center justify-center gap-4 mt-4">
                  <Link
                    to="/write"
                    className="text-[var(--color-primary)] hover:underline"
                  >
                    Write article →
                  </Link>
                  <span className="text-[var(--color-text-muted)]">or</span>
                  <button
                    onClick={openNewChapterEditor}
                    className="text-[var(--color-primary)] hover:underline"
                  >
                    Write chapter →
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {chapters
                  .sort((a, b) => a.order - b.order)
                  .map((chapter, index) => (
                    <div
                      key={chapter.id}
                      className="flex items-center gap-3 p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]"
                    >
                      {/* Order Number */}
                      <span className="w-8 h-8 flex items-center justify-center bg-[var(--color-background)] rounded-full text-sm font-medium text-[var(--color-text-muted)]">
                        {index + 1}
                      </span>

                      {/* Title + Type Badge */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-[var(--color-text)]">{chapter.title}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            chapter.articleId 
                              ? 'bg-blue-500/20 text-blue-400' 
                              : 'bg-green-500/20 text-green-400'
                          }`}>
                            {chapter.articleId ? '📄 Article' : '✏️ Standalone'}
                          </span>
                        </div>
                        {chapter.description && (
                          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{chapter.description}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {/* Edit button for standalone chapters */}
                        {!chapter.articleId && (
                          <button
                            onClick={() => openEditChapterEditor(chapter)}
                            className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                            title="Edit chapter"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => moveChapter(chapter.id, 'up')}
                          disabled={index === 0}
                          className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-30"
                          title="Move up"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => moveChapter(chapter.id, 'down')}
                          disabled={index === chapters.length - 1}
                          className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-30"
                          title="Move down"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => removeChapter(chapter.id)}
                          className="p-1.5 text-red-400 hover:text-red-500"
                          title="Remove"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </main>
      )}

      {/* Standalone Chapter Editor Modal */}
      {showChapterEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface)] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--color-text)]">
                {editingChapter ? 'Edit Chapter' : 'New Standalone Chapter'}
              </h2>
              <button
                onClick={() => setShowChapterEditor(false)}
                className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                  Chapter Title *
                </label>
                <input
                  type="text"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  placeholder="e.g., Introduction to the Topic"
                  className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50 focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={chapterDescription}
                  onChange={(e) => setChapterDescription(e.target.value)}
                  placeholder="Brief summary of what this chapter covers"
                  className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50 focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                  Content *
                </label>
                <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
                  <RichTextEditor
                    content={chapterContent}
                    onChange={setChapterContent}
                    placeholder="Write your chapter content here..."
                  />
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowChapterEditor(false)}
                className="px-4 py-2 border border-[var(--color-border)] text-[var(--color-text)] rounded-lg hover:bg-[var(--color-background)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveStandaloneChapter}
                className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-colors"
              >
                {editingChapter ? 'Save Changes' : 'Add Chapter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseEditor;
