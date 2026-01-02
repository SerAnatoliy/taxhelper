import styled from 'styled-components';
import { theme } from '../../theme';

export const ReportsContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${theme.colors.mainColorYellow};
  width: 100%;
  box-sizing: border-box;
`;

export const MainContent = styled.main`
  flex: 1;
  padding: 0 1rem 2rem;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: 0 2rem 2rem;
  }
`;

export const ContentGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;

  @media (min-width: 1024px) {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 1.5rem;
  }
`;

export const WelcomeCard = styled.div`
  background: rgba(231, 248, 255, 0.8);
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;

  @media (min-width: 1024px) {
    grid-column: 1 / -1;
    text-align: left;
    padding: 2rem;
  }
`;

export const WelcomeTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${theme.colors.mainFont};
  margin: 0 0 0.5rem;

  @media (min-width: 768px) {
    font-size: 32px;
  }
`;

export const WelcomeSubtitle = styled.p`
  font-size: 16px;
  font-style: italic;
  color: ${theme.colors.mainFont};
  margin: 0 0 1.5rem;

  @media (min-width: 768px) {
    font-size: 18px;
  }
`;

export const Card = styled.div`
  background: ${theme.colors.white};
  border-radius: 16px;
  padding: 1.5rem;

  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

export const CardTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${theme.colors.mainFont};
  margin: 0 0 1rem;
`;

export const CardSubtitle = styled.p`
  font-size: 14px;
  color: ${theme.colors.mainFont};
  opacity: 0.7;
  margin: 0;
`;

export const WizardCard = styled(Card)`
  @media (min-width: 1024px) {
    grid-column: 1 / -1;
  }
`;

export const WizardHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
`;

export const WizardTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: ${theme.colors.mainFont};
  margin: 0;

  @media (min-width: 768px) {
    font-size: 28px;
  }
`;

export const WizardMeta = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
`;

export const StepIndicator = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: ${theme.colors.mainButton};
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.mainFont};
`;

export const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;

  ${({ $status }) => {
    switch ($status) {
      case 'Submitted':
        return `
          background: rgba(1, 98, 187, 0.15);
          color: ${theme.colors.logoBlue};
        `;
      case 'Accepted':
        return `
          background: rgba(2, 194, 104, 0.15);
          color: ${theme.colors.successGreen};
        `;
      case 'Draft':
        return `
          background: rgba(51, 51, 51, 0.1);
          color: ${theme.colors.mainFont};
        `;
      case 'Pending':
        return `
          background: rgba(252, 202, 58, 0.3);
          color: ${theme.colors.mainFont};
        `;
      case 'Rejected':
        return `
          background: rgba(218, 28, 28, 0.15);
          color: ${theme.colors.error};
        `;
      default:
        return `
          background: rgba(51, 51, 51, 0.1);
          color: ${theme.colors.mainFont};
        `;
    }
  }}
`;

export const StepList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

export const StepItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-radius: 12px;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  transition: background 0.2s ease;
  background: ${({ $active }) => ($active ? 'rgba(254, 214, 57, 0.2)' : 'transparent')};

  &:hover {
    background: ${({ $clickable }) => ($clickable ? 'rgba(254, 214, 57, 0.1)' : 'transparent')};
  }
`;

export const StepTitle = styled.span`
  font-size: 18px;
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  color: ${theme.colors.mainFont};

  @media (min-width: 768px) {
    font-size: 20px;
  }
`;

export const StepIcon = styled.span`
  display: flex;
  align-items: center;
  color: ${({ $completed }) => ($completed ? theme.colors.successGreen : theme.colors.mainFont)};
  opacity: ${({ $completed }) => ($completed ? 1 : 0.5)};
`;

export const CalculationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 1.5rem 0;

  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

export const CalculationCard = styled.div`
  background: ${({ $highlight }) => ($highlight ? 'rgba(254, 214, 57, 0.3)' : theme.colors.lightGrey)};
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  border: ${({ $highlight }) => ($highlight ? `2px solid ${theme.colors.mainButton}` : 'none')};
`;

export const CalculationLabel = styled.div`
  font-size: 14px;
  color: ${theme.colors.mainFont};
  opacity: 0.7;
  margin-bottom: 0.5rem;
`;

export const CalculationValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${theme.colors.mainFont};

  @media (min-width: 768px) {
    font-size: 24px;
  }
`;

export const CalculationSubtext = styled.div`
  font-size: 12px;
  color: ${theme.colors.mainFont};
  opacity: 0.6;
  margin-top: 0.25rem;
`;

export const CalculationTable = styled.div`
  margin: 1.5rem 0;
`;

export const CalculationRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }

  &:last-child {
    border-bottom: none;
  }
`;

export const CalculationCell = styled.div`
  font-size: 14px;
  color: ${({ $label }) => ($label ? theme.colors.mainFont : theme.colors.mainFont)};
  opacity: ${({ $label }) => ($label ? 0.7 : 1)};
  font-weight: ${({ $value }) => ($value ? '600' : '400')};

  @media (min-width: 768px) {
    font-size: 16px;
  }
