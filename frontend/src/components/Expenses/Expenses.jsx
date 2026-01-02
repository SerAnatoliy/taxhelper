import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../Footer/Footer';
import { AnyIcon } from '../Shared/AnyIcon/AnyIcon';
import AppHeader from '../Shared/AppHeader';
import GenerateInvoiceModal from '../GenerateInvoiceModal/GenerateInvoiceModal';
import AddExpenseModal from '../AddExpenseModal/AddExpenseModal';
import { getProfile, uploadExpenses, getExpenses, deleteExpense } from '../../services/api';

import UploadIcon from '../../assets/icons/UploadInvoice.svg?react';
import TrashIcon from '../../assets/icons/Delete.svg?react';
import EditIcon from '../../assets/icons/Edit.svg?react';

import {
  ExpensesContainer,
  MainContent,
  ContentGrid,
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
  FiltersCard,
  FiltersTitle,
  FilterSection,
  FilterLabel,
  DateInputRow,
  DateInput,
  TypeFilterRow,
  RadioLabel,
  RadioInput,
  FilterButtonRow,
  ClearButton,
  ApplyButtonStyled,
  ExpensesListCard,
  ExpensesListTitle,
  ExpensesTable,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  ActionIconsWrapper,
  ActionIconButton,
  EmptyState,
  LoadingSpinner,
} from './Expenses.styles';

