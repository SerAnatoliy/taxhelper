import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { theme, media } from '../../../theme';

export const PageTitle = styled.h1`
  font-size: ${({ $size }) => $size || '32px'};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.mainFont};
  margin: 0 0 1rem 0;
  text-align: ${({ $align }) => $align || 'center'};

  ${media.md} {
    font-size: ${({ $size }) => $size || '40px'};
  }
`;

export const PageSubtitle = styled.p`
  font-size: ${({ $size }) => $size || '16px'};
  color: ${theme.colors.mainFont};
  text-align: ${({ $align }) => $align || 'center'};
  margin: 0 0 2rem 0;
  max-width: ${({ $maxWidth }) => $maxWidth || '500px'};
  line-height: ${theme.typography.lineHeight.relaxed};

  ${media.md} {
    font-size: ${({ $size }) => $size || '18px'};
  }
`;

export const InputWrapper = styled.div`
  width: 100%;
  position: relative;
  box-sizing: border-box;
`;

export const StyledFormInput = styled.input`
  width: 100%;
  height: ${({ $height }) => $height || '52px'};
  padding: ${({ $hasIcon }) => ($hasIcon ? '0 3rem 0 1rem' : '0 1rem')};
  font-size: ${({ $fontSize }) => $fontSize || '16px'};
  color: ${theme.colors.mainFont};
  background: ${({ $bg }) => $bg || theme.colors.white};
  border: 2px solid ${({ $hasError }) => ($hasError ? theme.colors.error : 'transparent')};
  border-radius: ${({ $borderRadius }) => $borderRadius || '12px'};
  box-sizing: border-box;
  transition: ${theme.transitions.input};

  &::placeholder {
    color: ${theme.colors.mainFont};
    opacity: ${theme.opacity.muted};
  }

  &:focus {
    outline: none;
    border-color: ${({ $hasError }) =>
      $hasError ? theme.colors.error : theme.colors.logoBlue};
    box-shadow: ${theme.shadows.sm} ${({ $hasError }) =>
      $hasError ? theme.shadows.focus.default : theme.shadows.focus.error};
  }

  &:disabled {
    opacity: ${theme.opacity.muted};
    cursor: not-allowed;
  }
`;

export const PasswordToggle = styled.button`
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
  opacity: ${theme.opacity.muted};

  &:hover {
    opacity: ${theme.opacity.full};
  }
`;

export const ErrorText = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.error};
  margin-top: 4px;
  display: block;
`;

export const CheckboxWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`;

export const StyledCheckbox = styled.input`
  width: 20px;
  height: 20px;
  margin: 0;
  cursor: pointer;
  accent-color: ${theme.colors.logoBlue};
  flex-shrink: 0;
`;

export const CheckboxLabelStyled = styled.label`
  font-size: ${({ $fontSize }) => $fontSize || '14px'};
  color: ${theme.colors.mainFont};
  cursor: pointer;
  line-height: ${theme.typography.lineHeight.normal};

  ${media.md} {
    font-size: ${({ $fontSize }) => $fontSize || '16px'};
  }
`;


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
  background:${theme.gradients.primary};
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