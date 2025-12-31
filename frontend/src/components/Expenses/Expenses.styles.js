import styled from 'styled-components';
import { theme } from '../../theme';

export const ExpensesContainer = styled.div`
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
    grid-template-rows: auto auto auto;
    gap: 1.5rem;
  }
`;

// Welcome Card
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

export const WelcomeActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;

  @media (min-width: 1024px) {
    justify-content: flex-start;
  }
`;

export const ActionBtn = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${({ $primary }) => $primary ? theme.colors.mainButton : 'transparent'};
  border: ${({ $primary }) => $primary ? 'none' : `2px solid ${theme.colors.mainFont}`};
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.mainFont};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $primary }) => $primary ? theme.colors.logoYellow : 'rgba(0,0,0,0.05)'};
  }
`;

// Upload Card
export const UploadCard = styled.div`
  background: ${theme.colors.white};
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  @media (min-width: 1024px) {
    grid-column: 1;
    grid-row: 2;
  }
`;

export const UploadDropzone = styled.div`
  width: 100%;
  border: 2px dashed ${({ $isDragging }) => $isDragging ? theme.colors.logoBlue : theme.colors.mainFont};
  border-radius: 12px;
  padding: 2rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ $isDragging }) => $isDragging ? 'rgba(1, 98, 187, 0.05)' : 'transparent'};

  &:hover {
    border-color: ${theme.colors.logoBlue};
    background: rgba(1, 98, 187, 0.02);
  }
`;

export const UploadIconWrapper = styled.div`
  margin-bottom: 1rem;
  
  svg {
    width: 64px;
    height: 64px;
    color: ${theme.colors.mainFont};
  }
`;

export const UploadText = styled.p`
  font-size: 16px;
  color: ${theme.colors.mainFont};
  margin: 0 0 0.5rem;
  line-height: 1.5;
`;

export const UploadSubtext = styled.span`
  font-size: 14px;
  color: ${theme.colors.mainFont};
  opacity: 0.7;
`;

export const BrowseButton = styled.button`
  margin-top: 1.5rem;
  padding: 0.75rem 2rem;
  background: ${theme.colors.mainButton};
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.mainFont};
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${theme.colors.logoYellow};
  }
`;

export const ParsedCount = styled.p`
  margin-top: 1rem;
  font-size: 14px;
  color: ${theme.colors.mainFont};
`;

// Filters Card
export const FiltersCard = styled.div`
  background: ${theme.colors.white};
  border-radius: 16px;
  padding: 1.5rem;
  overflow: hidden;

  @media (min-width: 1024px) {
    grid-column: 2;
    grid-row: 2 / 4;
  }
`;

export const FiltersTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: ${theme.colors.mainFont};
  margin: 0 0 1.5rem;
`;

export const FilterSection = styled.div`
  margin-bottom: 1.5rem;
`;

export const FilterLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.mainFont};
  margin-bottom: 0.5rem;
`;

export const DateInputRow = styled.div`
  display: flex;
  gap: 0.5rem;
  width: 100%;
`;

export const DateInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 0.5rem;
  background: rgba(231, 248, 255, 0.5);
  border: none;
  border-radius: 8px;
  font-size: 13px;
  color: ${theme.colors.mainFont};
  box-sizing: border-box;

  &::placeholder {
    color: ${theme.colors.mainFont};
    opacity: 0.6;
  }

  &:focus {
    outline: 2px solid ${theme.colors.logoBlue};
  }

  /* Ensure date picker fits */
  &::-webkit-calendar-picker-indicator {
    cursor: pointer;
    padding: 0;
    margin: 0;
  }

  @media (max-width: 400px) {
    font-size: 12px;
    padding: 0.4rem;
  }
`;

export const TypeFilterRow = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
`;

export const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 14px;
  color: ${theme.colors.mainFont};
  cursor: pointer;
`;

export const RadioInput = styled.input`
  width: 18px;
  height: 18px;
  accent-color: ${theme.colors.logoBlue};
  cursor: pointer;
`;

export const ApplyButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: rgba(231, 248, 255, 0.8);
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.mainFont};
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(231, 248, 255, 1);
  }
`;

export const FilterButtonRow = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const ClearButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  background: transparent;
  border: 1px solid ${theme.colors.mainFont};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.mainFont};
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

export const ApplyButtonStyled = styled.button`
  flex: 2;
  padding: 0.75rem;
  background: rgba(231, 248, 255, 0.8);
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.mainFont};
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(231, 248, 255, 1);
  }
`;

// Expenses List Card
export const ExpensesListCard = styled.div`
  background: ${theme.colors.white};
  border-radius: 16px;
  padding: 1.5rem;
  overflow-x: auto;

  @media (min-width: 1024px) {
    grid-column: 1;
    grid-row: 3;
  }
`;

export const ExpensesListTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${theme.colors.mainFont};
  margin: 0 0 1rem;
  text-align: center;
`;

export const ExpensesTable = styled.table`
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

export const LoadingSpinner = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${theme.colors.mainFont};
`;