import styled from 'styled-components';
import { theme, media} from '../../theme';

export const MainContent = styled.main`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem 1rem;

  ${media.md} {
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

  ${media.md} {
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
`;

export const PasswordRequirements = styled.ul`
  margin: 0;
  padding: 0.75rem 1rem;
  list-style: none;
  background: rgba(255, 255, 255, 0.7);
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
`;

export const RequirementItem = styled.li`
  color: ${({ $met }) => ($met ? theme.colors.successGreen : theme.colors.mainFont)};
  padding: 2px 0;
  transition: color ${theme.transitions.default};
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
`;

export const LoginText = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.mainFont};
  text-align: left;
  margin: 0.5rem 0 0 0;

  ${media.md} {
    font-size: ${theme.typography.fontSize.md};
  }
`;

export const ErrorMessage = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.error};
  text-align: center;
  margin: 0;
`;