`;

export const InfoBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(2, 176, 194, 0.15);
  color: ${theme.colors.logoTeal};
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: help;
`;

export const ReportsListCard = styled(Card)`
  overflow-x: auto;

  @media (min-width: 1024px) {
    grid-column: 1;
  }
`;

export const ReportsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 500px;
`;

export const TableHead = styled.thead`
  background: rgba(231, 248, 255, 0.5);
`;

export const TableHeaderCell = styled.th`
  padding: 0.75rem 1rem;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.mainFont};
  text-align: left;
  border: 1px solid ${theme.colors.mainFont};

  &:last-child {
    text-align: center;
  }
`;

export const TableBody = styled.tbody``;

export const TableRow = styled.tr`
  &:hover {
    background: rgba(254, 202, 58, 0.1);
  }
`;

export const TableCell = styled.td`
  padding: 0.75rem 1rem;
  font-size: 14px;
  color: ${theme.colors.mainFont};
  border: 1px solid ${theme.colors.mainFont};

  &:last-child {
    text-align: center;
  }
`;

export const ActionIconsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

export const ActionIconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }

  svg {
    width: 20px;
    height: 20px;
    color: ${theme.colors.mainFont};
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${theme.colors.mainFont};
  opacity: 0.7;
`;

export const FiltersCard = styled(Card)`
  @media (min-width: 1024px) {
    grid-row: span 2;
  }
`;

export const FiltersTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: ${theme.colors.mainFont};
  margin: 0 0 1.5rem;
`;

export const FilterGroup = styled.div`
  margin-bottom: 1.5rem;

  &:last-of-type {
    margin-bottom: 0;
  }
`;

export const FilterLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.mainFont};
  margin-bottom: 0.5rem;
`;

export const DateInputGroup = styled.div`
  display: flex;
  gap: 0.75rem;
`;

export const DateInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid ${theme.colors.mainFont};
  border-radius: 20px;
  font-size: 14px;
  color: ${theme.colors.mainFont};
  background: ${theme.colors.white};

  &:focus {
    outline: none;
    border-color: ${theme.colors.logoBlue};
  }

  &::placeholder {
    color: ${theme.colors.mainFont};
    opacity: 0.6;
  }
`;

export const CheckboxGroup = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 14px;
  color: ${theme.colors.mainFont};
  cursor: pointer;
`;

export const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 18px;
  height: 18px;
  border: 2px solid ${theme.colors.mainFont};
  border-radius: 4px;
  cursor: pointer;
  accent-color: ${theme.colors.logoBlue};
`;

export const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

export const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.mainFont};
  margin-bottom: 0.5rem;
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid transparent;
  border-radius: 12px;
  font-size: 16px;
  color: ${theme.colors.mainFont};
  background: ${theme.colors.lightGrey};
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 20px;

  &:focus {
    outline: none;
    border-color: ${theme.colors.logoBlue};
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;

  ${({ $spaceBetween }) => $spaceBetween && `
    justify-content: space-between;
  `}
`;

export const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${theme.colors.mainButton};
  color: ${theme.colors.mainFont};
  border: 3px solid transparent;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:hover:not(:disabled) {
    border-color: ${theme.colors.logoBlue};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const SecondaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${theme.colors.secondaryButton};
  color: ${theme.colors.mainFont};
  border: 3px solid transparent;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:hover:not(:disabled) {
    border-color: ${theme.colors.logoBlue};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const OutlineButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: ${theme.colors.mainFont};
  border: 2px solid ${theme.colors.mainFont};
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.05);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const ApplyButton = styled(PrimaryButton)`
  width: 100%;
  margin-top: 1.5rem;
`;

export const QRCodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background: ${theme.colors.white};
  border-radius: 12px;
  border: 2px dashed ${theme.colors.mainFont};
  margin: 1.5rem 0;
`;

export const QRCodeImage = styled.img`
  width: 150px;
  height: 150px;
  margin-bottom: 1rem;
`;

export const QRCodeLabel = styled.p`
  font-size: 12px;
  color: ${theme.colors.mainFont};
  opacity: 0.7;
  text-align: center;
  margin: 0.5rem 0 0;
`;

export const VerifactuBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(2, 194, 104, 0.15);
  border: 1px solid ${theme.colors.successGreen};
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: ${theme.colors.successGreen};

  svg {
    width: 14px;
    height: 14px;
  }
`;

export const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 3px solid rgba(51, 51, 51, 0.2);
  border-top-color: ${theme.colors.mainFont};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

export const SuccessContainer = styled.div`
  text-align: center;
  padding: 2rem;

  svg {
    width: 64px;
    height: 64px;
    color: ${theme.colors.successGreen};
    margin-bottom: 1rem;
  }

  p {
    font-size: 18px;
    color: ${theme.colors.mainFont};
    margin: 0 0 0.5rem;
  }

  span {
    font-size: 14px;
    color: ${theme.colors.mainFont};
    opacity: 0.7;
  }
`;