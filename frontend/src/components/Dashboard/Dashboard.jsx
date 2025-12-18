import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../Footer/Footer';
import { AnyIcon } from '../Shared/AnyIcon/AnyIcon';
import { 
  getProfile, 
  getBankTransactions, 
  getAllDeadlines,
  createReminder 
} from '../../services/api';
import TaxHelperLogo from '../../assets/icons/logoTaxHelper.svg?react';
import NotificationActive from '../../assets/icons/NotificationActive.svg?react';
import NotificationInactive from '../../assets/icons/NotificationInactive.svg?react';
import UserIconSvg from '../../assets/icons/UserIcon.svg?react';
import SendMessage from '../../assets/icons/SendMessage.svg?react';
import ChartGrafic from '../../assets/icons/ChartGrafic.svg?react';

import {
  DashboardContainer,
  DashboardHeader,
  HeaderLeft,
  LogoText,
  HeaderRight,
  NotificationIcon,
  UserInfo,
  UserName,
  UserAvatar,
  MenuButton,
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
  CardsRow,
  DeadlinesCard,
  CardTitle,
  DeadlinesList,
  DeadlineItem,
  DeadlineName,
  DeadlineDate,
  AddReminderButton,
  ExpensesSummaryCard,
  ExpensesContent,
  DonutChartContainer,
  ExpensesLegend,
  LegendItem,
  LegendDot,
  ExpensesStats,
  ExpensesStat,
  AIChatCard,
  AIChatTitle,
  AIChatMessage,
  AIChatInputContainer,
  AIChatInput,
  AIChatSendButton,
  GenerateInvoiceButton,
} from './Dashboard.styles';

import AddReminderModal from './AddReminderModal';

// Donut Chart Component
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

