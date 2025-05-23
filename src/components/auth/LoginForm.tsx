import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { fadeInUp, scaleIn } from '@/lib/animation-utils';
import { cn } from '@/lib/utils';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSuccess?: () => void;
  onToggleForm?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onToggleForm }) => {
  const { signIn, isLoading } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      const { error } = await signIn(data.email, data.password);
      
      if (error) {
        setError(error.message);
        return;
      }
      
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <motion.div {...fadeInUp}>
      <Card className="p-6 bg-card max-w-md mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-friendly-blue to-friendly-purple bg-clip-text text-transparent">Welcome Back</h2>
            <p className="text-muted-foreground text-sm mt-2">Sign in to access your deals dashboard</p>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              {error}
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email', { required: 'Email is required' })}
              placeholder="Enter your email"
              aria-describedby="email-error"
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <motion.p {...scaleIn} id="email-error" className="text-red-500 text-sm" role="alert">
                {errors.email.message}
              </motion.p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register('password', { required: 'Password is required' })}
              placeholder="Enter your password"
              aria-describedby="password-error"
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <motion.p {...scaleIn} id="password-error" className="text-red-500 text-sm" role="alert">
                {errors.password.message}
              </motion.p>
            )}
          </div>

          <Button
            type="submit"
            className={cn(
              "w-full bg-gradient-friendly transition-all duration-200",
              isLoading && "opacity-70 cursor-not-allowed"
            )}
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
          
          <div className="text-center mt-4 text-sm text-muted-foreground">
            <span>Don't have an account? </span>
            <button 
              type="button" 
              onClick={onToggleForm} 
              className="text-friendly-blue hover:underline focus:outline-none"
            >
              Sign up here
            </button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};

export default LoginForm;