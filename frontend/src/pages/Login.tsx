import { useForm } from 'react-hook-form';
import { ChefHat } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input } from '@/components/ui';

interface LoginForm {
  email: string;
}

export default function Login() {
  const { login, isLoggingIn } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = (data: LoginForm) => {
    login(data);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <ChefHat className="h-12 w-12 mx-auto text-primary-500 mb-4" />
          <h1 className="text-2xl font-bold">Welcome</h1>
          <p className="text-gray-600 dark:text-gray-400">Enter your email to continue</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            error={errors.email?.message}
          />

          <Button type="submit" className="w-full" isLoading={isLoggingIn}>
            Continue
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
          New users will be automatically registered
        </p>
      </div>
    </div>
  );
}
