import styled from 'styled-components';
import { theme } from '../../theme';

const SelectWrapper = styled.div`
  width: ${({ width }) => width || '100%'};
`;

const StyledSelect = styled.select`
  width: 100%;
  height: ${({ height }) => height || '44px'};
  padding: 0 12px;

  font-size: ${({ fontSize }) => fontSize || '1rem'};
  color: ${theme.colors.textWhite};

  background: ${theme.colors.inputBg};
  border: 1px solid transparent;
  border-radius: 8px;

  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

export const SelectInput = ({
  value,
  onChange,
  placeholder,
  options = [],
  width,
  height,
  fontSize,
  ...props
}) => (
  <SelectWrapper width={width}>
    <StyledSelect
      value={value}
      onChange={onChange}
      height={height}
      fontSize={fontSize}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}

      {options.map(({ label, value }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </StyledSelect>
  </SelectWrapper>
);
