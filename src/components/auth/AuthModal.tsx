import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  triggerElement?: React.ReactNode;
  defaultMode?: 'login' | 'signup';
  onAuthSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  triggerElement, 
  defaultMode = 'login',
  onAuthSuccess 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const { isAuthenticated } = useAuth();

  const handleSuccess = () => {
    if (onAuthSuccess) onAuthSuccess();
    setIsOpen(false);
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  // If user is already authenticated, don't show the auth modal
  if (isAuthenticated) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerElement || (
          <Button 
            variant="outline" 
            className="hover:text-friendly-blue hover:border-friendly-blue transition-colors"
            data-auth-trigger
          >
            Sign In
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-transparent border-none shadow-none">
        {mode === 'login' ? (
          <LoginForm onSuccess={handleSuccess} onToggleForm={toggleMode} />
        ) : (
          <SignupForm onSuccess={handleSuccess} onToggleForm={toggleMode} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;