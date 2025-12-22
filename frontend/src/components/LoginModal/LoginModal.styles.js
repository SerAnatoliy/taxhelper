import styled from 'styled-components';
import { theme } from '../../theme';

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);  // Semi-transparent overlay
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  visibility: ${({ $open }) => ($open ? 'visible' : 'hidden')};
  transition: opacity 0.3s ease;
`;

export const ModalContent = styled.div`
  background: linear-gradient(180deg, ${theme.colors.mainColor}, ${theme.colors.mainColorYellow});
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 90%;
  position: relative;
  transform: ${({ $open }) => ($open ? 'scale(1)' : 'scale(0.9)')};
  transition: transform 0.3s ease;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
  &:hover {
    color: #1e293b;
  }
`;

export const FormTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #1e293b;
`;

export const ErrorText = styled.p`
  color: ${theme.colors.error};
  font-size: 0.875rem;
  margin-bottom: 1rem;
  text-align: center;
`;

export const RegisterLinkText = styled.p`
  text-align: center;
  margin-top: 1rem;
  color:${theme.colors.mainFont};
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

export const RegisterLink =styled.a`
  text-align: center;
  margin-top: 1rem;
  color:${theme.colors.logoBlue};
`;