// Format date for display
const formatDeadlineDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [deadlinesData, setDeadlinesData] = useState({ tax_deadlines: [], custom_reminders: [] });
  const [chatMessage, setChatMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);
  const [showAddReminder, setShowAddReminder] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileData, transactionsData, deadlines] = await Promise.all([
          getProfile(),
          getBankTransactions(100, 0).catch(() => []),
          getAllDeadlines(6, false).catch(() => ({ tax_deadlines: [], custom_reminders: [] })),
        ]);
        setProfile(profileData);
        setTransactions(transactionsData);
        setDeadlinesData(deadlines);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        if (error.response?.status === 401) {
          navigate('/');
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleAddReminder = async (reminderData) => {
    try {
      await createReminder(reminderData);
      // Refresh deadlines
      const deadlines = await getAllDeadlines(6, false);
      setDeadlinesData(deadlines);
      setShowAddReminder(false);
    } catch (error) {
      console.error('Failed to create reminder:', error);
    }
  };

  // Calculate expenses summary
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalExpenses = expenses;
  const avgDeduction = expenses * 0.21;

  // Get current quarter
  const currentQuarter = `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`;

  // Get user's first name
  const firstName = profile?.full_name?.split(' ')[0] || 'User';

  // Combine and sort all deadlines (tax + custom), take first 3
  const allDeadlines = [
    ...deadlinesData.tax_deadlines.map(d => ({
      name: d.name,
      date: d.due_date,
      daysUntil: d.days_until_due,
      isOverdue: d.is_overdue,
      type: 'tax'
    })),
    ...deadlinesData.custom_reminders.map(r => ({
      name: r.title,
      date: r.due_date,
      daysUntil: r.days_until_due,
      isOverdue: r.is_overdue,
      type: 'custom'
    }))
  ]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  // Get next IVA deadline for welcome message
  const nextIVADeadline = deadlinesData.tax_deadlines.find(d => 
    d.modelo === '303' && d.days_until_due >= 0
  );

  if (isLoading) {
    return (
      <DashboardContainer>
        <MainContent style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          Loading...
        </MainContent>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardHeader>
        <HeaderLeft onClick={() => navigate('/dashboard')}>
          <AnyIcon icon={TaxHelperLogo} size="48px" />
          <LogoText>TaxHelper</LogoText>
        </HeaderLeft>

        <HeaderRight>
          <NotificationIcon onClick={() => setHasNotifications(!hasNotifications)}>
            <AnyIcon icon={hasNotifications ? NotificationActive : NotificationInactive} size="24px" />
          </NotificationIcon>
          <UserInfo>
            <UserName>{firstName}</UserName>
            <UserAvatar>
              <AnyIcon icon={UserIconSvg} size="24px" />
            </UserAvatar>
          </UserInfo>
          <MenuButton onClick={() => setMenuOpen(!menuOpen)}>
            <span />
            <span />
            <span />
          </MenuButton>
        </HeaderRight>
      </DashboardHeader>

      <MainContent>
        <DashboardGrid>
          {/* Welcome Card */}
          <WelcomeCard>
            <WelcomeTitle>Welcome back, {firstName}!</WelcomeTitle>
            <WelcomeSubtitle>
              {nextIVADeadline ? (
                <>Your next IVA deadline: {formatDeadlineDate(nextIVADeadline.due_date)} ({nextIVADeadline.days_until_due} days left)</>
              ) : (
                <>No upcoming IVA deadlines</>
              )}
            </WelcomeSubtitle>
          </WelcomeCard>

          {/* Quick Stats Card */}
          <QuickStatsCard>
            <QuickStatsTitle>Quick Stat [{currentQuarter}] expenses</QuickStatsTitle>
            <QuickStatsContent>
              <QuickStatsAmount>€ {totalExpenses.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</QuickStatsAmount>
              <QuickStatsChart>
                <AnyIcon icon={ChartGrafic} size="80px" />
              </QuickStatsChart>
            </QuickStatsContent>
          </QuickStatsCard>

          {/* Cards Row */}
          <CardsRow>
            {/* Deadlines Card */}
            <DeadlinesCard>
              <CardTitle>Deadlines:</CardTitle>
              <DeadlinesList>
                {allDeadlines.length > 0 ? (
                  allDeadlines.map((deadline, index) => (
                    <DeadlineItem key={index} $isOverdue={deadline.isOverdue}>
                      <DeadlineName>{deadline.name}</DeadlineName>
                      <DeadlineDate>{formatDeadlineDate(deadline.date)}</DeadlineDate>
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

            {/* Expenses Summary Card */}
            <ExpensesSummaryCard>
              <CardTitle>Expenses Summary</CardTitle>
              <ExpensesContent>
                <DonutChartContainer>
                  <DonutChart expenses={expenses} income={income} />
                </DonutChartContainer>
                <ExpensesLegend>
                  <LegendItem>
                    <LegendDot $color="#679FD6" />
                    <span>{Math.round((expenses / (expenses + income || 1)) * 100)}%</span>
                  </LegendItem>
                  <LegendItem>
                    <LegendDot $color="#FCCA3A" />
                    <span>{Math.round((income / (expenses + income || 1)) * 100)}%</span>
                  </LegendItem>
                </ExpensesLegend>
              </ExpensesContent>
              <ExpensesStats>
                <ExpensesStat>
                  <span>Total:</span>
                  <span>€{totalExpenses.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                </ExpensesStat>
                <ExpensesStat>
                  <span>AVG deduction:</span>
                  <span>€{avgDeduction.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                </ExpensesStat>
              </ExpensesStats>
            </ExpensesSummaryCard>
          </CardsRow>

          {/* AI Chat Card */}
          <AIChatCard>
            <AIChatTitle>AI Tax Advisor Chat</AIChatTitle>
            <AIChatMessage>
              Bot: Hi {firstName}! Ask your question about taxes
            </AIChatMessage>
            <AIChatInputContainer>
              <AIChatInput
                type="text"
                placeholder="Type your message ..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
              />
              <AIChatSendButton>
                <AnyIcon icon={SendMessage} size="24px" />
              </AIChatSendButton>
            </AIChatInputContainer>
            <GenerateInvoiceButton>Generate invoice</GenerateInvoiceButton>
          </AIChatCard>
        </DashboardGrid>
      </MainContent>

      <Footer />

      {/* Add Reminder Modal */}
      <AddReminderModal
        isOpen={showAddReminder}
        onClose={() => setShowAddReminder(false)}
        onSubmit={handleAddReminder}
      />
    </DashboardContainer>
  );
};

export default Dashboard;