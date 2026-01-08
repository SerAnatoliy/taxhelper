import styled, { keyframes } from 'styled-components';
import { theme, media } from '../../theme';

export const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;

  ${media.md} {
    padding: 2rem;
  }
`;

export const SettingsCard = styled.div`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.xl};
  padding: 1.5rem;
  box-shadow: ${theme.shadows.sm};

  ${media.md} {
    padding: 2rem;
  }
`;

export const CardHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;

  ${media.md} {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
`;

export const CardTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.mainFont};
  margin: 0;
`;

export const CardDescription = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.mainFont};
  opacity: ${theme.opacity.hover};
  margin: 0.5rem 0 0;
  line-height: ${theme.typography.lineHeight.relaxed};
`;

export const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  background: ${({ $status }) => 
    $status === 'active' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'};
  color: ${({ $status }) => 
    $status === 'active' ? '#16a34a' : '#dc2626'};
`;

export const CertificateInfo = styled.div`
  background: ${theme.colors.lightGrey};
  border-radius: ${theme.borderRadius.lg};
  padding: 1rem;
  margin-bottom: 1rem;
`;

export const InfoRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  &:last-child {
    border-bottom: none;
  }

  ${media.md} {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

export const InfoLabel = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.mainFont};
  opacity: ${theme.opacity.muted};
`;

export const InfoValue = styled.span`
  font-size: ${theme.typography.fontSize.base};
  color: ${({ $warning }) => $warning ? '#dc2626' : theme.colors.mainFont};
  font-weight: ${theme.typography.fontWeight.medium};
  word-break: break-all;
`;

export const UploadSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const UploadDropzone = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  border: 2px dashed ${theme.colors.mainFont};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: ${theme.transitions.all};

  &:hover {
    border-color: ${theme.colors.logoBlue};
    background: rgba(1, 98, 187, 0.02);
  }

  svg {
    opacity: ${theme.opacity.muted};
  }
`;

export const UploadText = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.mainFont};
  text-align: center;
  margin: 0;
`;

export const PasswordInput = styled.input`
  width: 100%;
  height: 48px;
  padding: 0 1rem;
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.mainFont};
  background: ${theme.colors.lightGrey};
  border: 2px solid transparent;
  border-radius: ${theme.borderRadius.lg};
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${theme.colors.logoBlue};
  }

  &::placeholder {
    color: ${theme.colors.mainFont};
    opacity: ${theme.opacity.muted};
  }
`;

export const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: flex-end;
`;

const BaseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: ${theme.borderRadius.xl};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: ${theme.transitions.button};

  &:disabled {
    opacity: ${theme.opacity.muted};
    cursor: not-allowed;
  }
`;

export const PrimaryButton = styled(BaseButton)`
  background: ${theme.colors.mainButton};
  color: ${theme.colors.mainFont};
  border: 3px solid transparent;

  &:hover:not(:disabled) {
    border-color: ${theme.colors.logoBlue};
  }
`;

export const SecondaryButton = styled(BaseButton)`
  background: transparent;
  color: ${theme.colors.mainFont};
  border: 2px solid ${theme.colors.mainFont};

  &:hover:not(:disabled) {
    background: ${theme.rgba.blackHover};
  }
`;

export const DangerButton = styled(BaseButton)`
  background: transparent;
  color: #dc2626;
  border: 2px solid #dc2626;

  &:hover:not(:disabled) {
    background: rgba(220, 38, 38, 0.1);
  }
`;

export const TestResultCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  margin-top: 1rem;
  border-radius: ${theme.borderRadius.lg};
  background: ${({ $success }) => 
    $success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  border: 1px solid ${({ $success }) => 
    $success ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
`;

export const TestResultIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $success }) => $success ? '#16a34a' : '#dc2626'};
  color: white;
  font-size: 20px;
  flex-shrink: 0;
`;

export const TestResultText = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.mainFont};
  margin: 0;
  line-height: ${theme.typography.lineHeight.relaxed};
`;

export const ErrorMessage = styled.div`
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: ${theme.borderRadius.lg};
  color: #dc2626;
  font-size: ${theme.typography.fontSize.base};
`;

export const SuccessMessage = styled.div`
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: ${theme.borderRadius.lg};
  color: #16a34a;
  font-size: ${theme.typography.fontSize.base};
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.mainFont};
  opacity: ${theme.opacity.muted};

  &::before {
    content: '';
    width: 24px;
    height: 24px;
    margin-right: 1rem;
    border: 3px solid ${theme.colors.logoBlue};
    border-top-color: transparent;
    border-radius: 50%;
    animation: ${spin} 0.8s linear infinite;
  }
`;

export const EnvironmentToggle = styled.div`
  display: flex;
  background: ${theme.colors.lightGrey};
  border-radius: ${theme.borderRadius.lg};
  padding: 4px;
  margin-bottom: 1rem;
`;

export const ToggleOption = styled.button`
  flex: 1;
  padding: 0.625rem 1rem;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: ${theme.transitions.all};
  background: ${({ $active }) => $active ? theme.colors.white : 'transparent'};
  color: ${({ $active }) => $active ? theme.colors.logoBlue : theme.colors.mainFont};
  box-shadow: ${({ $active }) => $active ? theme.shadows.sm : 'none'};

  &:hover:not(:disabled) {
    background: ${({ $active }) => $active ? theme.colors.white : 'rgba(0,0,0,0.05)'};
  }
`;