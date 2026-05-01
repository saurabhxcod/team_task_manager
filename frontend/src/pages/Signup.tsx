import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '../lib/axios';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, 'Must contain 1 uppercase, 1 number, 1 special character'),
});

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(signupSchema)
  });

  const onSubmit = async (data: any) => {
    try {
      setError('');
      const response = await api.post('/auth/signup', data);
      login(response.data.data.accessToken, response.data.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Signup failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Create an account</h2>
          <p className="mt-2 text-sm text-gray-600">Join your team today</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">{error}</div>}
          
          <div className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              {...register('name')}
              error={errors.name?.message as string}
            />
            <Input
              label="Email address"
              type="email"
              {...register('email')}
              error={errors.email?.message as string}
            />
            <Input
              label="Password"
              type="password"
              {...register('password')}
              error={errors.password?.message as string}
            />
          </div>

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Sign up
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
