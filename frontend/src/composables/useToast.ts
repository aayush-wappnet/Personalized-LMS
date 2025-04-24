import { useToast as useVueToast } from 'vue-toast-notification';

export const useToast = () => {
  const toast = useVueToast();

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    toast.open({
      message,
      type,
      position: 'top-right',
      duration: 3000,
    });
  };

  return { showToast };
};