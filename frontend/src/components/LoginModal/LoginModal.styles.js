import styled from 'styled-components';
import { theme } from '../../theme';

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${theme.rgba.blackOverlayDark};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${theme.zIndex.toast};
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  visibility: ${({ $open }) => ($open ? 'visible' : 'hidden')};
  transition: opacity ${theme.transitions.slow}, visibility ${theme.transitions.slow};
`;

export const ModalContent = styled.div`
  background:${theme.gradients.card};
  padding: 2rem;
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.lg};
  max-width: 400px;
  width: 90%;
  position: relative;
  transform: ${({ $open }) => ($open ? 'scale(1)' : 'scale(0.9)')};
  transition: transform ${theme.transitions.slow};
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: ${theme.typography.fontSize['2xl']};
  cursor: pointer;
  color: #64748b;
  &:hover {
    color: #1e293b;
  }
`;

export const FormTitle = styled.h2`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: bold;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #1e293b;
`;

export const ErrorText = styled.p`
  color: ${theme.colors.error};
  font-size: ${theme.typography.fontSize.base};
  margin-bottom: 1rem;
  text-align: center;
`;

export const RegisterLinkText = styled.p`
  text-align: center;
  margin-top: 1rem;
  color: ${theme.colors.mainFont};
  a {
    color: ${theme.colors.primaryBlue};
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

export const FieldsForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`;

export const RegisterLink = styled.a`
  text-align: center;
  margin-top: 1rem;
  color: ${theme.colors.logoBlue};
`;

export const SessionExpiredMessage = styled.div`
  background: ${theme.rgba.errorBg};
  border: 1px solid ${theme.colors.error};
  color: ${theme.colors.error};
  padding: 0.75rem 1rem;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  text-align: center;
  margin-bottom: 1rem;
`;