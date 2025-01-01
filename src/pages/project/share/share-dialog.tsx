import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { ShareForm } from './share-form';
import { ShareList } from './share-list';
import { Database } from '@/types/supabase';

type Project = Database['public']['Tables']['projects']['Row'];

export const shareFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['viewer', 'editor']),
});

export type ShareFormData = z.infer<typeof shareFormSchema>;

interface ShareDialogProps {
  project: Project;
}

export function ShareDialog({ project }: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<ShareFormData>({
    resolver: zodResolver(shareFormSchema),
    defaultValues: {
      email: '',
      role: 'viewer',
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Share2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Project</DialogTitle>
          <DialogDescription>
            Share this project with other users.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <ShareForm form={form} projectId={project.id} />
          <ShareList projectId={project.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
}