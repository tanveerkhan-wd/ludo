import { Modal, Button } from "@/components/ui";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  loading?: boolean;
}

export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  description = "This action cannot be undone.",
  confirmLabel = "Confirm",
  loading = false
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-gray-400 mb-8">{description}</p>
      <div className="flex gap-4">
        <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="destructive" className="flex-1" onClick={onConfirm} disabled={loading}>
          {loading ? "Processing..." : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
