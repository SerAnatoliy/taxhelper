import { InputWrapper, StyledInput, IconWrapper } from './TextInput.styles';

export const TextInput = ({
  value,
  onChange,
  placeholder,
  icon: Icon,
  width,
  height,
  fontSize,
  ...props
}) => (
  <InputWrapper width={width}>
    <StyledInput
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      hasIcon={!!Icon}
      height={height}
      fontSize={fontSize}
      {...props}
    />
    {Icon && (
      <IconWrapper>
        <Icon width={20} height={20} />
      </IconWrapper>
    )}
  </InputWrapper>
);


