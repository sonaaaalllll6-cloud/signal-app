import { useToast } from '@/hooks/use-toast';

type ToastVariant = 'default' | 'success' | 'error';

export function useToastNotify() {
  const { toast } = useToast();

  return (message: string, variant: ToastVariant = 'default') => {
    // Map our variants to the shadcn toast variants
    const shadcnVariant = variant === 'error' ? 'destructive' : 'default';

    toast({
      description: message,
      variant: shadcnVariant,
      duration: 3000,
      // Add a class for green success styling
      className: variant === 'success'
        ? 'bg-green-50 border-green-200 text-green-800'
        : undefined,
    });
  };
}
