import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { topics } from '../data/mockData';
import { getMyArticles, type StoredArticle } from '../services/articleService';
import { saveCourse, getCourseById, updateCourse } from '../services/courseService';
import type { CourseChapter } from '../types';
import { useToast } from '../contexts/ToastContext';

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

  useEffect(() => {
    const loadData = async () => {
      // Load available articles
      const articles = await getMyArticles();
      setAvailableArticles(articles.filter(a => a.published));

      // Load existing course if editing
      if (id) {
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
            
            {/* Add Chapter */}
            <div className="mb-4">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addChapter(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
              >
                <option value="" className="bg-[var(--color-surface)]">+ Add article as chapter...</option>
                {availableArticles
                  .filter(a => !chapters.some(ch => ch.articleId === a.id))
                  .map((article) => (
                    <option key={article.id} value={article.id} className="bg-[var(--color-surface)]">
                      {article.title}
                    </option>
                  ))}
              </select>
            </div>

            {/* Chapter List */}
            {chapters.length === 0 ? (
              <div className="text-center py-12 bg-[var(--color-surface)] rounded-lg border-2 border-dashed border-[var(--color-border)]">
                <p className="text-[var(--color-text-muted)]">
                  No chapters yet. Add articles to create your course structure.
                </p>
                <Link
                  to="/write"
                  className="inline-block mt-2 text-[var(--color-primary)] hover:underline"
                >
                  Write a new article →
                </Link>
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

                      {/* Title */}
                      <div className="flex-1">
                        <p className="font-medium text-[var(--color-text)]">{chapter.title}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
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
    </div>
  );
};

export default CourseEditor;
