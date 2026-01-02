import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../Footer/Footer';
import { AnyIcon } from '../Shared/AnyIcon/AnyIcon';
import AppHeader from '../Shared/AppHeader';
import GenerateInvoiceModal from '../GenerateInvoiceModal/GenerateInvoiceModal';
import AddExpenseModal from '../AddExpenseModal/AddExpenseModal';
import { getProfile, getInvoices, deleteInvoice, downloadInvoicePdf, uploadIncome } from '../../services/api';

import UploadIcon from '../../assets/icons/UploadInvoice.svg?react';
import TrashIcon from '../../assets/icons/Delete.svg?react';
import DownloadIcon from '../../assets/icons/Download.svg?react';

import {
  IncomeContainer,
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
  FilterButtonRow,
  ClearButton,
  ApplyButtonStyled,
  IncomeListCard,
  IncomeListTitle,
  SummaryCard,
  SummaryTitle,
  SummaryItem,
  SummaryLabel,
  SummaryValue,
  DataTable,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  StatusBadge,
  ActionIconsWrapper,
  ActionIconButton,
  EmptyState,
  LoadingSpinner,
} from './Income.styles';

const Income = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState({ firstName: '', fullName: '' });
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isDragging, setIsDragging] = useState(false);
  const [parsedFiles, setParsedFiles] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const profile = await getProfile();
      const [firstName = ''] = (profile.full_name || '').split(' ');
      setUser({ firstName, fullName: profile.full_name || '' });

      const invoicesData = await getInvoices();
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
      const results = await uploadIncome(validFiles);
      setParsedFiles((prev) => prev + results.length);
      
      const updatedInvoices = await getInvoices();
      setInvoices(updatedInvoices);
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
    setFilters({ dateFrom: '', dateTo: '' });
    setAppliedFilters({ dateFrom: '', dateTo: '' });
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    
    try {
      await deleteInvoice(invoiceId);
      setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
    } catch (error) {
      console.error('Failed to delete invoice:', error);
      alert('Failed to delete invoice. Please try again.');
    }
  };

  const handleDownloadPdf = async (invoiceId) => {
    try {
      await downloadInvoicePdf(invoiceId);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const handleInvoiceCreated = async () => {
    await loadData();
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatAmount = (amount) => {
    return `€${parseFloat(amount).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;
  };

  const filteredInvoices = invoices.filter((invoice) => {
    if (appliedFilters.dateFrom && new Date(invoice.invoice_date) < new Date(appliedFilters.dateFrom)) return false;
    if (appliedFilters.dateTo && new Date(invoice.invoice_date) > new Date(appliedFilters.dateTo)) return false;
    return true;
  });

  const totalIncome = filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
  const invoiceCount = filteredInvoices.length;
  const estimatedIVA = totalIncome * 0.21;

  return (
    <IncomeContainer>
      <AppHeader userName={user.fullName} />

      <MainContent>
        <ContentGrid>
          <WelcomeCard>
            <WelcomeTitle>Welcome back, {user.firstName || 'User'}!</WelcomeTitle>
            <WelcomeSubtitle>
              Manage your invoices and track your income
            </WelcomeSubtitle>
            <WelcomeActions>
              <ActionBtn $primary onClick={() => setShowInvoiceModal(true)}>
                Generate invoice
              </ActionBtn>
              <ActionBtn onClick={() => setShowExpenseModal(true)}>
                Add expense
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
                Drop your income invoices here
              </UploadText>
              <UploadSubtext>
                Invoices you issued to clients (PDF/JPG max 10MB)
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

          <IncomeListCard>
            <IncomeListTitle>Income List</IncomeListTitle>
            
            {isLoading ? (
              <LoadingSpinner>Loading invoices...</LoadingSpinner>
            ) : filteredInvoices.length === 0 ? (
              <EmptyState>No invoices found. Create your first invoice or upload existing ones!</EmptyState>
            ) : (
              <DataTable>
                <TableHead>
                  <tr>
                    <TableHeaderCell>Invoice #</TableHeaderCell>
                    <TableHeaderCell>Date</TableHeaderCell>
                    <TableHeaderCell>Client</TableHeaderCell>
                    <TableHeaderCell>Amount</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </tr>
                </TableHead>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.invoice_number}</TableCell>
                      <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                      <TableCell>{invoice.client_name}</TableCell>
                      <TableCell>{formatAmount(invoice.total)}</TableCell>
                      <TableCell>
                        <StatusBadge $status={invoice.status}>
                          {invoice.status || 'Created'}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        <ActionIconsWrapper>
                          <ActionIconButton 
                            onClick={() => handleDownloadPdf(invoice.id)}
                            title="Download PDF"
                          >
                            <AnyIcon icon={DownloadIcon} size="20px" />
                          </ActionIconButton>
                          <ActionIconButton 
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            title="Delete invoice"
                          >
                            <AnyIcon icon={TrashIcon} size="20px" />
                          </ActionIconButton>
                        </ActionIconsWrapper>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </DataTable>
            )}
          </IncomeListCard>

          <FiltersCard>
            <FiltersTitle>Filters</FiltersTitle>
            
            <FilterSection>
              <FilterLabel>Date Range</FilterLabel>
              <DateInputRow>
                <DateInput
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  placeholder="From"
                />
                <DateInput
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  placeholder="To"
                />
              </DateInputRow>
            </FilterSection>

            <FilterButtonRow>
              <ClearButton onClick={handleClearFilters}>Clear</ClearButton>
              <ApplyButtonStyled onClick={handleApplyFilters}>Apply</ApplyButtonStyled>
            </FilterButtonRow>
          </FiltersCard>

          <SummaryCard>
            <SummaryTitle>Income Summary</SummaryTitle>
            <SummaryItem>
              <SummaryLabel>Total Invoices</SummaryLabel>
              <SummaryValue>{invoiceCount}</SummaryValue>
            </SummaryItem>
            <SummaryItem>
              <SummaryLabel>Total Income</SummaryLabel>
              <SummaryValue $highlight>{formatAmount(totalIncome)}</SummaryValue>
            </SummaryItem>
            <SummaryItem>
              <SummaryLabel>Est. IVA (21%)</SummaryLabel>
              <SummaryValue>{formatAmount(estimatedIVA)}</SummaryValue>
            </SummaryItem>
          </SummaryCard>
        </ContentGrid>
      </MainContent>

      <Footer />

      <GenerateInvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        onSubmit={handleInvoiceCreated}
      />

      {showExpenseModal && (
        <AddExpenseModal
          isOpen={showExpenseModal}
          onClose={() => setShowExpenseModal(false)}
        />
      )}
    </IncomeContainer>
  );
};

export default Income;