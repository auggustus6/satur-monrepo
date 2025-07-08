import { useState } from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@satur/ui';
import { Button } from '@satur/ui';
import type { User } from '../../types/api';

interface ApproveUserDialogProps {
  user: User;
  onConfirm: (id: number, isApproved: boolean) => void;
  isApproving?: boolean;
  variant?: 'button' | 'icon-only';
}

export function ApproveUserDialog({
  user,
  onConfirm,
  isApproving = false,
  variant = 'button'
}: ApproveUserDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isApproved = user.isApproved;
  const action = isApproved ? 'reprovar' : 'aprovar';
  const actionCapitalized = isApproved ? 'Reprovar' : 'Aprovar';

  const handleConfirm = () => {
    onConfirm(user.id, !isApproved);
    setIsOpen(false);
  };

  const triggerButton = variant === 'icon-only' ? (
    <Button
      size="sm"
      variant="outline"
      className={`${isApproved
          ? 'text-yellow-600 hover:text-yellow-700 border-yellow-300 hover:border-yellow-400'
          : 'text-green-600 hover:text-green-700 border-green-300 hover:border-green-400'
        }`}
      disabled={isApproving}
    >
      {isApproved ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
    </Button>
  ) : (
    <Button
      variant="outline"
      className={`${isApproved
          ? 'text-yellow-600 hover:text-yellow-700 border-yellow-300 hover:border-yellow-400'
          : 'text-green-600 hover:text-green-700 border-green-300 hover:border-green-400'
        }`}
      disabled={isApproving}
    >
      {isApproved ? <X className="w-4 h-4 mr-2" /> : <Check className="w-4 h-4 mr-2" />}
      {actionCapitalized}
    </Button>
  );

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {triggerButton}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Confirmar {actionCapitalized}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja <strong>{action}</strong> o usuário{' '}
            <strong>{user.name}</strong>?
            {!isApproved && (
              <span className="block mt-2 text-sm text-gray-600">
                Após a aprovação, o usuário poderá acessar as funcionalidades da plataforma.
              </span>
            )}
            {isApproved && (
              <span className="block mt-2 text-sm text-gray-600">
                Após a reprovação, o usuário terá acesso limitado à plataforma.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={`${isApproved
                ? 'bg-yellow-600 hover:bg-yellow-700'
                : 'bg-green-600 hover:bg-green-700'
              }`}
          >
            {actionCapitalized}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
