import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../Footer/Footer';
import { AnyIcon } from '../Shared/AnyIcon/AnyIcon';
import AppHeader from '../Shared/AppHeader';
import AddExpenseModal from '../AddExpenseModal/AddExpenseModal';
import DeleteConfirmModal from '../Shared/DeleteConfirmModal';
import { getProfile, uploadExpenses, getExpenses, deleteExpense } from '../../services/api';

import DataTable, { ActionIconButton } from '../Shared/DataTable/DataTable';
import Filters from '../Shared/Filters/Filters';
import SummaryCard from '../Shared/SummaryCard/SummaryCard';

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
  ExpensesListCard,
  ExpensesListTitle,
  FiltersCardStyled,
  SummaryCardStyled,
} from './Expenses.styles';

const EXPENSE_TYPE_OPTIONS = [
  { value: 'invoice', label: 'Invoice' },
  { value: 'receipt', label: 'Receipt' },
];

const Expenses = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState({ firstName: '', fullName: '' });
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [parsedFiles, setParsedFiles] = useState(0);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', type: '' });
  const [appliedFilters, setAppliedFilters] = useState({ dateFrom: '', dateTo: '', type: '' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, expense: null, expenseName: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [profileData, expensesData] = await Promise.all([getProfile(), getExpenses()]);
      const nameParts = (profileData.full_name || '').split(' ');
      setUser({ firstName: nameParts[0] || 'User', fullName: profileData.full_name || 'User' });
      setExpenses(expensesData.expenses || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  };
  const handleBrowseClick = () => fileInputRef.current?.click();
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    await processFiles(files);
  };

  const processFiles = async (files) => {
    if (files.length === 0) return;
    setIsUploading(true);
    try {
      await uploadExpenses(files);
      setParsedFiles((prev) => prev + files.length);
      await loadData();
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleApplyFilters = () => setAppliedFilters({ ...filters });
  const handleClearFilters = () => {
    const cleared = { dateFrom: '', dateTo: '', type: '' };
    setFilters(cleared);
    setAppliedFilters(cleared);
  };

  const handleDeleteClick = (expense) => {
    setDeleteModal({
      isOpen: true,
      expense,
      expenseName: `${formatAmount(expense.amount)} - ${formatDate(expense.date)}`,
    });
  };
  const handleDeleteModalClose = () => {
    setDeleteModal({ isOpen: false, expense: null, expenseName: '' });
  };
  const handleDeleteConfirm = async () => {
    if (!deleteModal.expense) return;
    setIsDeleting(true);
    try {
      await deleteExpense(deleteModal.expense.id);
      await loadData();
      handleDeleteModalClose();
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('Failed to delete expense.');
    } finally {
      setIsDeleting(false);
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
    await loadData();
    handleExpenseModalClose();
  };

  const handleGenerateInvoice = () => {
    navigate('/income');
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  const formatAmount = (amount) => `€${parseFloat(amount).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;

  const filteredExpenses = expenses.filter((expense) => {
    if (appliedFilters.type && expense.type?.toLowerCase() !== appliedFilters.type) return false;
    if (appliedFilters.dateFrom && new Date(expense.date) < new Date(appliedFilters.dateFrom)) return false;
    if (appliedFilters.dateTo && new Date(expense.date) > new Date(appliedFilters.dateTo)) return false;
    return true;
  });

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
  const expenseCount = filteredExpenses.length;
  const estimatedDeductible = totalExpenses * 0.21;

  const columns = [
    { key: 'date', label: 'Date', render: (val) => formatDate(val) },
    { key: 'amount', label: 'Amount', render: (val) => formatAmount(val) },
    { key: 'type', label: 'Type', render: (val) => val || 'Invoice' },
    { key: 'category', label: 'Category', render: (val) => val || 'Deduct.' },
  ];

  const summaryItems = [
    { label: 'Total Expenses', value: expenseCount },
    { label: 'Total Amount', value: formatAmount(totalExpenses), highlight: true },
    { label: 'Est. IVA Deductible', value: formatAmount(estimatedDeductible) },
  ];

  return (
    <ExpensesContainer>
      <AppHeader userName={user.fullName} />

      <MainContent>
        <ContentGrid>
          <WelcomeCard>
            <WelcomeTitle>Welcome back, {user.firstName || 'User'}!</WelcomeTitle>
            <WelcomeSubtitle>Track and manage your business expenses</WelcomeSubtitle>
            <WelcomeActions>
              <ActionBtn $primary onClick={() => setShowExpenseModal(true)}>Add new expense</ActionBtn>
              <ActionBtn onClick={handleGenerateInvoice}>Generate invoice</ActionBtn>
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
              <UploadText>Drop your expense receipts here</UploadText>
              <UploadSubtext>Invoices you received from suppliers (PDF/JPG max 10MB)</UploadSubtext>
            </UploadDropzone>
            <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" multiple onChange={handleFileSelect} style={{ display: 'none' }} />
            <BrowseButton onClick={handleBrowseClick} disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Browse Files'}
            </BrowseButton>
            <ParsedCount>Parsed [{parsedFiles}] files</ParsedCount>
          </UploadCard>

          <FiltersCardStyled>
            <Filters
              filters={filters}
              onChange={setFilters}
              onApply={handleApplyFilters}
              onClear={handleClearFilters}
              radioOptions={EXPENSE_TYPE_OPTIONS}
              radioName="expenseType"
              radioValue={filters.type}
              onRadioChange={(value) => setFilters({ ...filters, type: value })}
            />
          </FiltersCardStyled>

          <SummaryCardStyled>
            <SummaryCard title="Expenses Summary" items={summaryItems} />
          </SummaryCardStyled>

          <ExpensesListCard>
            <ExpensesListTitle>Expenses List</ExpensesListTitle>
            <DataTable
              columns={columns}
              data={filteredExpenses}
              loading={isLoading}
              loadingText="Loading expenses..."
              emptyText="No expenses found. Upload your first expense or add one manually!"
              renderActions={(expense) => (
                <>
                  <ActionIconButton onClick={() => handleDeleteClick(expense)}>
                    <AnyIcon icon={TrashIcon} size="20px" />
                  </ActionIconButton>
                  <ActionIconButton onClick={() => handleEditExpense(expense)}>
                    <AnyIcon icon={EditIcon} size="20px" />
                  </ActionIconButton>
                </>
              )}
            />
          </ExpensesListCard>
        </ContentGrid>
      </MainContent>

      <Footer />

      {showExpenseModal && (
        <AddExpenseModal
          isOpen={showExpenseModal}
          onClose={handleExpenseModalClose}
          onSubmit={handleExpenseSubmit}
          expense={editingExpense}
        />
      )}
      
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        title="Delete Expense"
        message="Are you sure you want to delete this expense?"
        itemName={deleteModal.expenseName}
        isDeleting={isDeleting}
      />
    </ExpensesContainer>
  );
};

export default Expenses;