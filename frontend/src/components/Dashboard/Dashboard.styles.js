import styled from 'styled-components';
import { theme } from '../../theme';

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

  @media (min-width: 768px) {
    padding: 0 2rem 2rem;
  }
`;

export const DashboardGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;

  @media (min-width: 1024px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    gap: 1.5rem;
  }
`;

export const WelcomeCard = styled.div`
  background: rgba(231, 248, 255, 0.8);
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;

  @media (min-width: 1024px) {
    grid-column: 1 / 2;
    grid-row: 1;
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
  margin: 0;

  @media (min-width: 768px) {
    font-size: 18px;
  }
`;

export const QuickStatsCard = styled.div`
  background: ${theme.colors.white};
  border-radius: 16px;
  padding: 1.5rem;

  @media (min-width: 1024px) {
    grid-column: 2;
    grid-row: 1;
  }
`;

export const QuickStatsTitle = styled.h3`
  font-size: 14px;
  font-weight: 400;
  color: ${theme.colors.mainFont};
  margin: 0 0 0.5rem;
`;

export const QuickStatsContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const QuickStatsAmount = styled.span`
  font-size: 28px;
  font-weight: 700;
  color: ${theme.colors.mainFont};

  @media (min-width: 768px) {
    font-size: 36px;
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

export const BottomRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (min-width: 1024px) {
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

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  @media (min-width: 1024px) {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
`;

export const DeadlinesCard = styled.div`
  background: ${theme.colors.white};
  border-radius: 16px;
  padding: 1.5rem;
`;

export const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.mainFont};
  margin: 0 0 1rem;
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
  font-size: 14px;
  color: ${({ $isOverdue }) => $isOverdue ? theme.colors.error : theme.colors.mainFont};
`;

export const DeadlineName = styled.span`
  font-weight: 500;
`;

export const DeadlineDate = styled.span`
  color: ${theme.colors.mainFont};
  opacity: 0.8;
`;

export const AddReminderButton = styled.button`
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: ${theme.colors.mainButton};
  border: 2px solid transparent;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.mainFont};
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${theme.colors.logoBlue};
  }
`;

export const ExpensesSummaryCard = styled.div`
  background: ${theme.colors.white};
  border-radius: 16px;
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
  font-size: 14px;
  color: ${theme.colors.mainFont};
`;

export const LegendDot = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 50%;
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
  font-size: 14px;
  color: ${theme.colors.mainFont};
`;

export const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 400px;
  max-height: 500px;

  @media (min-width: 1024px) {
    max-height: 450px;
  }
`;

export const GenerateInvoiceButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: rgba(231, 248, 255, 0.8);
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.mainFont};
  cursor: pointer;
  transition: background 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: rgba(231, 248, 255, 1);
  }
`;