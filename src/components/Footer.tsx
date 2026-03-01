import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-[var(--color-border)] bg-white mt-16">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold">
            <span className="text-[var(--color-text)]">Beyond</span>
            <span className="text-[var(--color-primary)]">code</span>
          </Link>
          
          {/* Links */}
          <nav className="flex items-center gap-6">
            <Link to="/dashboard" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors text-sm">
              Articles
            </Link>
            <Link to="/write" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors text-sm">
              Write
            </Link>
            <a href="#" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors text-sm">
              About
            </a>
            <a href="#" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors text-sm">
              RSS
            </a>
          </nav>
          
          {/* Copyright */}
          <span className="text-sm text-[var(--color-text-muted)]">
            © 2026 beyondCoding
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
