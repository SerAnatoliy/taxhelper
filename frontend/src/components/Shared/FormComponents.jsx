import { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { theme } from '../../theme';
import { AnyIcon } from './AnyIcon';
import ShowPasswordIcon from '../../assets/icons/ShowPassword.svg?react';
import HidePasswordIcon from '../../assets/icons/HidePassword.svg?react';

export const PageTitle = styled.h1`
  font-size: ${({ $size }) => $size || '32px'};
  font-weight: 700;
  color: ${theme.colors.mainFont};
  margin: 0 0 1rem 0;
  text-align: ${({ $align }) => $align || 'center'};

  @media (min-width: 768px) {
    font-size: ${({ $size }) => $size || '40px'};
  }
`;

export const PageSubtitle = styled.p`
  font-size: ${({ $size }) => $size || '16px'};
  color: ${theme.colors.mainFont};
  text-align: ${({ $align }) => $align || 'center'};
  margin: 0 0 2rem 0;
  max-width: ${({ $maxWidth }) => $maxWidth || '500px'};
  line-height: 1.5;

  @media (min-width: 768px) {
    font-size: ${({ $size }) => $size || '18px'};
  }
`;

const InputWrapper = styled.div`
  width: 100%;
  position: relative;
  box-sizing: border-box;
`;

const StyledFormInput = styled.input`
  width: 100%;
  height: ${({ $height }) => $height || '52px'};
  padding: ${({ $hasIcon }) => ($hasIcon ? '0 3rem 0 1rem' : '0 1rem')};
  font-size: ${({ $fontSize }) => $fontSize || '16px'};
  color: ${theme.colors.mainFont};
  background: ${({ $bg }) => $bg || theme.colors.white};
  border: 2px solid ${({ $hasError }) => ($hasError ? theme.colors.error : 'transparent')};
  border-radius: ${({ $borderRadius }) => $borderRadius || '12px'};
  box-sizing: border-box;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &::placeholder {
    color: ${theme.colors.mainFont};
    opacity: 0.6;
  }

  &:focus {
    outline: none;
    border-color: ${({ $hasError }) =>
      $hasError ? theme.colors.error : theme.colors.logoBlue};
    box-shadow: 0 0 0 3px ${({ $hasError }) =>
      $hasError ? 'rgba(218, 28, 28, 0.1)' : 'rgba(1, 98, 187, 0.1)'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.mainFont};
  opacity: 0.6;

  &:hover {
    opacity: 1;
  }
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: ${theme.colors.error};
  margin-top: 4px;
  display: block;
`;

export const FormInput = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  height,
  fontSize,
  borderRadius,
  bg,
  showPasswordToggle = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === 'password';
  const inputType = isPasswordType && showPassword ? 'text' : type;

  return (
    <InputWrapper>
      <StyledFormInput
        type={inputType}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        $hasError={!!error}
        $height={height}
        $fontSize={fontSize}
        $borderRadius={borderRadius}
        $bg={bg}
        $hasIcon={isPasswordType && showPasswordToggle}
        {...props}
      />
      {isPasswordType && showPasswordToggle && (
        <PasswordToggle
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          <AnyIcon 
            icon={showPassword ? HidePasswordIcon : ShowPasswordIcon} 
            size="24px" 
          />
        </PasswordToggle>
      )}
      {error && <ErrorText>{error}</ErrorText>}
    </InputWrapper>
  );
};

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`;

const StyledCheckbox = styled.input`
  width: 20px;
  height: 20px;
  margin: 0;
  cursor: pointer;
  accent-color: ${theme.colors.logoBlue};
  flex-shrink: 0;
`;

const CheckboxLabelStyled = styled.label`
  font-size: ${({ $fontSize }) => $fontSize || '14px'};
  color: ${theme.colors.mainFont};
  cursor: pointer;
  line-height: 1.4;

  @media (min-width: 768px) {
    font-size: ${({ $fontSize }) => $fontSize || '16px'};
  }
`;

export const FormCheckbox = ({
  checked,
  onChange,
  id,
  label,
  fontSize,
  error,
  ...props
}) => (
  <div>
    <CheckboxWrapper>
      <StyledCheckbox
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        {...props}
      />
      <CheckboxLabelStyled htmlFor={id} $fontSize={fontSize}>
        {label}
      </CheckboxLabelStyled>
    </CheckboxWrapper>
    {error && <ErrorText>{error}</ErrorText>}
  </div>
);

export const FormLink = styled(Link)`
  color: ${theme.colors.logoBlue};
  text-decoration: underline;
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;

  &:hover {
    text-decoration: none;
  }
`;

export const GradientPageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(
    180deg,
    ${theme.colors.mainColor} 0%,
    ${theme.colors.mainColorYellow} 100%
  );
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;
`;

export const FormContainer = styled.div`
  width: 100%;
  max-width: ${({ $maxWidth }) => $maxWidth || '600px'};
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
`;