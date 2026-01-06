import styled from 'styled-components';
import { theme } from '../../../theme';

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
  background: ${theme.colors.secondaryButton};
  border-radius: ${theme.borderRadius['3xl']};
  padding: 2.5rem 3rem;
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: ${theme.shadows.xl};
`;

export const IconCircle = styled.div`
  width: 80px;
  height: 80px;
 border-radius: ${theme.borderRadius.full};
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
    font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.mainFont};
  margin: 0 0 1.5rem;
`;

export const ModalMessage = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.mainFont};
  opacity: ${theme.opacity.hover};
  margin: 0 0 1.5rem;
  line-height: ${theme.typography.lineHeight.relaxed};
`;

export const ModalButton = styled.button`
  width: 100%;
  padding: 0.875rem 2rem;
  background: ${theme.colors.mainButton};
  color: ${theme.colors.mainFont};
  border: 3px solid transparent;
  order-radius: ${theme.borderRadius.xl};
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: ${theme.transitions.button};

  &:hover {
    border-color: ${theme.colors.logoBlue};
  }
`;

export const CSVCode = styled.div`
  background: ${theme.colors.white};
  padding: 0.75rem 1rem;
  border-radius: ${theme.borderRadius.md};
  font-family: monospace;
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.mainFont};
  margin-bottom: 1.5rem;
  width: 100%;
`;