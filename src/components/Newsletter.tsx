import { useState } from 'react';

const Newsletter = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle subscription
    console.log('Subscribe:', { name, email });
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="bg-[var(--color-card)] rounded-3xl p-8 lg:p-12 border border-[var(--color-border)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-4">
              <span className="text-[var(--color-text)]">Stay </span>
              <span className="font-serif italic text-[var(--color-primary)]">ahead</span>
              <span className="text-[var(--color-text)]"> of the curve.</span>
            </h2>
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              Get fresh articles on mobile development and AI engineering delivered to your inbox. No spam, ever.
            </p>
          </div>
          
          {/* Right Content - Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-full border border-[var(--color-border)] bg-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-full border border-[var(--color-border)] bg-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
              <button
                type="submit"
                className="w-full bg-[var(--color-primary)] text-white py-3 rounded-full font-medium hover:bg-[#a84a3a] transition-colors"
              >
                Subscribe — it's free
              </button>
            </form>
            <p className="text-center text-sm text-[var(--color-text-muted)] mt-4">
              Join readers who are building the future of mobile AI.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
