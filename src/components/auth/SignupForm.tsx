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

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface SignupFormProps {
  onSuccess?: () => void;
  onToggleForm?: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSuccess, onToggleForm }) => {
  const { signUp, isLoading } = useAuth();
  const { register, handleSubmit, formState: { errors }, watch } = useForm<SignupFormData>();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: SignupFormData) => {
    try {
      setError(null);
      
      if (data.password !== data.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      const { error } = await signUp(data.email, data.password);
      
      if (error) {
        setError(error.message);
        return;
      }
      
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Signup error:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <motion.div {...fadeInUp}>
      <Card className="p-6 bg-card max-w-md mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-friendly-blue to-friendly-purple bg-clip-text text-transparent">Create Your Account</h2>
            <p className="text-muted-foreground text-sm mt-2">Sign up to track all your deals in one place</p>
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
              {...register('password', { 
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' }
              })}
              placeholder="Create a password"
              aria-describedby="password-error"
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <motion.p {...scaleIn} id="password-error" className="text-red-500 text-sm" role="alert">
                {errors.password.message}
              </motion.p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword', { 
                required: 'Please confirm your password',
                validate: value => value === watch('password') || 'Passwords do not match'
              })}
              placeholder="Confirm your password"
              aria-describedby="confirm-password-error"
              aria-invalid={!!errors.confirmPassword}
            />
            {errors.confirmPassword && (
              <motion.p {...scaleIn} id="confirm-password-error" className="text-red-500 text-sm" role="alert">
                {errors.confirmPassword.message}
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
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
          
          <div className="text-center mt-4 text-sm text-muted-foreground">
            <span>Already have an account? </span>
            <button 
              type="button" 
              onClick={onToggleForm} 
              className="text-friendly-blue hover:underline focus:outline-none"
            >
              Sign in here
            </button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};

export default SignupForm;