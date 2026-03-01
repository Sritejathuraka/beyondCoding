import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className="border-b border-[var(--color-border)] bg-white">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold">
          <span className="text-[var(--color-text)]">beyond</span>
          <span className="text-[var(--color-primary)]">Coding</span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
            Dashboard
          </Link>
          <Link to="/course/new" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
            Create Course
          </Link>
          <Link to="/write" className="flex items-center gap-1.5 text-[var(--color-primary)] hover:text-[#a84a3a] transition-colors font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Write
          </Link>
          <button className="bg-[var(--color-text)] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
            Subscribe
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
