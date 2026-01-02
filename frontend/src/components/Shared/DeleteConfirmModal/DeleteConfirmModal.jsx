import { AnyIcon } from '../AnyIcon/AnyIcon';
import CloseIcon from '../../../assets/icons/CloseIcon.svg?react';
import {
  ModalOverlay,
  ModalContent,
  CloseButton,
  ModalTitle,
  ModalMessage,
  ButtonRow,
  CancelButton,
  DeleteButton,
} from './DeleteConfirmModal.styles';

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Item',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  itemName = '',
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <AnyIcon icon={CloseIcon} size="28px" />
        </CloseButton>

        <ModalTitle>{title}</ModalTitle>
        
        <ModalMessage>
          {message}
          {itemName && <strong> "{itemName}"</strong>}
        </ModalMessage>

        <ButtonRow>
          <CancelButton type="button" onClick={onClose} disabled={isDeleting}>
            Cancel
          </CancelButton>
          <DeleteButton type="button" onClick={handleConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </DeleteButton>
        </ButtonRow>
      </ModalContent>
    </ModalOverlay>
  );
};

export default DeleteConfirmModal;