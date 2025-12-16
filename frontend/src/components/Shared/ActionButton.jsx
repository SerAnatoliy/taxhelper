import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { theme } from '../../theme';

const BaseButtonLink = styled(Link)`
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

const BaseButton = styled.button`
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

export const SubmitButton = ({
  to,
  children,
  width,
  height,
  padding,
  fontSize,
  ...props
}) => (
  <BaseButton
    to={to}
    width={width}
    height={height}
    padding={padding}
    fontSize={fontSize}
    {...props}
  >
    {children}
  </BaseButton>
);

export const ActionButton = ({
  to,
  children,
  width,
  height,
  padding,
  fontSize,
  ...props
}) => (
  <BaseButtonLink
    to={to}
    width={width}
    height={height}
    padding={padding}
    fontSize={fontSize}
    {...props}
  >
    {children}
  </BaseButtonLink>
);