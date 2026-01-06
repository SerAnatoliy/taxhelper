import styled from 'styled-components';
import { theme, media } from '../../theme';

export const OnboardingHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  width: 100%;
  box-sizing: border-box;

  ${media.md} {
    padding: 1rem 2rem;
  }
`;

export const LogoutButton = styled.button`
  background: ${theme.colors.mainButton};
  border: 2px solid transparent;
  order-radius: ${theme.borderRadius.xl};
  padding: 0.5rem 1.5rem;
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.mainFont};
  cursor: pointer;
  transition: ${theme.transitions.button};;

  &:hover {
    border-color: ${theme.colors.logoBlue};
  }
`;

export const ProgressSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 1rem;
  width: 100%;
  box-sizing: border-box;

  ${media.md} {
    padding: 1.5rem 2rem;
    gap: 3rem;
  }
`;

export const StepIndicator = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.mainFont};

  ${media.md} {
    gap: 1rem;
    font-size: ${theme.typography.fontSize.xl};
  }
`;

export const StepText = styled.span`
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.logoBlue};
`;

export const StepCount = styled.span`
  font-weight: ${theme.typography.fontWeight.normal};
`;

export const SkipAllButton = styled.button`
  background: none;
  border: none;
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.mainFont};
  cursor: pointer;
  padding: 0.5rem;
  text-decoration: underline;

  &:hover {
    opacity: ${theme.opacity.subtle};
  }
`;

export const SkipButton = styled.button`
  background: none;
  border: none;
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.mainFont};
  cursor: pointer;
  padding: 0.5rem;
  text-decoration: underline;

  &:hover {
    opacity: ${theme.opacity.subtle};
  }
`;

export const SkipLink = styled.button`
  background: none;
  border: none;
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.mainFont};
  cursor: pointer;
  padding: 0.5rem;

  &:hover {
    text-decoration: underline;
  }
`;

export const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  box-sizing: border-box;
  overflow-x: hidden;

  ${media.md} {
    padding: 2rem;
  }
`;

export const FormSection = styled.div`
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-sizing: border-box;
`;

export const FieldLabel = styled.label`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.mainFont};
  margin-bottom: 0.25rem;
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const FieldRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;

  ${media.md} {
    flex-direction: row;
    gap: 1.5rem;

    > div {
      flex: 1;
      min-width: 0;
    }
  }
`;

export const StyledSelect = styled.select`
  width: 100%;
  height: 52px;
  padding: 0 2.5rem 0 1rem;
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.mainFont};
  background: ${theme.colors.white};
  border: 2px solid ${({ $hasError }) => ($hasError ? theme.colors.error : 'transparent')};
  order-radius: ${theme.borderRadius.xl};
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${theme.colors.logoBlue};
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  margin-top: 1.5rem;

  ${media.md} {
    flex-direction: row;
    justify-content: center;
    gap: 1.5rem;
  }
`;

export const SecondaryButton = styled.button`
  width: 100%;
  height: 50px;
  background: rgba(255, 255, 255, 0.5);
  border: 2px solid transparent;
  order-radius: ${theme.borderRadius.xl};
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.mainFont};
  cursor: pointer;
  transition: ${theme.transitions.button};;
  box-sizing: border-box;

  &:hover {
    border-color: ${theme.colors.logoBlue};
  }

  ${media.md} {
    width: 180px;
  }
`;

export const PrimaryButton = styled.button`
  width: 100%;
  height: 50px;
  background: ${theme.colors.mainButton};
  border: 2px solid transparent;
  order-radius: ${theme.borderRadius.xl};
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.mainFont};
  cursor: pointer;
  transition: ${theme.transitions.button};;
  box-sizing: border-box;

  &:hover {
    border-color: ${theme.colors.logoBlue};
  }

  &:disabled {
    opacity: ${theme.opacity.muted};
    cursor: not-allowed;
  }

  ${media.md} {
    width: 180px;
  }
`;

export const ErrorText = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.error};
  margin-top: 4px;
`;