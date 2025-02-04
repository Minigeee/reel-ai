import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X } from 'lucide-react';

interface UploadProgressProps {
  progress: number;
  fileName: string;
  onCancel: () => void;
}

export function UploadProgress({
  progress,
  fileName,
  onCancel,
}: UploadProgressProps) {
  return (
    <div className='w-full space-y-2'>
      <div className='flex items-center justify-between'>
        <span className='truncate text-sm text-muted-foreground'>
          {fileName}
        </span>
        <Button variant='ghost' size='icon' onClick={onCancel}>
          <X className='h-4 w-4' />
        </Button>
      </div>
      <Progress value={progress} />
    </div>
  );
}
