import styled from "styled-components";
import { theme } from "../../../theme";

export const InputWrapper = styled.div`
  position: relative;
  display: flex;
`;

export const StyledInput = styled.input`
  width: 100%;
  height: ${({ height }) => height || '44px'};
  padding: ${({ hasIcon }) =>
    hasIcon ? '0 44px 0 12px' : '0 12px'};

  font-size: ${({ fontSize }) => fontSize || '1rem'};
  color: ${theme.colors.textWhite};

  background: ${theme.colors.inputBg};
  border: 1px solid ;
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

export const IconWrapper = styled.div`
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  pointer-events: none;
`;
