import styled from 'styled-components';
import { theme } from '../../theme';
import { SubmitButton } from '../Shared/ActionButton/ActionButton';

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
  z-index: 1000;
  padding: 1rem;
`;

export const ModalContent = styled.div`
  background: ${theme.colors.white};
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 450px;
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
  margin: 0 0 1.5rem;
  text-align: center;
`;

export const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

export const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.mainFont};
  margin-bottom: 0.5rem;
`;

export const Input = styled.input`
  width: 100%;
  height: 48px;
  padding: 0 1rem;
  font-size: 16px;
  color: ${theme.colors.mainFont};
  background: #f5f5f5;
  border: 2px solid transparent;
  border-radius: 12px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${theme.colors.logoBlue};
  }

  &::placeholder {
    color: ${theme.colors.mainFont};
    opacity: 0.5;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 0.75rem 1rem;
  font-size: 16px;
  font-family: inherit;
  color: ${theme.colors.mainFont};
  background: #f5f5f5;
  border: 2px solid transparent;
  border-radius: 12px;
  box-sizing: border-box;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${theme.colors.logoBlue};
  }

  &::placeholder {
    color: ${theme.colors.mainFont};
    opacity: 0.5;
  }
`;

export const Select = styled.select`
  width: 100%;
  height: 48px;
  padding: 0 1rem;
  font-size: 16px;
  color: ${theme.colors.mainFont};
  background: #f5f5f5;
  border: 2px solid transparent;
  border-radius: 12px;
  box-sizing: border-box;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${theme.colors.logoBlue};
  }
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

export const CancelButton = styled(SubmitButton)`
  flex: 1;
  background: rgba(255, 255, 255, 0.5);
  border: 2px solid ${theme.colors.mainFont};

  &:hover,
  &:focus {
    border-color: ${theme.colors.logoBlue};
    background: rgba(255, 255, 255, 0.7);
  }
`;

export const SubmitButtonStyled = styled(SubmitButton)`
  flex: 1;
`;

export const ErrorText = styled.span`
  font-size: 12px;
  color: ${theme.colors.error};
  margin-top: 4px;
  display: block;
`;