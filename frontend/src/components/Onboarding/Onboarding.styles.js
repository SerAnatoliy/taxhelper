import styled from 'styled-components';
import { theme } from '../../theme';

export const OnboardingHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  width: 100%;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: 1rem 2rem;
  }
`;

export const LogoutButton = styled.button`
  background: ${theme.colors.mainButton};
  border: 2px solid transparent;
  border-radius: 16px;
  padding: 0.5rem 1.5rem;
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.mainFont};
  cursor: pointer;
  transition: border-color 0.2s ease;

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

  @media (min-width: 768px) {
    padding: 1.5rem 2rem;
    gap: 3rem;
  }
`;

export const StepIndicator = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-size: 1.1rem;
  color: ${theme.colors.mainFont};

  @media (min-width: 768px) {
    gap: 1rem;
    font-size: 1.25rem;
  }
`;

export const StepText = styled.span`
  font-weight: 600;
  color: ${theme.colors.logoBlue};
`;

export const StepCount = styled.span`
  font-weight: 400;
`;

export const SkipAllButton = styled.button`
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  color: ${theme.colors.mainFont};
  cursor: pointer;
  padding: 0.5rem;
  text-decoration: underline;

  &:hover {
    opacity: 0.7;
  }
`;

export const SkipButton = styled.button`
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  color: ${theme.colors.mainFont};
  cursor: pointer;
  padding: 0.5rem;
  text-decoration: underline;

  &:hover {
    opacity: 0.7;
  }
`;

export const SkipLink = styled.button`
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 600;
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

  @media (min-width: 768px) {
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
  font-size: 16px;
  font-weight: 500;
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

  @media (min-width: 768px) {
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
  font-size: 16px;
  color: ${theme.colors.mainFont};
  background: ${theme.colors.white};
  border: 2px solid ${({ $hasError }) => ($hasError ? theme.colors.error : 'transparent')};
  border-radius: 16px;
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

  @media (min-width: 768px) {
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
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.mainFont};
  cursor: pointer;
  transition: border-color 0.2s ease;
  box-sizing: border-box;

  &:hover {
    border-color: ${theme.colors.logoBlue};
  }

  @media (min-width: 768px) {
    width: 180px;
  }
`;

export const PrimaryButton = styled.button`
  width: 100%;
  height: 50px;
  background: ${theme.colors.mainButton};
  border: 2px solid transparent;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.mainFont};
  cursor: pointer;
  transition: border-color 0.2s ease;
  box-sizing: border-box;

  &:hover {
    border-color: ${theme.colors.logoBlue};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (min-width: 768px) {
    width: 180px;
  }
`;

export const ErrorText = styled.span`
  font-size: 12px;
  color: ${theme.colors.error};
  margin-top: 4px;
`;