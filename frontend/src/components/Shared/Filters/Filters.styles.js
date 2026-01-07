import styled from 'styled-components';
import { theme, media } from '../../../theme';

export const FiltersCard = styled.div`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.xl};
  padding: 1.5rem;
  overflow: visible;
`;

export const FiltersTitle = styled.h2`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.mainFont};
  margin: 0 0 1.5rem;
`;

export const FilterSection = styled.div`
  margin-bottom: 1.5rem;

  &:last-of-type {
    margin-bottom: 0;
  }
`;

export const FilterLabel = styled.label`
  display: block;
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.mainFont};
  margin-bottom: 0.5rem;
`;

export const DateInputRow = styled.div`
  display: flex;
  flex-direction: column;  
  gap: 0.5rem;
  width: 100%;

  ${media.md} {
    flex-direction: row;  
    gap: 0.75rem;
  }
`;

export const DateInput = styled.input`
  flex: 1;
  width: 100%;
  min-width: 0;         
  padding: 0.625rem 0.5rem;
  border: 1px solid ${theme.colors.mainFont};
  border-radius: ${theme.borderRadius['2xl']};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.mainFont};
  background: ${theme.colors.white};
  
  ${media.md} {
    flex: 1;
    padding: 0.75rem 0.75rem;
  }

  &:focus {
    outline: none;
    border-color: ${theme.colors.logoBlue};
  }

  &::placeholder {
    color: ${theme.colors.mainFont};
    opacity: ${theme.opacity.muted};

    
  }
`;

export const RadioGroup = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
`;

export const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.mainFont};
  cursor: pointer;
`;

export const RadioInput = styled.input.attrs({ type: 'radio' })`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: ${theme.colors.logoBlue};
`;

// Checkbox styles (for Reports type filter)
export const CheckboxGroup = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.mainFont};
  cursor: pointer;
`;

export const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 18px;
  height: 18px;
  border: 2px solid ${theme.colors.mainFont};
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  accent-color: ${theme.colors.logoBlue};
`;

// Button row styles
export const FilterButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

export const ClearButton = styled.button`
  flex: 1;
  padding: 0.75rem 1rem;
  background: transparent;
  border: 2px solid ${theme.colors.mainFont};
  border-radius: ${theme.borderRadius['2xl']};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.mainFont};
  cursor: pointer;
  transition: ${theme.transitions.all};

  &:hover {
    background: ${theme.rgba.blackHover};
  }
`;

export const ApplyButton = styled.button`
  flex: 1;
  padding: 0.75rem 1rem;
  background: ${theme.colors.mainButton};
  border: 2px solid transparent;
  border-radius: ${theme.borderRadius['2xl']};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.mainFont};
  cursor: pointer;
  transition: ${theme.transitions.button};

  &:hover {
    border-color: ${theme.colors.logoBlue};
  }

  &:disabled {
    opacity: ${theme.opacity.muted};
    cursor: not-allowed;
  }
`;