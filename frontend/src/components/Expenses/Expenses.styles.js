import styled from 'styled-components';
import { theme, media } from '../../theme';

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
    grid-template-rows: auto auto auto;
    gap: 1.5rem;
  }
`;

// Welcome Card
export const WelcomeCard = styled.div`
  background: rgba(231, 248, 255, 0.8);
  border-radius: ${theme.borderRadius.xl};
  padding: 1.5rem;
  text-align: center;

  ${media.lg} {
    grid-column: 1 / -1;
    text-align: left;
    padding: 2rem;
  }
`;

export const WelcomeTitle = styled.h1`
    font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.mainFont};
  margin: 0 0 0.5rem;

  ${media.md} {
      font-size: ${theme.typography.fontSize['4xl']};
  }
`;

export const WelcomeSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.md};
  font-style: italic;
  color: ${theme.colors.mainFont};
  margin: 0 0 1.5rem;

  ${media.md} {
    font-size: ${theme.typography.fontSize.lg};
  }
`;

export const WelcomeActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;

  ${media.lg} {
    justify-content: flex-start;
  }
`;

export const ActionBtn = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${({ $primary }) => $primary ? theme.colors.mainButton : 'transparent'};
  border: ${({ $primary }) => $primary ? 'none' : `2px solid ${theme.colors.mainFont}`};
 border-radius: ${theme.borderRadius['2xl']};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.mainFont};
  cursor: pointer;
  transition: ${theme.transitions.all};

  &:hover {
    background: ${({ $primary }) => $primary ? theme.colors.logoYellow : 'rgba(0,0,0,0.05)'};
  }
`;

// Upload Card
export const UploadCard = styled.div`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.xl};
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  ${media.lg} {
    grid-column: 1;
    grid-row: 2;
  }
`;

export const UploadDropzone = styled.div`
  width: 100%;
  border: 2px dashed ${({ $isDragging }) => $isDragging ? theme.colors.logoBlue : theme.colors.mainFont};
  border-radius: ${theme.borderRadius.lg};
  padding: 2rem 1rem;
  cursor: pointer;
  transition: ${theme.transitions.all};
  background: ${({ $isDragging }) => $isDragging ? theme.rgba.blueHover : 'transparent'};

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
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.mainFont};
  margin: 0 0 0.5rem;
  line-height: ${theme.typography.lineHeight.relaxed};
`;

export const UploadSubtext = styled.span`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.mainFont};
  opacity: ${theme.opacity.subtle};
`;

export const BrowseButton = styled.button`
  margin-top: 1.5rem;
  padding: 0.75rem 2rem;
  background: ${theme.colors.mainButton};
  border: none;
 border-radius: ${theme.borderRadius['2xl']};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.mainFont};
  cursor: pointer;
  transition: background ${theme.transitions.default};

  &:hover {
    background: ${theme.colors.logoYellow};
  }
`;

export const ParsedCount = styled.p`
  margin-top: 1rem;
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.mainFont};
`;

// Filters Card
export const FiltersCard = styled.div`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.xl};
  padding: 1.5rem;
  overflow: hidden;

  ${media.lg} {
    grid-column: 2;
    grid-row: 2 / 4;
  }
`;

export const FiltersTitle = styled.h2`
    font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.mainFont};
  margin: 0 0 1.5rem;
`;

export const FilterSection = styled.div`
  margin-bottom: 1.5rem;
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
  gap: 0.5rem;
  width: 100%;
`;

export const DateInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 0.5rem;
  background: ${theme.rgba.blueLight};
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.mainFont};
  box-sizing: border-box;

  &::placeholder {
    color: ${theme.colors.mainFont};
    opacity: ${theme.opacity.muted};
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
    font-size: ${theme.typography.fontSize.sm};
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
  font-size: ${theme.typography.fontSize.base};
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
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.mainFont};
  cursor: pointer;
  transition: background ${theme.transitions.default};

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
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.mainFont};
  cursor: pointer;
  transition: background ${theme.transitions.default};

  &:hover {
    background: ${theme.rgba.blackHover}; 
  }
`;

export const ApplyButtonStyled = styled.button`
  flex: 2;
  padding: 0.75rem;
  background: rgba(231, 248, 255, 0.8);
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.mainFont};
  cursor: pointer;
  transition: background ${theme.transitions.default};

  &:hover {
    background: rgba(231, 248, 255, 1);
  }
`;

// Expenses List Card
export const ExpensesListCard = styled.div`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.xl};
  padding: 1.5rem;
  overflow-x: auto;

  ${media.lg} {
    grid-column: 1;
    grid-row: 3;
  }
`;

export const ExpensesListTitle = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
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
  opacity: ${theme.opacity.subtle};
  transition: ${theme.transitions.opacity};

  &:hover {
    opacity: ${theme.opacity.full};
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
  opacity: ${theme.opacity.subtle};
`;

export const LoadingSpinner = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${theme.colors.mainFont};
`;