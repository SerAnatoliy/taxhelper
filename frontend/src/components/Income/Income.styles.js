import styled from 'styled-components';
import { theme, media } from '../../theme';

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

  ${media.md} {
    padding: 0 2rem 2rem;
  }
`;

export const ContentGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;

  ${media.lg} {
    display: grid;
    grid-template-columns: 1fr 320px;
    grid-template-rows: auto auto auto auto;
    gap: 1.5rem;
  }
`;

export const FiltersCard = styled.div`
  background: ${theme.colors.white};
  order-radius: ${theme.borderRadius.xl};
  padding: 1.5rem;
  overflow: hidden;

  ${media.lg} {
    grid-column: 2;
    grid-row: 2;
  }
`;

export const IncomeListCard = styled.div`
  background: ${theme.colors.white};
  order-radius: ${theme.borderRadius.xl};
  padding: 1.5rem;
  overflow-x: auto;

  ${media.lg} {
    grid-column: 1;
    grid-row: 3 / 5;
  }
`;

export const IncomeListTitle = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.mainFont};
  margin: 0 0 1rem;
  text-align: center;
`;

export const SummaryCard = styled.div`
  background: ${theme.colors.white};
  order-radius: ${theme.borderRadius.xl};
  padding: 1.5rem;

  ${media.lg} {
    grid-column: 2;
    grid-row: 3;
  }
`;

export const SummaryTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
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
    font-weight: ${theme.typography.fontWeight.semibold};
  }
`;

export const SummaryLabel = styled.span`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.mainFont};
`;

export const SummaryValue = styled.span`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${({ $highlight }) => $highlight ? theme.colors.logoBlue : theme.colors.mainFont};
`;

export const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 500px;
`;

export const TableHead = styled.thead`
  background: ${theme.rgba.blueLight};
`;

export const TableHeaderCell = styled.th`
  padding: 0.75rem 1rem;
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
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
    background: ${theme.rgba.yellowHover};
  }
`;

export const TableCell = styled.td`
  padding: 0.75rem 1rem;
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.mainFont};
  border: 1px solid ${theme.colors.mainFont};

  &:last-child {
    text-align: center;
  }
`;

export const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  text-transform: capitalize;
  background: ${({ $status }) => {
    switch ($status) {
      case 'paid': return theme.rgba.successBg;
      case 'pending': return 'rgba(255, 152, 0, 0.15)';
      case 'overdue': return theme.rgba.deleteBg;
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