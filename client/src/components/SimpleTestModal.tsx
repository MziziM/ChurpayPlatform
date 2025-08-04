import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SimpleTestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SimpleTestModal({ open, onOpenChange }: SimpleTestModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Test Modal Working!</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <p className="mb-4">This is a simple test modal to verify the modal system is working correctly.</p>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}