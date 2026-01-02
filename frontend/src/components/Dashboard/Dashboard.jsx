import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../Footer/Footer';
import { AnyIcon } from '../Shared/AnyIcon/AnyIcon';
import { 
  getProfile, 
  getAllDeadlines,
  createReminder,
  completeReminder,
  deleteReminder,
  getPeriodFinancials
} from '../../services/api';
import ChartGrafic from '../../assets/icons/ChartGrafic.svg?react';
import CheckIcon from '../../assets/icons/CheckIcon.svg?react';
import DeleteIcon from '../../assets/icons/Delete.svg?react';

import AppHeader from '../Shared/AppHeader';
import {
  DashboardContainer,
  MainContent,
  DashboardGrid,
  WelcomeCard,
  WelcomeTitle,
  WelcomeSubtitle,
  QuickStatsCard,
  QuickStatsTitle,
  QuickStatsContent,
  QuickStatsAmount,
  QuickStatsChart,
  BottomRow,
  LeftColumn,
  DeadlinesCard,
  CardTitle,
  DeadlinesList,
  DeadlineItem,
  DeadlineName,
  DeadlineDate,
  DeadlineInfo,
  DeadlineActions,
  ActionButton,
  DeadlineType,
  AddReminderButton,
  ExpensesSummaryCard,
  ExpensesContent,
  DonutChartContainer,
  ExpensesLegend,
  LegendItem,
  LegendDot,
  ExpensesStats,
  ExpensesStat,
  RightColumn,
  GenerateInvoiceButton,
  PeriodLabel,
} from './Dashboard.styles';

import AddReminderModal from '../AddReminderModal/AddReminderModal';
import AIChat from '../AIChat/AIChat';
import GenerateInvoiceModal from '../GenerateInvoiceModal/GenerateInvoiceModal';

const DonutChart = ({ expenses = 0, income = 0 }) => {
  const total = expenses + income || 1;
  const expenseAngle = (expenses / total) * 360;
  
  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
      <circle cx="50" cy="50" r="40" fill="none" stroke="#FCCA3A" strokeWidth="20" />
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke="#679FD6"
        strokeWidth="20"
        strokeDasharray={`${(expenseAngle / 360) * 251.2} 251.2`}
        transform="rotate(-90 50 50)"
      />
    </svg>
  );
};

const processDeadlines = (response) => {
  const deadlines = [];
  
  if (response?.tax_deadlines && Array.isArray(response.tax_deadlines)) {
    response.tax_deadlines.forEach(d => {
      if (d.is_overdue) return;
      
      deadlines.push({
        name: d.name,
        date: d.due_date,
        isOverdue: false,
        type: 'tax',
        modelo: d.modelo,
        description: d.description,
        daysUntilDue: d.days_until_due
      });
    });
  }
  
  if (response?.custom_reminders && Array.isArray(response.custom_reminders)) {
    response.custom_reminders.forEach(r => {
      if (r.is_overdue || r.is_removed) return;
      
      deadlines.push({
        id: r.id,
        name: r.title,
        date: r.due_date,
        isOverdue: false,
        type: 'reminder',
        modelo: r.modelo,
        description: r.description,
        daysUntilDue: r.days_until_due
      });
    });
  }
  
  deadlines.sort((a, b) => new Date(a.date) - new Date(b.date));
  return deadlines.slice(0, 5);
};

