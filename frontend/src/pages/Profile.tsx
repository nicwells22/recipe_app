import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input, Modal } from '@/components/ui';
import api, { handleApiError } from '@/lib/api';
import toast from 'react-hot-toast';

interface ProfileForm {
  username: string;
  email: string;
}

export default function Profile() {
  const { user, logout } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>({
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
    },
  });

  const onProfileSubmit = async (data: ProfileForm) => {
    setIsUpdating(true);
    try {
      await api.put('/users/profile', data);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await api.delete('/users/profile');
      toast.success('Account deleted');
      logout();
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

      <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="h-5 w-5" />
          Account Information
        </h2>
        <div className="space-y-4">
          <Input
            id="username"
            label="Username"
            {...registerProfile('username', {
              required: 'Username is required',
              minLength: { value: 3, message: 'Username must be at least 3 characters' },
            })}
            error={profileErrors.username?.message}
          />
          <Input
            id="email"
            type="email"
            label="Email"
            {...registerProfile('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            error={profileErrors.email?.message}
          />
          <div className="flex justify-end">
            <Button type="submit" isLoading={isUpdating}>
              Save Changes
            </Button>
          </div>
        </div>
      </form>

      <div className="card p-6 border-red-200 dark:border-red-900">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-600">
          <Trash2 className="h-5 w-5" />
          Danger Zone
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Once you delete your account, there is no going back. All your recipes will be permanently deleted.
        </p>
        <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
          Delete Account
        </Button>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
      >
        <p className="mb-6">
          Are you sure you want to delete your account? This action cannot be undone and all your recipes will be permanently lost.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteAccount} isLoading={isDeleting}>
            Delete Account
          </Button>
        </div>
      </Modal>
    </div>
  );
}
