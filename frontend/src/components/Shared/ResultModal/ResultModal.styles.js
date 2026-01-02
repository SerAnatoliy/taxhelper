import styled from 'styled-components';
import { theme } from '../../../theme';

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
  background: ${theme.colors.secondaryButton};
  border-radius: 24px;
  padding: 2.5rem 3rem;
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

export const IconCircle = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  background: ${({ $variant }) =>
    $variant === 'success' ? theme.colors.successGreen : theme.colors.error};

  svg {
    width: 40px;
    height: 40px;
    color: ${theme.colors.white};
    
    path {
      fill: ${theme.colors.white};
    }
  }
`;

export const ModalTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: ${theme.colors.mainFont};
  margin: 0 0 1.5rem;
`;

export const ModalMessage = styled.p`
  font-size: 14px;
  color: ${theme.colors.mainFont};
  opacity: 0.8;
  margin: 0 0 1.5rem;
  line-height: 1.5;
`;

export const ModalButton = styled.button`
  width: 100%;
  padding: 0.875rem 2rem;
  background: ${theme.colors.mainButton};
  color: ${theme.colors.mainFont};
  border: 3px solid transparent;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${theme.colors.logoBlue};
  }
`;

export const CSVCode = styled.div`
  background: ${theme.colors.white};
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-family: monospace;
  font-size: 14px;
  color: ${theme.colors.mainFont};
  margin-bottom: 1.5rem;
  width: 100%;
`;