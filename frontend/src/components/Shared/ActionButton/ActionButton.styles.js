import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { theme } from '../../../theme';

export const BaseButtonLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: ${({ width }) => width || 'auto'};
  height: ${({ height }) => height || 'auto'};
  padding: ${({ padding }) => padding || '0.5rem 1.25rem'};

  font-size: ${({ fontSize }) => fontSize || '1rem'};
  font-weight: ${theme.typography.fontWeight.semibold};

  border-radius: ${theme.borderRadius.xl};
  border: 3px solid transparent;
  background: ${theme.colors.mainButton};
  color: ${theme.colors.mainFont};
  text-decoration: none;
  cursor: pointer;

  transition: ${theme.transitions.opacity};

  &:hover,
  &:focus {
    border: 3px solid ${theme.colors.logoBlue};
  }
`;

export const BaseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: ${({ width }) => width || 'auto'};
  height: ${({ height }) => height || 'auto'};
  padding: ${({ padding }) => padding || '0.5rem 1.25rem'};

  font-size: ${({ fontSize }) => fontSize || '1rem'};
  font-weight: ${theme.typography.fontWeight.semibold};

  border-radius: ${theme.borderRadius.xl};
  border: 3px solid transparent;
  background: ${theme.colors.mainButton};
  color: ${theme.colors.mainFont};
  text-decoration: none;
  cursor: pointer;

  transition: ${theme.transitions.opacity};

  &:hover,
  &:focus {
    border: 3px solid ${theme.colors.logoBlue};
  }
`;
