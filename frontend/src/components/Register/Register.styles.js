import styled from 'styled-components';
import { theme } from '../../theme';

export const MainContent = styled.main`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem 1rem;

  @media (min-width: 768px) {
    padding: 3rem 2rem;
  }
`;

export const FormFieldsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const NameFieldsRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (min-width: 768px) {
    flex-direction: row;
    gap: 1.5rem;

    > div {
      flex: 1;
    }
  }
`;

export const PasswordFieldsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (min-width: 768px) {
    max-width: 320px;
  }
`;

export const PasswordRequirements = styled.ul`
  margin: 0;
  padding: 0.75rem 1rem;
  list-style: none;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  font-size: 13px;
`;

export const RequirementItem = styled.li`
  color: ${({ $met }) => ($met ? theme.colors.successGreen : theme.colors.mainFont)};
  padding: 2px 0;
  transition: color 0.2s ease;
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
`;

export const LoginText = styled.p`
  font-size: 14px;
  color: ${theme.colors.mainFont};
  text-align: left;
  margin: 0.5rem 0 0 0;

  @media (min-width: 768px) {
    font-size: 16px;
  }
`;