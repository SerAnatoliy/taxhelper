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
  font-weight: 600;

  border-radius: 16px;
  border: 3px solid transparent;
  background: ${theme.colors.mainButton};
  color: ${theme.colors.mainFont};
  text-decoration: none;
  cursor: pointer;

  transition: opacity 0.2s ease;

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
  font-weight: 600;

  border-radius: 16px;
  border: 3px solid transparent;
  background: ${theme.colors.mainButton};
  color: ${theme.colors.mainFont};
  text-decoration: none;
  cursor: pointer;

  transition: opacity 0.2s ease;

  &:hover,
  &:focus {
    border: 3px solid ${theme.colors.logoBlue};
  }
`;
