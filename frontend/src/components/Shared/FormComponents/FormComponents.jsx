import { useState } from 'react';
import { AnyIcon } from '../AnyIcon/AnyIcon';
import ShowPasswordIcon from '../../../assets/icons/ShowPassword.svg?react';
import HidePasswordIcon from '../../../assets/icons/HidePassword.svg?react';
import { InputWrapper, StyledFormInput,PasswordToggle,ErrorText, CheckboxWrapper, StyledCheckbox, CheckboxLabelStyled } from './FormComponents.styles';


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