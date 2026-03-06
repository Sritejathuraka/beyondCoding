import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, profile, signOut, canWrite } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  // Get display name from profile or email
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-[var(--color-border)]">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold group flex items-center gap-2" onClick={closeMenu}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white text-lg font-bold transform group-hover:scale-110 transition-transform duration-300">
            ∞
          </div>
          <span><span className="text-[var(--color-text)]">beyond</span><span className="gradient-text">Coding</span></span>
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/courses">Courses</NavLink>
          <NavLink to="/blogs">Blogs</NavLink>
          <NavLink to="/about">About</NavLink>
          
          {canWrite && (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
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
            <div className="flex items-center gap-2 ml-2">
              <Link 
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/50 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white text-xs font-medium">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-[var(--color-text)]">{displayName}</span>
              </Link>
              <button 
                onClick={() => signOut()}
                className="px-3 py-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all duration-300 text-sm rounded-full hover:bg-[var(--color-surface)]"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <NavLink to="/login">Sign In</NavLink>
              <Link to="/contact" className="ml-2 btn-primary text-sm px-5 py-2">
                Contact
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden glass border-t border-[var(--color-border)] animate-fade-in">
          <div className="px-4 py-4 space-y-2">
            <MobileNavLink to="/courses" onClick={closeMenu}>Courses</MobileNavLink>
            <MobileNavLink to="/blogs" onClick={closeMenu}>Blogs</MobileNavLink>
            <MobileNavLink to="/about" onClick={closeMenu}>About</MobileNavLink>
            
            {canWrite && (
              <>
                <MobileNavLink to="/dashboard" onClick={closeMenu}>Dashboard</MobileNavLink>
                <MobileNavLink to="/write" onClick={closeMenu}>Write Article</MobileNavLink>
                <MobileNavLink to="/course/new" onClick={closeMenu}>Create Course</MobileNavLink>
              </>
            )}
            
            <div className="pt-2 border-t border-[var(--color-border)]">
              {user ? (
                <>
                  <Link 
                    to="/profile" 
                    onClick={closeMenu}
                    className="flex items-center gap-3 px-4 py-3 mb-2 hover:bg-[var(--color-surface)] rounded-lg transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-medium">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-text)]">{displayName}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{user.email}</p>
                    </div>
                  </Link>
                  <button 
                    onClick={() => { signOut(); closeMenu(); }}
                    className="w-full text-left px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <MobileNavLink to="/login" onClick={closeMenu}>Sign In</MobileNavLink>
                  <Link 
                    to="/contact" 
                    onClick={closeMenu}
                    className="block mt-2 btn-primary text-center py-3 rounded-lg"
                  >
                    Contact Us
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
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

// Mobile NavLink component
const MobileNavLink = ({ to, children, onClick }: { to: string; children: React.ReactNode; onClick: () => void }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className="block px-4 py-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] rounded-lg transition-colors font-medium"
  >
    {children}
  </Link>
);

export default Navbar;