const Expenses = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState({ firstName: '', fullName: '' });

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [isDragging, setIsDragging] = useState(false);
  const [parsedFiles, setParsedFiles] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextDeadline, setNextDeadline] = useState({ date: 'Month dd', daysLeft: 'dd' });

  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    type: '', 
  });
  const [appliedFilters, setAppliedFilters] = useState({
    dateFrom: '',
    dateTo: '',
    type: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const profile = await getProfile();
        const [firstName = ''] = (profile.full_name || '').split(' ');
        setUser({ firstName, fullName: profile.full_name || '' });

        const expensesData = await getExpenses();
        setExpenses(expensesData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    await handleFilesUpload(files);
  }, []);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    await handleFilesUpload(files);
  };

  const handleFilesUpload = async (files) => {
    if (files.length === 0) return;

    const validFiles = files.filter((file) => {
      const type = file.type.toLowerCase();
      return type === 'application/pdf' || type.startsWith('image/');
    });

    if (validFiles.length === 0) {
      alert('Please upload PDF or image files only (max 10MB)');
      return;
    }

    setIsUploading(true);
    try {
      const results = await uploadExpenses(validFiles);
      setParsedFiles((prev) => prev + results.length);
      
      const updatedExpenses = await getExpenses();
      setExpenses(updatedExpenses);
    } catch (error) {
      console.error('Upload failed:', error);
      alert(error.response?.data?.detail || 'Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
  };

  const handleClearFilters = () => {
    const clearedFilters = { dateFrom: '', dateTo: '', type: '' };
    setFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      await deleteExpense(expenseId);
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    } catch (error) {
      console.error('Failed to delete expense:', error);
      alert('Failed to delete expense');
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowExpenseModal(true);
  };

  const handleExpenseModalClose = () => {
    setShowExpenseModal(false);
    setEditingExpense(null);
  };

  const handleExpenseSubmit = async () => {
    const updatedExpenses = await getExpenses();
    setExpenses(updatedExpenses);
    handleExpenseModalClose();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-GB');
  };

  const formatAmount = (amount) => {
    return `€${parseFloat(amount || 0).toFixed(2).replace('.', ',')}`;
  };

  const filteredExpenses = expenses.filter((expense) => {
    if (appliedFilters.type && expense.type?.toLowerCase() !== appliedFilters.type) return false;
    if (appliedFilters.dateFrom && new Date(expense.date) < new Date(appliedFilters.dateFrom)) return false;
    if (appliedFilters.dateTo && new Date(expense.date) > new Date(appliedFilters.dateTo)) return false;
    return true;
  });

  return (
    <ExpensesContainer>
      <AppHeader userName={user.fullName} />

      <MainContent>
        <ContentGrid>
          <WelcomeCard>
            <WelcomeTitle>Welcome back, {user.firstName || 'User'}!</WelcomeTitle>
            <WelcomeSubtitle>
              Track and manage your business expenses
            </WelcomeSubtitle>
            <WelcomeActions>
              <ActionBtn $primary onClick={() => setShowExpenseModal(true)}>
                Add new expense
              </ActionBtn>
              <ActionBtn onClick={() => setShowInvoiceModal(true)}>
                Generate invoice
              </ActionBtn>
            </WelcomeActions>
          </WelcomeCard>

          <UploadCard>
            <UploadDropzone
              $isDragging={isDragging}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleBrowseClick}
            >
              <UploadIconWrapper>
                <AnyIcon icon={UploadIcon} size="64px" />
              </UploadIconWrapper>
              <UploadText>
                Drop your expense receipts here
              </UploadText>
              <UploadSubtext>
                Invoices you received from suppliers (PDF/JPG max 10MB)
              </UploadSubtext>
            </UploadDropzone>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            
            <BrowseButton onClick={handleBrowseClick} disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Browse Files'}
            </BrowseButton>
            
            <ParsedCount>Parsed [{parsedFiles}] files</ParsedCount>
          </UploadCard>

          <FiltersCard>
            <FiltersTitle>Filters</FiltersTitle>
            
            <FilterSection>
              <FilterLabel>Date Range</FilterLabel>
              <DateInputRow>
                <DateInput
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
                <DateInput
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </DateInputRow>
            </FilterSection>

            <FilterSection>
              <FilterLabel>Type</FilterLabel>
              <TypeFilterRow>
                <RadioLabel>
                  Invoice
                  <RadioInput
                    type="radio"
                    name="expenseType"
                    checked={filters.type === 'invoice'}
                    onChange={() => handleFilterChange('type', 'invoice')}
                  />
                </RadioLabel>
                <RadioLabel>
                  Receipt
                  <RadioInput
                    type="radio"
                    name="expenseType"
                    checked={filters.type === 'receipt'}
                    onChange={() => handleFilterChange('type', 'receipt')}
                  />
                </RadioLabel>
              </TypeFilterRow>
            </FilterSection>

            <FilterButtonRow>
              <ClearButton onClick={handleClearFilters}>Clear</ClearButton>
              <ApplyButtonStyled onClick={handleApplyFilters}>Apply</ApplyButtonStyled>
            </FilterButtonRow>
          </FiltersCard>

          <ExpensesListCard>
            <ExpensesListTitle>Expenses List</ExpensesListTitle>
            
            {isLoading ? (
              <LoadingSpinner>Loading expenses...</LoadingSpinner>
            ) : filteredExpenses.length === 0 ? (
              <EmptyState>No expenses found. Upload your first expense or add one manually!</EmptyState>
            ) : (
              <ExpensesTable>
                <TableHead>
                  <tr>
                    <TableHeaderCell>Date</TableHeaderCell>
                    <TableHeaderCell>Amount</TableHeaderCell>
                    <TableHeaderCell>Type</TableHeaderCell>
                    <TableHeaderCell>Category</TableHeaderCell>
                    <TableHeaderCell>Action</TableHeaderCell>
                  </tr>
                </TableHead>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{formatDate(expense.date)}</TableCell>
                      <TableCell>{formatAmount(expense.amount)}</TableCell>
                      <TableCell>{expense.type || 'Invoice'}</TableCell>
                      <TableCell>{expense.category || 'Deduct.'}</TableCell>
                      <TableCell>
                        <ActionIconsWrapper>
                          <ActionIconButton onClick={() => handleDeleteExpense(expense.id)}>
                            <AnyIcon icon={TrashIcon} size="20px" />
                          </ActionIconButton>
                          <ActionIconButton onClick={() => handleEditExpense(expense)}>
                            <AnyIcon icon={EditIcon} size="20px" />
                          </ActionIconButton>
                        </ActionIconsWrapper>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </ExpensesTable>
            )}
          </ExpensesListCard>
        </ContentGrid>
      </MainContent>

      <Footer />

      <GenerateInvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
      />

      {showExpenseModal && (
        <AddExpenseModal
          isOpen={showExpenseModal}
          onClose={handleExpenseModalClose}
          onSubmit={handleExpenseSubmit}
          expense={editingExpense}
        />
      )}
    </ExpensesContainer>
  );
};

export default Expenses;