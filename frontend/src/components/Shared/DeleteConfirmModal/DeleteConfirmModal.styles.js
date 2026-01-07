import styled from 'styled-components';
import { theme } from '../../../theme';
import { SubmitButton } from '../ActionButton/ActionButton';

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${theme.rgba.blackOverlayDark};
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: ${theme.zIndex.modal};
  padding: 1rem;
`;

export const ModalContent = styled.div`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.xl};
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
  opacity: ${theme.opacity.subtle};
  transition: ${theme.transitions.opacity};

  &:hover {
    opacity: ${theme.opacity.full};
  }
`;

export const ModalTitle = styled.h2`
    font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.mainFont};
  margin: 0 0 1rem;
`;

export const ModalMessage = styled.p`
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.mainFont};
  opacity: ${theme.opacity.hover};
  margin: 0 0 1.5rem;
  line-height: ${theme.typography.lineHeight.relaxed};

  strong {
    color: ${theme.colors.mainFont};
    opacity: ${theme.opacity.full};
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
    opacity: ${theme.opacity.muted};
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
    opacity: ${theme.opacity.muted};
    cursor: not-allowed;
  }
`;