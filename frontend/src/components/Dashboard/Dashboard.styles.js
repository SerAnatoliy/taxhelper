import styled from 'styled-components';
import { theme, media } from '../../theme';

export const DashboardContainer = styled.div`
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

export const DashboardGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;

  ${media.lg} {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    gap: 1.5rem;
  }
`;

export const BottomRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  ${media.lg} {
    grid-column: 1 / -1;
    grid-row: 2;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
`;

export const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  ${media.md} {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  ${media.lg} {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
`;

export const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 400px;
  max-height: 500px;

  ${media.lg} {
    max-height: 450px;
  }
`;

export const WelcomeCard = styled.div`
  background: rgba(231, 248, 255, 0.8);
  order-radius: ${theme.borderRadius.xl};
  padding: 1.5rem;
  text-align: center;

  ${media.lg} {
    grid-column: 1 / 2;
    grid-row: 1;
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
  margin: 0;

  ${media.md} {
    font-size: ${theme.typography.fontSize.lg};
  }
`;

export const QuickStatsCard = styled.div`
  background: ${theme.colors.white};
  order-radius: ${theme.borderRadius.xl};
  padding: 1.5rem;

  ${media.lg} {
    grid-column: 2;
    grid-row: 1;
  }
`;

export const QuickStatsTitle = styled.h3`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.normal};
  color: ${theme.colors.mainFont};
  margin: 0 0 0.5rem;
`;

export const QuickStatsContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const QuickStatsAmount = styled.span`
    font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.mainFont};

  ${media.md} {
    font-size: ${theme.typography.fontSize['5xl']};
  }
`;

export const QuickStatsChart = styled.div`
  width: 80px;
  height: 50px;
  
  svg {
    width: 100%;
    height: 100%;
    color: ${theme.colors.mainFont};
  }
`;

export const DeadlinesCard = styled.div`
  background: ${theme.colors.white};
  order-radius: ${theme.borderRadius.xl};
  padding: 1.5rem;
`;

export const CardTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.mainFont};
  margin: 0 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const PeriodLabel = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.logoBlue || '#0162BB'};
  background: ${theme.rgba.blueFocus};
  padding: 0.25rem 0.5rem;
  border-radius: ${theme.borderRadius.sm};
`;

export const DeadlinesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const DeadlineItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${theme.typography.fontSize.base};
  color: ${({ $isOverdue }) => $isOverdue ? theme.colors.error : theme.colors.mainFont};
`;

export const DeadlineName = styled.span`
  font-weight: ${theme.typography.fontWeight.medium};
`;

export const DeadlineDate = styled.span`
  color: ${theme.colors.mainFont};
  opacity: ${theme.opacity.hover};
`;

export const DeadlineInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
`;

export const DeadlineActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-left: 0.5rem;
`;

export const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  border-radius: ${theme.borderRadius.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color ${theme.transitions.default}, transform ${theme.transitions.slow};

  &:hover {
    background-color: ${({ $variant }) => 
      $variant === 'complete' ? theme.rgba.successBg : 
      $variant === 'delete' ? theme.rgba.deleteBg : 
      theme.rgba.blackHover};
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 16px;
    height: 16px;
    color: ${({ $variant }) => 
      $variant === 'complete' ? '#4CAF50' : 
      $variant === 'delete' ? '#f44336' : 
      theme.colors.mainFont};
  }
`;

export const DeadlineType = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  text-transform: uppercase;
  color: ${({ $type }) => 
    $type === 'tax' ? theme.colors.logoBlue || '#0162BB' : 
    theme.colors.mainFont};
  opacity: ${theme.opacity.subtle};
  letter-spacing: 0.5px;
`;

export const AddReminderButton = styled.button`
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: ${theme.colors.mainButton};
  border: 2px solid transparent;
 border-radius: ${theme.borderRadius['2xl']};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.mainFont};
  cursor: pointer;
  transition: ${theme.transitions.button};;

  &:hover {
    border-color: ${theme.colors.logoBlue};
  }
`;

export const ExpensesSummaryCard = styled.div`
  background: ${theme.colors.white};
  order-radius: ${theme.borderRadius.xl};
  padding: 1.5rem;
`;

export const ExpensesContent = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;
`;

export const DonutChartContainer = styled.div`
  width: 100px;
  height: 100px;
  flex-shrink: 0;
`;

export const ExpensesLegend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.mainFont};
`;

export const LegendDot = styled.span`
  width: 12px;
  height: 12px;
 border-radius: ${theme.borderRadius.full};
  background: ${({ $color }) => $color};
`;

export const ExpensesStats = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const ExpensesStat = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.mainFont};
`;

export const GenerateInvoiceButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: rgba(231, 248, 255, 0.8);
  border: none;
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.mainFont};
  cursor: pointer;
  transition: background ${theme.transitions.default};
  flex-shrink: 0;

  &:hover {
    background: rgba(231, 248, 255, 1);
  }
`;