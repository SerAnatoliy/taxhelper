import styled from 'styled-components';
import { theme } from '../../theme';

export {
  WelcomeCard,
  WelcomeTitle,
  WelcomeSubtitle,
  WelcomeActions,
  ActionBtn,
  UploadCard,
  UploadDropzone,
  UploadIconWrapper,
  UploadText,
  UploadSubtext,
  BrowseButton,
  ParsedCount,
  FiltersTitle,
  FilterSection,
  FilterLabel,
  DateInputRow,
  DateInput,
  FilterButtonRow,
  ClearButton,
  ApplyButtonStyled,
  EmptyState,
  LoadingSpinner,
  ActionIconsWrapper,
  ActionIconButton,
} from '../Expenses/Expenses.styles';

export const IncomeContainer = styled.div`
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
    grid-template-rows: auto auto auto auto;
    gap: 1.5rem;
  }
`;

export const FiltersCard = styled.div`
  background: ${theme.colors.white};
  border-radius: 16px;
  padding: 1.5rem;
  overflow: hidden;

  @media (min-width: 1024px) {
    grid-column: 2;
    grid-row: 2;
  }
`;

export const IncomeListCard = styled.div`
  background: ${theme.colors.white};
  border-radius: 16px;
  padding: 1.5rem;
  overflow-x: auto;

  @media (min-width: 1024px) {
    grid-column: 1;
    grid-row: 3 / 5;
  }
`;

export const IncomeListTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${theme.colors.mainFont};
  margin: 0 0 1rem;
  text-align: center;
`;

export const SummaryCard = styled.div`
  background: ${theme.colors.white};
  border-radius: 16px;
  padding: 1.5rem;

  @media (min-width: 1024px) {
    grid-column: 2;
    grid-row: 3;
  }
`;

export const SummaryTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.mainFont};
  margin: 0 0 1rem;
`;

export const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);

  &:last-child {
    border-bottom: none;
    font-weight: 600;
  }
`;

export const SummaryLabel = styled.span`
  font-size: 14px;
  color: ${theme.colors.mainFont};
`;

export const SummaryValue = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: ${({ $highlight }) => $highlight ? theme.colors.logoBlue : theme.colors.mainFont};
`;

export const DataTable = styled.table`
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

export const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
  background: ${({ $status }) => {
    switch ($status) {
      case 'paid': return 'rgba(76, 175, 80, 0.15)';
      case 'pending': return 'rgba(255, 152, 0, 0.15)';
      case 'overdue': return 'rgba(244, 67, 54, 0.15)';
      default: return 'rgba(1, 98, 187, 0.15)';
    }
  }};
  color: ${({ $status }) => {
    switch ($status) {
      case 'paid': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'overdue': return '#f44336';
      default: return theme.colors.logoBlue;
    }
  }};
`;