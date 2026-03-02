import { useState, useEffect } from 'react';
import { subscribe, getSubscriberCount } from '../services/subscriberService';

const Newsletter = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [subscriberCount, setSubscriberCount] = useState(0);

  useEffect(() => {
    const loadCount = async () => {
      const count = await getSubscriberCount();
      setSubscriberCount(count);
    };
    loadCount();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const result = await subscribe(email, name);
    
    if (result.success) {
      setMessage({ type: 'success', text: '🎉 You\'re subscribed! Check your inbox for updates.' });
      setName('');
      setEmail('');
      setSubscriberCount(prev => prev + 1);
    } else {
      setMessage({ type: 'error', text: result.error || 'Something went wrong' });
    }
    
    setLoading(false);
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="card-gradient-border relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-[var(--color-primary)]/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-float" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[var(--color-secondary)]/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-float" style={{ animationDelay: '1s' }} />
        
        <div className="relative p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="animate-fade-in-up">
              <span className="text-[var(--color-secondary)] text-sm font-medium uppercase tracking-wider mb-4 block">Newsletter</span>
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-4">
                <span className="text-[var(--color-text)]">Stay </span>
                <span className="gradient-text italic">ahead</span>
                <span className="text-[var(--color-text)]"> of the curve.</span>
              </h2>
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                Get fresh articles on mobile development and AI engineering delivered to your inbox. No spam, ever.
              </p>
              
              {/* Stats */}
              <div className="flex gap-8 mt-8">
                <div>
                  <span className="text-2xl font-bold gradient-text">{subscriberCount}</span>
                  <p className="text-sm text-[var(--color-text-muted)]">Subscribers</p>
                </div>
                <div>
                  <span className="text-2xl font-bold gradient-text">Weekly</span>
                  <p className="text-sm text-[var(--color-text-muted)]">Digest</p>
                </div>
              </div>
            </div>
            
            {/* Right Content - Form */}
            <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              {message && (
                <div className={`mb-4 p-4 rounded-xl text-sm ${
                  message.type === 'success' 
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {message.text}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl glass border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                  />
                </div>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl glass border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full btn-primary py-4 rounded-xl text-lg group disabled:opacity-50"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? 'Subscribing...' : 'Subscribe — it\'s free'}
                    {!loading && (
                      <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    )}
                  </span>
                </button>
              </form>
              <p className="text-center text-sm text-[var(--color-text-muted)] mt-4">
                ✨ Join readers who are building the future of mobile AI.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
