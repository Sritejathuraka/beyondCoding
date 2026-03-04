import { useState } from 'react';
import { Navbar, Footer } from '../components';
import { submitContactForm } from '../services/contactService';
import { useToast } from '../contexts/ToastContext';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.warning('Please fill in all required fields');
      setErrorMessage('Please fill in all required fields');
      setStatus('error');
      return;
    }

    setStatus('loading');
    
    try {
      await submitContactForm(formData);
      toast.success('Message sent successfully!');
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
      setErrorMessage('Failed to send message. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 blur-3xl pointer-events-none" />
          <span className="text-[var(--color-secondary)] text-sm font-medium uppercase tracking-wider mb-4 block relative">Contact</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 relative">
            <span className="text-[var(--color-text)]">Get in </span>
            <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto relative">
            Have a question, feedback, or collaboration idea? I'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="glass rounded-2xl p-6 mb-6">
              <h3 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
                <span className="text-xl">📧</span>
                Email
              </h3>
              <a 
                href="mailto:sriteja.245@gmail.com" 
                className="text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors"
              >
                sriteja.245@gmail.com
              </a>
            </div>

            <div className="glass rounded-2xl p-6 mb-6">
              <h3 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
                <span className="text-xl">💼</span>
                LinkedIn
              </h3>
              <a 
                href="https://www.linkedin.com/in/sriteja1607/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors"
              >
                /in/sriteja1607
              </a>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
                <span className="text-xl">⏱️</span>
                Response Time
              </h3>
              <p className="text-[var(--color-text-muted)] text-sm">
                Usually within 24-48 hours
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            {status === 'success' ? (
              <div className="glass rounded-2xl p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">Message Sent!</h3>
                <p className="text-[var(--color-text-muted)] mb-6">
                  Thanks for reaching out. I'll get back to you soon.
                </p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="btn-primary px-6 py-2"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glass rounded-2xl p-8">
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                    placeholder="What's this about?"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none transition-colors resize-none"
                    placeholder="Your message..."
                  />
                </div>

                {status === 'error' && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
