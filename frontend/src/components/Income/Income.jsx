import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../Footer/Footer';
import { AnyIcon } from '../Shared/AnyIcon/AnyIcon';
import AppHeader from '../Shared/AppHeader';
import GenerateInvoiceModal from '../GenerateInvoiceModal/GenerateInvoiceModal';
import DeleteConfirmModal from '../Shared/DeleteConfirmModal';
import { getProfile, getInvoices, deleteInvoice, downloadInvoicePdf, uploadIncome } from '../../services/api';

import DataTable, { ActionIconButton, StatusBadge } from '../Shared/DataTable/DataTable';
import Filters from '../Shared/Filters/Filters';
import SummaryCard from '../Shared/SummaryCard/SummaryCard';

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
  IncomeListCard,
  IncomeListTitle,
  FiltersCardStyled,
  SummaryCardStyled,
} from './Income.styles';

const Income = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState({ firstName: '', fullName: '' });
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [parsedFiles, setParsedFiles] = useState(0);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '' });
  const [appliedFilters, setAppliedFilters] = useState({ dateFrom: '', dateTo: '' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, invoiceId: null, invoiceName: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
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
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDragOver = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setIsDragging(false); }, []);
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

  const handleBrowseClick = () => fileInputRef.current?.click();

  const handleApplyFilters = () => setAppliedFilters({ ...filters });
  const handleClearFilters = () => {
    const cleared = { dateFrom: '', dateTo: '' };
    setFilters(cleared);
    setAppliedFilters(cleared);
  };

  const handleDeleteClick = (invoice) => {
    setDeleteModal({
      isOpen: true,
      invoiceId: invoice.id,
      invoiceName: `#${invoice.invoice_number} - ${invoice.client_name}`,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.invoiceId) return;
    setIsDeleting(true);
    try {
      await deleteInvoice(deleteModal.invoiceId);
      setInvoices((prev) => prev.filter((inv) => inv.id !== deleteModal.invoiceId));
      setDeleteModal({ isOpen: false, invoiceId: null, invoiceName: '' });
    } catch (error) {
      console.error('Failed to delete invoice:', error);
      alert('Failed to delete invoice');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteModalClose = () => {
    if (!isDeleting) {
      setDeleteModal({ isOpen: false, invoiceId: null, invoiceName: '' });
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

  const handleAddExpense = () => {
    navigate('/expenses');
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  const formatAmount = (amount) => `€${parseFloat(amount).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;

  const filteredInvoices = invoices.filter((invoice) => {
    if (appliedFilters.dateFrom && new Date(invoice.invoice_date) < new Date(appliedFilters.dateFrom)) return false;
    if (appliedFilters.dateTo && new Date(invoice.invoice_date) > new Date(appliedFilters.dateTo)) return false;
    return true;
  });

  const totalIncome = filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
  const invoiceCount = filteredInvoices.length;
  const estimatedIVA = totalIncome * 0.21;

  const columns = [
    { key: 'invoice_number', label: 'Invoice #' },
    { key: 'invoice_date', label: 'Date', render: (val) => formatDate(val) },
    { key: 'client_name', label: 'Client' },
    { key: 'total', label: 'Amount', render: (val) => formatAmount(val) },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge $status={val}>{val || 'Created'}</StatusBadge> },
  ];

  const summaryItems = [
    { label: 'Total Invoices', value: invoiceCount },
    { label: 'Total Income', value: formatAmount(totalIncome), highlight: true },
    { label: 'Est. IVA (21%)', value: formatAmount(estimatedIVA) },
  ];

  return (
    <IncomeContainer>
      <AppHeader userName={user.fullName} />

      <MainContent>
        <ContentGrid>
          <WelcomeCard>
            <WelcomeTitle>Welcome back, {user.firstName || 'User'}!</WelcomeTitle>
            <WelcomeSubtitle>Manage your invoices and track your income</WelcomeSubtitle>
            <WelcomeActions>
              <ActionBtn $primary onClick={() => setShowInvoiceModal(true)}>Generate invoice</ActionBtn>
              <ActionBtn onClick={handleAddExpense}>Add expense</ActionBtn>
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
              <UploadText>Drop your income invoices here</UploadText>
              <UploadSubtext>Invoices you issued to clients (PDF/JPG max 10MB)</UploadSubtext>
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
              showDateRange={true}
            />
          </FiltersCardStyled>

          <SummaryCardStyled>
            <SummaryCard title="Income Summary" items={summaryItems} />
          </SummaryCardStyled>

          <IncomeListCard>
            <IncomeListTitle>Income List</IncomeListTitle>
            <DataTable
              columns={columns}
              data={filteredInvoices}
              loading={isLoading}
              loadingText="Loading invoices..."
              emptyText="No invoices found. Create your first invoice or upload existing ones!"
              renderActions={(invoice) => (
                <>
                  <ActionIconButton onClick={() => handleDownloadPdf(invoice.id)} title="Download PDF">
                    <AnyIcon icon={DownloadIcon} size="20px" />
                  </ActionIconButton>
                  <ActionIconButton onClick={() => handleDeleteClick(invoice)}>
                    <AnyIcon icon={TrashIcon} size="20px" />
                  </ActionIconButton>
                </>
              )}
            />
          </IncomeListCard>
        </ContentGrid>
      </MainContent>

      <Footer />

      <GenerateInvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        onSubmit={handleInvoiceCreated}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice?"
        itemName={deleteModal.invoiceName}
        isDeleting={isDeleting}
      />
    </IncomeContainer>
  );
};

export default Income;