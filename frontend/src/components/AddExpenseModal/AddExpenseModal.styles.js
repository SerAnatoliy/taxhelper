import styled from 'styled-components';
import { theme } from '../../theme';

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
  z-index: ${theme.zIndex.overlay};
  padding: 1rem;
`;

export const ModalContent = styled.div`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.xl};
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
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
  margin: 0 0 1.5rem;
  text-align: center;
`;

export const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

export const Label = styled.label`
  display: block;
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.mainFont};
  margin-bottom: 0.5rem;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.mainFont};
  background: ${theme.colors.lightGrey};
  border: 2px solid ${({ $hasError }) => ($hasError ? theme.colors.error : 'transparent')};
  border-radius: ${theme.borderRadius.lg};
  box-sizing: border-box;
  transition: ${theme.transitions.button};;

  &::placeholder {
    color: ${theme.colors.mainFont};
    opacity: ${theme.opacity.muted};
  }

  &:focus {
    outline: none;
    border-color: ${({ $hasError }) => ($hasError ? theme.colors.error : theme.colors.logoBlue)};
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.mainFont};
  background: ${theme.colors.lightGrey};
  border: 2px solid ${({ $hasError }) => ($hasError ? theme.colors.error : 'transparent')};
  border-radius: ${theme.borderRadius.lg};
  box-sizing: border-box;
  cursor: pointer;
  transition: ${theme.transitions.button};;

  &:focus {
    outline: none;
    border-color: ${({ $hasError }) => ($hasError ? theme.colors.error : theme.colors.logoBlue)};
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 0.75rem 1rem;
  font-size: ${theme.typography.fontSize.md};
  font-family: inherit;
  color: ${theme.colors.mainFont};
  background: ${theme.colors.lightGrey};
  border: 2px solid transparent;
  border-radius: ${theme.borderRadius.lg};
  box-sizing: border-box;
  resize: vertical;
  transition: ${theme.transitions.button};;

  &::placeholder {
    color: ${theme.colors.mainFont};
    opacity: ${theme.opacity.muted};
  }

  &:focus {
    outline: none;
    border-color: ${theme.colors.logoBlue};
  }
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export const ErrorText = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.error};
  margin-top: 4px;
  display: block;
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  justify-content: flex-end;
`;

export const CancelButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: 2px solid ${theme.colors.mainFont};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.mainFont};
  cursor: pointer;
  transition: background ${theme.transitions.default};

  &:hover {
    background: ${theme.rgba.blackHover}; 
  }
`;

export const SubmitButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${theme.colors.mainButton};
  border: 2px solid transparent;
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.mainFont};
  cursor: pointer;
  transition: ${theme.transitions.all};

  &:hover {
    border-color: ${theme.colors.logoBlue};
  }

  &:disabled {
    opacity: ${theme.opacity.muted};
    cursor: not-allowed;
  }
`;