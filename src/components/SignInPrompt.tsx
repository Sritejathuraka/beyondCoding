import { Link } from 'react-router-dom';

interface SignInPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueWithoutSaving: () => void;
  title?: string;
  message?: string;
}

const SignInPrompt = ({ 
  isOpen, 
  onClose, 
  onContinueWithoutSaving,
  title = "Save Your Progress",
  message = "Sign in to save your progress across devices and pick up where you left off."
}: SignInPromptProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative card-gradient-border max-w-md mx-4 animate-fade-in-up overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[var(--color-secondary)]/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        
        <div className="relative p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full glass text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border)] transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-xl font-bold mb-2 text-[var(--color-text)]">{title}</h2>
            <p className="text-[var(--color-text-muted)] mb-6">{message}</p>
            
            <div className="space-y-3">
              <Link
                to="/login"
                className="block w-full btn-primary py-3.5 rounded-xl font-medium"
              >
                Sign In
              </Link>
              
              <Link
                to="/login"
                className="block w-full btn-outline py-3.5 rounded-xl font-medium"
              >
                Create Account
              </Link>
              
              <button
                onClick={() => {
                  onContinueWithoutSaving();
                  onClose();
                }}
                className="block w-full text-[var(--color-text-muted)] py-2 text-sm hover:text-[var(--color-primary)] transition-colors"
              >
                Continue without saving
              </button>
            </div>
            
            <p className="text-xs text-[var(--color-text-muted)] mt-4">
              Your progress will only be saved on this device
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPrompt;
