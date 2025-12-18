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
  RightColumn,
  AIChatCard,
  AIChatTitle,
  AIChatMessage,
  AIChatInputContainer,
  AIChatInput,
  AIChatSendButton,
  GenerateInvoiceButton,
} from './Dashboard.styles';

import AddReminderModal from '../AddReminderModal/AddReminderModal';

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

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [hasNotifications, setHasNotifications] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [allDeadlines, setAllDeadlines] = useState([]);
  const [showAddReminder, setShowAddReminder] = useState(false);
  
  const [expenses, setExpenses] = useState(0);
  const [income, setIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [avgDeduction, setAvgDeduction] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await getProfile();
        setUserData(profile);
        
        const deadlines = await getAllDeadlines();
        setAllDeadlines(deadlines);
        
        const transactions = await getBankTransactions();
        const exp = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        const inc = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        
        setExpenses(exp);
        setIncome(inc);
        setTotalExpenses(exp);
        setAvgDeduction(exp * 0.21);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    
    fetchData();
  }, []);

  const handleAddReminder = async (reminderData) => {
    try {
      await createReminder(reminderData);
      const deadlines = await getAllDeadlines();
      setAllDeadlines(deadlines);
    } catch (error) {
      console.error('Error adding reminder:', error);
    }
  };

  const formatDeadlineDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const firstName = userData?.full_name?.split(' ')[0] || 'User';

  return (
    <DashboardContainer>
      <DashboardHeader>
        <HeaderLeft onClick={() => navigate('/dashboard')}>
          <AnyIcon icon={TaxHelperLogo} size="40px" />
          <LogoText>TaxHelper</LogoText>
        </HeaderLeft>
        <HeaderRight>
          <NotificationIcon>
            <AnyIcon 
              icon={hasNotifications ? NotificationActive : NotificationInactive} 
              size="24px" 
            />
          </NotificationIcon>
          <UserInfo>
            <UserName>{userData?.full_name || 'Loading...'}</UserName>
            <UserAvatar>
              <AnyIcon icon={UserIconSvg} size="24px" />
            </UserAvatar>
          </UserInfo>
          <MenuButton>
            <span></span>
            <span></span>
            <span></span>
          </MenuButton>
        </HeaderRight>
      </DashboardHeader>

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
                €{(income - expenses).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </QuickStatsAmount>
              <QuickStatsChart>
                <AnyIcon icon={ChartGrafic} size="80px" />
              </QuickStatsChart>
            </QuickStatsContent>
          </QuickStatsCard>

          <CardsRow>
            <DeadlinesCard>
              <CardTitle>Upcoming Deadlines</CardTitle>
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

          <RightColumn>
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
            </AIChatCard>
            <GenerateInvoiceButton>Generate invoice</GenerateInvoiceButton>
          </RightColumn>
        </DashboardGrid>
      </MainContent>

      <Footer />

      <AddReminderModal
        isOpen={showAddReminder}
        onClose={() => setShowAddReminder(false)}
        onSubmit={handleAddReminder}
      />
    </DashboardContainer>
  );
};

export default Dashboard;