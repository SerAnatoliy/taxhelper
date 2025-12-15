import styled from "styled-components";
import { theme } from "../../theme";

const InputWrapper = styled.div`
  position: relative;
  width: ${({ width }) => width || '100%'};
`;

const StyledInput = styled.input`
  width: 100%;
  height: ${({ height }) => height || '44px'};
  padding: ${({ hasIcon }) =>
    hasIcon ? '0 44px 0 12px' : '0 12px'};

  font-size: ${({ fontSize }) => fontSize || '1rem'};
  color: ${theme.colors.textWhite};

  background: ${theme.colors.inputBg};
  border: 1px solid transparent;
  border-radius: 8px;

  transition: border 0.2s ease;

  &::placeholder {
    color: ${theme.colors.textMuted};
  }

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  pointer-events: none;
`;

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


