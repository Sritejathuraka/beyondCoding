import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, signOut, canWrite } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-[var(--color-border)]">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold group flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white text-lg font-bold transform group-hover:scale-110 transition-transform duration-300">
            ∞
          </div>
          <span><span className="text-[var(--color-text)]">beyond</span><span className="gradient-text">Coding</span></span>
        </Link>
        
        <div className="flex items-center gap-1">
          {/* Public Navigation - always visible */}
          <NavLink to="/courses">Courses</NavLink>
          <NavLink to="/blogs">Blogs</NavLink>
          <NavLink to="/about">About</NavLink>
          
          {canWrite && (
            /* Admin/Author Navigation */
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/course/new">Create Course</NavLink>
              <Link 
                to="/write" 
                className="flex items-center gap-1.5 px-4 py-2 rounded-full btn-primary text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Write
              </Link>
            </>
          )}
          
          {user ? (
            <button 
              onClick={() => signOut()}
              className="ml-2 px-4 py-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all duration-300 text-sm rounded-full hover:bg-white/5"
            >
              Sign Out
            </button>
          ) : (
            <>
              <NavLink to="/login">Sign In</NavLink>
              <button className="ml-2 btn-primary text-sm px-5 py-2">
                Subscribe
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

// Reusable NavLink component with hover effect
const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link 
    to={to} 
    className="relative px-4 py-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all duration-300 text-sm font-medium group"
  >
    {children}
    <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] group-hover:w-1/2 transition-all duration-300" />
    <span className="absolute bottom-0 right-1/2 w-0 h-0.5 bg-gradient-to-l from-[var(--color-primary)] to-[var(--color-secondary)] group-hover:w-1/2 transition-all duration-300" />
  </Link>
);

export default Navbar;
