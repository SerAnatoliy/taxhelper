import {
  FiltersCard,
  FiltersTitle,
  FilterSection,
  FilterLabel,
  DateInputRow,
  DateInput,
  RadioGroup,
  RadioLabel,
  RadioInput,
  CheckboxGroup,
  CheckboxLabel,
  Checkbox,
  FilterButtonRow,
  ClearButton,
  ApplyButton,
} from './Filters.styles';

/**
 * Reusable Filters component for Expenses, Income, and Reports pages
 * 
 * @param {Object} props
 * @param {string} props.title - Filter card title (default: 'Filters')
 * @param {Object} props.filters - Current filter values
 * @param {Function} props.onChange - Handler for filter changes
 * @param {Function} props.onApply - Handler for apply button
 * @param {Function} props.onClear - Handler for clear button
 * @param {boolean} props.showDateRange - Show date range filter (default: true)
 * @param {Array} props.radioOptions - Radio button options [{ value, label }]
 * @param {string} props.radioName - Name for radio input group
 * @param {string} props.radioValue - Current radio value
 * @param {Function} props.onRadioChange - Handler for radio changes
 * @param {Array} props.checkboxOptions - Checkbox options [{ key, label }]
 * @param {React.ReactNode} props.children - Custom filter sections
 */
const Filters = ({
  title = 'Filters',
  filters = {},
  onChange,
  onApply,
  onClear,
  showDateRange = true,
  radioOptions,
  radioName,
  radioValue,
  onRadioChange,
  checkboxOptions,
  children,
}) => {
  const handleDateChange = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  const handleCheckboxChange = (key, checked) => {
    onChange({ ...filters, [key]: checked });
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      const clearedFilters = { dateFrom: '', dateTo: '' };
      if (radioOptions) clearedFilters[radioName] = '';
      if (checkboxOptions) {
        checkboxOptions.forEach(opt => clearedFilters[opt.key] = false);
      }
      onChange(clearedFilters);
    }
  };

  return (
    <FiltersCard>
      <FiltersTitle>{title}</FiltersTitle>

      {showDateRange && (
        <FilterSection>
          <FilterLabel>Date Range</FilterLabel>
          <DateInputRow>
            <DateInput
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleDateChange('dateFrom', e.target.value)}
              placeholder="From"
            />
            <DateInput
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleDateChange('dateTo', e.target.value)}
              placeholder="To"
            />
          </DateInputRow>
        </FilterSection>
      )}

      {radioOptions && radioOptions.length > 0 && (
        <FilterSection>
          <FilterLabel>Type</FilterLabel>
          <RadioGroup>
            {radioOptions.map((option) => (
              <RadioLabel key={option.value}>
                {option.label}
                <RadioInput
                  name={radioName}
                  checked={radioValue === option.value}
                  onChange={() => onRadioChange(option.value)}
                />
              </RadioLabel>
            ))}
          </RadioGroup>
        </FilterSection>
      )}

      {checkboxOptions && checkboxOptions.length > 0 && (
        <FilterSection>
          <FilterLabel>Type</FilterLabel>
          <CheckboxGroup>
            {checkboxOptions.map((option) => (
              <CheckboxLabel key={option.key}>
                <Checkbox
                  checked={filters[option.key] || false}
                  onChange={(e) => handleCheckboxChange(option.key, e.target.checked)}
                />
                {option.label}
              </CheckboxLabel>
            ))}
          </CheckboxGroup>
        </FilterSection>
      )}

      {children}

      <FilterButtonRow>
        <ClearButton onClick={handleClear}>Clear</ClearButton>
        <ApplyButton onClick={onApply}>Apply</ApplyButton>
      </FilterButtonRow>
    </FiltersCard>
  );
};

export {
  FiltersCard,
  FiltersTitle,
  FilterSection,
  FilterLabel,
  DateInputRow,
  DateInput,
  RadioGroup,
  RadioLabel,
  RadioInput,
  CheckboxGroup,
  CheckboxLabel,
  Checkbox,
  FilterButtonRow,
  ClearButton,
  ApplyButton,
};

export default Filters;