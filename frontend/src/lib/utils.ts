import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(minutes: number | null): string {
  if (!minutes) return '-';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getDifficultyColor(difficulty: string | null): string {
  switch (difficulty) {
    case 'easy':
      return 'text-primary-600 bg-primary-100 dark:text-primary-400 dark:bg-primary-900/30';
    case 'medium':
      return 'text-secondary-600 bg-secondary-100 dark:text-secondary-400 dark:bg-secondary-900/30';
    case 'hard':
      return 'text-accent-600 bg-accent-100 dark:text-accent-400 dark:bg-accent-900/30';
    default:
      return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
  }
}

export function getImageUrl(url: string | null): string {
  if (!url) return '/placeholder-recipe.jpg';
  if (url.startsWith('http')) return url;
  return url;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
