import { theme } from '../../../theme';
import styled from 'styled-components';


export const ConnectSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
`;

export const PlaidButton = styled.button`
  width: 100%;
  max-width: 280px;
  padding: 1rem 2rem;
  background: ${theme.colors.mainButton};
  border: 2px solid transparent;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.mainFont};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${theme.colors.logoBlue};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const OrDivider = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 400px;
  margin: 1.5rem 0;
  color: ${theme.colors.mainFont};
  font-size: 14px;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${theme.colors.mainFont};
    opacity: 0.3;
  }

  span {
    padding: 0 1rem;
  }
`;

export const UploadArea = styled.div`
  width: 100%;
  max-width: 280px;
  aspect-ratio: 1;
  border: 3px dashed ${({ $hasFile }) => ($hasFile ? theme.colors.successGreen : theme.colors.mainFont)};
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
  background: ${({ $hasFile }) => ($hasFile ? 'rgba(2, 194, 104, 0.1)' : 'transparent')};

  &:hover {
    border-color: ${theme.colors.logoBlue};
    background: rgba(255, 255, 255, 0.3);
  }

  svg {
    width: 60px;
    height: 60px;
    color: ${theme.colors.mainFont};
    opacity: 0.7;
  }
`;

export const UploadText = styled.p`
  font-size: 14px;
  color: ${theme.colors.mainFont};
  margin: 0.5rem 0 0;
  text-align: center;
  padding: 0 1rem;
`;

export const SuccessMessage = styled.div`
  background: rgba(2, 194, 104, 0.1);
  border: 1px solid ${theme.colors.successGreen};
  border-radius: 12px;
  padding: 1rem;
  width: 100%;
  max-width: 400px;
  text-align: center;

  h4 {
    color: ${theme.colors.successGreen};
    margin: 0 0 0.5rem;
  }

  p {
    color: ${theme.colors.mainFont};
    margin: 0;
    font-size: 14px;
  }
`;

export const StatusText = styled.p`
  font-size: 14px;
  color: ${theme.colors.mainFont};
  text-align: center;
  margin: 0.5rem 0;
`;