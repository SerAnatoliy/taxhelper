import styled from 'styled-components';
import { theme } from '../../../theme';
import { SubmitButton } from '../ActionButton/ActionButton';

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 1rem;
`;

export const ModalContent = styled.div`
  background: ${theme.colors.white};
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  position: relative;
  text-align: center;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;

export const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: ${theme.colors.mainFont};
  margin: 0 0 1rem;
`;

export const ModalMessage = styled.p`
  font-size: 16px;
  color: ${theme.colors.mainFont};
  opacity: 0.8;
  margin: 0 0 1.5rem;
  line-height: 1.5;

  strong {
    color: ${theme.colors.mainFont};
    opacity: 1;
  }
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

export const CancelButton = styled(SubmitButton)`
  flex: 1;
  max-width: 140px;
  background: rgba(255, 255, 255, 0.5);
  border: 2px solid ${theme.colors.mainFont};

  &:hover:not(:disabled),
  &:focus:not(:disabled) {
    border-color: ${theme.colors.logoBlue};
    background: rgba(255, 255, 255, 0.7);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const DeleteButton = styled(SubmitButton)`
  flex: 1;
  max-width: 140px;
  background: ${theme.colors.error};
  border: 2px solid ${theme.colors.error};

  &:hover:not(:disabled),
  &:focus:not(:disabled) {
    background: #c41818;
    border-color: #c41818;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;