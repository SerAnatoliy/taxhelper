import React from 'react';
import { AnyIcon } from '../AnyIcon/AnyIcon';
import {
  ModalOverlay,
  ModalContent,
  IconCircle,
  ModalTitle,
  ModalMessage,
  ModalButton,
  CSVCode,
} from './ResultModal.styles';

import CheckIconSvg from '../../../assets/icons/CheckIcon.svg?react';
import ErrorIconSvg from '../../../assets/icons/Error.svg?react';

export const SuccessModal = ({
  isOpen,
  onClose,
  title = 'Success',
  message,
  csvCode,
  buttonText = 'Ok',
}) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <IconCircle $variant="success">
          <AnyIcon icon={CheckIconSvg} size="40px" />
        </IconCircle>
        <ModalTitle>{title}</ModalTitle>
        {message && <ModalMessage>{message}</ModalMessage>}
        {csvCode && <CSVCode>CSV: {csvCode}</CSVCode>}
        <ModalButton onClick={onClose}>{buttonText}</ModalButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export const ErrorModal = ({
  isOpen,
  onClose,
  title = 'Error',
  message,
  buttonText = 'Ok',
}) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <IconCircle $variant="error">
          <AnyIcon icon={ErrorIconSvg} size="40px" />
        </IconCircle>
        <ModalTitle>{title}</ModalTitle>
        {message && <ModalMessage>{message}</ModalMessage>}
        <ModalButton onClick={onClose}>{buttonText}</ModalButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export const ResultModal = ({
  isOpen,
  onClose,
  variant = 'success',
  title,
  message,
  csvCode,
  buttonText = 'Ok',
}) => {
  if (!isOpen) return null;

  const defaultTitle = variant === 'success' ? 'Success' : 'Error';
  const IconComponent = variant === 'success' ? CheckIconSvg : ErrorIconSvg;

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <IconCircle $variant={variant}>
          <AnyIcon icon={IconComponent} size="40px" />
        </IconCircle>
        <ModalTitle>{title || defaultTitle}</ModalTitle>
        {message && <ModalMessage>{message}</ModalMessage>}
        {csvCode && variant === 'success' && <CSVCode>CSV: {csvCode}</CSVCode>}
        <ModalButton onClick={onClose}>{buttonText}</ModalButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ResultModal;