const formatPeriodName = (period) => {
  if (!period) return '';
  const quarterNames = {
    'Q1': 'Jan-Mar',
    'Q2': 'Apr-Jun', 
    'Q3': 'Jul-Sep',
    'Q4': 'Oct-Dec'
  };
  return `${period.quarter} ${period.year} (${quarterNames[period.quarter]})`;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [hasNotifications, setHasNotifications] = useState(true);
  const [allDeadlines, setAllDeadlines] = useState([]);
  const [isLoadingDeadlines, setIsLoadingDeadlines] = useState(true);
  const [showAddReminder, setShowAddReminder] = useState(false);
  
  const [periodFinancials, setPeriodFinancials] = useState(null);
  const [isLoadingFinancials, setIsLoadingFinancials] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const refreshDeadlines = async () => {
    try {
      setIsLoadingDeadlines(true);
      const deadlinesResponse = await getAllDeadlines();
      const processedDeadlines = processDeadlines(deadlinesResponse);
      setAllDeadlines(processedDeadlines);
    } catch (error) {
      console.error('Error fetching deadlines:', error);
    } finally {
      setIsLoadingDeadlines(false);
    }
  };

  const refreshFinancials = async () => {
    try {
      setIsLoadingFinancials(true);
      const financials = await getPeriodFinancials();
      setPeriodFinancials(financials);
    } catch (error) {
      console.error('Error fetching period financials:', error);
      setPeriodFinancials(null);
    } finally {
      setIsLoadingFinancials(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await getProfile();
        setUserData(profile);
        
        await Promise.all([
          refreshDeadlines(),
          refreshFinancials()
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    
    fetchData();
  }, []);

  const handleAddReminder = async (reminderData) => {
    try {
      await createReminder(reminderData);
      await refreshDeadlines();
    } catch (error) {
      console.error('Error adding reminder:', error);
    }
  };

  const handleCompleteReminder = async (reminderId) => {
    try {
      await completeReminder(reminderId);
      await refreshDeadlines();
    } catch (error) {
      console.error('Error completing reminder:', error);
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    try {
      await deleteReminder(reminderId);
      await refreshDeadlines();
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const formatDeadlineDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const handleGenerateInvoice = async (invoiceData) => {
    try {
      console.log('Invoice data to save:', invoiceData);    
      alert('Invoice generated successfully!');
      await refreshFinancials();
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      throw error;
    }
  };

  const firstName = userData?.full_name?.split(' ')[0] || 'User';

  const income = periodFinancials?.total_income || 0;
  const expenses = periodFinancials?.total_expenses || 0;
  const netBalance = periodFinancials?.net_balance || 0;
  const avgDeduction = expenses * 0.21; 
  const currentPeriod = periodFinancials?.period;

  return (
    <DashboardContainer>
      <AppHeader 
        userName={userData?.full_name} 
        hasNotifications={hasNotifications}
      />
      <MainContent>
        <DashboardGrid>
          <WelcomeCard>
            <WelcomeTitle>Welcome back, {firstName}!</WelcomeTitle>
            <WelcomeSubtitle>
              Let's make your tax management easier today.
            </WelcomeSubtitle>
          </WelcomeCard>

          <QuickStatsCard>
            <QuickStatsTitle>Quick Tax Overview</QuickStatsTitle>
            <QuickStatsContent>
              <QuickStatsAmount>
                {isLoadingFinancials ? (
                  '...'
                ) : (
                  `€${netBalance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`
                )}
              </QuickStatsAmount>
              <QuickStatsChart>
                <AnyIcon icon={ChartGrafic} size="80px" />
              </QuickStatsChart>
            </QuickStatsContent>
          </QuickStatsCard>

          <BottomRow>
            <LeftColumn>
              <DeadlinesCard>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <DeadlinesList>
                  {isLoadingDeadlines ? (
                    <DeadlineItem>
                      <DeadlineName>Loading deadlines...</DeadlineName>
                    </DeadlineItem>
                  ) : allDeadlines.length > 0 ? (
                    allDeadlines.map((deadline, index) => (
                      <DeadlineItem key={deadline.id || `tax-${index}`} $isOverdue={deadline.isOverdue}>
                        <DeadlineInfo>
                          <DeadlineName>{deadline.name}</DeadlineName>
                          <DeadlineType $type={deadline.type}>
                            {deadline.type === 'tax' ? `Modelo ${deadline.modelo}` : 'Custom reminder'}
                          </DeadlineType>
                        </DeadlineInfo>
                        <DeadlineDate>{formatDeadlineDate(deadline.date)}</DeadlineDate>
                        {deadline.type === 'reminder' && deadline.id && (
                          <DeadlineActions>
                            <ActionButton 
                              $variant="complete" 
                              onClick={() => handleCompleteReminder(deadline.id)}
                              title="Mark as completed"
                            >
                              <AnyIcon icon={CheckIcon} size="16px" />
                            </ActionButton>
                            <ActionButton 
                              $variant="delete" 
                              onClick={() => handleDeleteReminder(deadline.id)}
                              title="Remove reminder"
                            >
                              <AnyIcon icon={DeleteIcon} size="16px" />
                            </ActionButton>
                          </DeadlineActions>
                        )}
                      </DeadlineItem>
                    ))
                  ) : (
                    <DeadlineItem>
                      <DeadlineName>No upcoming deadlines</DeadlineName>
                    </DeadlineItem>
                  )}
                </DeadlinesList>
                <AddReminderButton onClick={() => setShowAddReminder(true)}>
                  Add reminder
                </AddReminderButton>
              </DeadlinesCard>

              <ExpensesSummaryCard>
                <CardTitle>
                  Expenses Summary
                  {currentPeriod && (
                    <PeriodLabel>{formatPeriodName(currentPeriod)}</PeriodLabel>
                  )}
                </CardTitle>
                <ExpensesContent>
                  <DonutChartContainer>
                    <DonutChart expenses={expenses} income={income} />
                  </DonutChartContainer>
                  <ExpensesLegend>
                    <LegendItem>
                      <LegendDot $color="#679FD6" />
                      <span>Expenses {Math.round((expenses / (expenses + income || 1)) * 100)}%</span>
                    </LegendItem>
                    <LegendItem>
                      <LegendDot $color="#FCCA3A" />
                      <span>Income {Math.round((income / (expenses + income || 1)) * 100)}%</span>
                    </LegendItem>
                  </ExpensesLegend>
                </ExpensesContent>
                <ExpensesStats>
                  <ExpensesStat>
                    <span>Total Income:</span>
                    <span>
                      {isLoadingFinancials ? '...' : `€${income.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
                    </span>
                  </ExpensesStat>
                  <ExpensesStat>
                    <span>Total Expenses:</span>
                    <span>
                      {isLoadingFinancials ? '...' : `€${expenses.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
                    </span>
                  </ExpensesStat>
                  <ExpensesStat>
                    <span>Est. IVA Deduction:</span>
                    <span>
                      {isLoadingFinancials ? '...' : `€${avgDeduction.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
                    </span>
                  </ExpensesStat>
                </ExpensesStats>
              </ExpensesSummaryCard>
            </LeftColumn>

            <RightColumn>
              <AIChat userName={firstName} />
              <GenerateInvoiceButton onClick={() => setShowInvoiceModal(true)}>
                Generate invoice
              </GenerateInvoiceButton>
            </RightColumn>
          </BottomRow>
        </DashboardGrid>
      </MainContent>

      <Footer />

      <AddReminderModal
        isOpen={showAddReminder}
        onClose={() => setShowAddReminder(false)}
        onSubmit={handleAddReminder}
      />
      <GenerateInvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        onSubmit={handleGenerateInvoice}
      />
    </DashboardContainer>
  );
};

export default Dashboard;