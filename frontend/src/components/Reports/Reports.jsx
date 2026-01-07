import React, { useState, useEffect, useCallback } from 'react';
import Footer from '../Footer/Footer';
import { SubmitButton } from '../Shared/ActionButton/ActionButton';
import { AnyIcon } from '../Shared/AnyIcon/AnyIcon';
import { SuccessModal, ErrorModal } from '../Shared/ResultModal/ResultModal';
import AppHeader from '../Shared/AppHeader';

import DataTable, { ActionIconButton, StatusBadge } from '../Shared/DataTable/DataTable';
import Filters from '../Shared/Filters/Filters';

import DeleteIcon from '../../assets/icons/Delete.svg?react';
import DownloadIcon from '../../assets/icons/Download.svg?react';
import CheckIcon from '../../assets/icons/CheckIcon.svg?react';
import OpenAccordeonIcon from '../../assets/icons/OpenAccordeon.svg?react';
import AlertIcon from '../../assets/icons/AlertIcon.svg?react';
import FileIcon from '../../assets/icons/FileIcon.svg?react';
import ShieldIcon from '../../assets/icons/ShieldIcon.svg?react';

import {
  ReportsContainer,
  MainContent,
  ContentGrid,
  WelcomeCard,
  WelcomeTitle,
  WelcomeSubtitle,
  Card,
  CardTitle,
  WizardCard,
  WizardHeader,
  WizardTitle,
  WizardMeta,
  StepIndicator,
  StepList,
  StepItem,
  StepTitle,
  StepIcon,
  CalculationGrid,
  CalculationCard,
  CalculationLabel,
  CalculationValue,
  CalculationSubtext,
  CalculationTable,
  CalculationRow,
  CalculationCell,
  InfoBadge,
  ReportsListCard,
  FormGroup,
  Label,
  Select,
  ButtonGroup,
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
  QRCodeContainer,
  QRCodeImage,
  QRCodeLabel,
  VerifactuBadge,
  LoadingSpinner,
  LoadingContainer,
  FiltersCardStyled,
} from './Reports.styles';

const API_BASE = '/api/reports';

const REPORT_TYPES = [
  { value: 'IVA_Q1', label: 'IVA Q1 (Modelo 303)' },
  { value: 'IVA_Q2', label: 'IVA Q2 (Modelo 303)' },
  { value: 'IVA_Q3', label: 'IVA Q3 (Modelo 303)' },
  { value: 'IVA_Q4', label: 'IVA Q4 (Modelo 303)' },
  { value: 'IRPF_Q1', label: 'IRPF Q1 (Modelo 130)' },
  { value: 'IRPF_Q2', label: 'IRPF Q2 (Modelo 130)' },
  { value: 'IRPF_Q3', label: 'IRPF Q3 (Modelo 130)' },
  { value: 'IRPF_Q4', label: 'IRPF Q4 (Modelo 130)' },
  { value: 'ANNUAL', label: 'Annual Summary (Modelo 390)' },
];

const PERIODS = [
  { value: 'Q1_2024', label: 'Q1 2024' },
  { value: 'Q2_2024', label: 'Q2 2024' },
  { value: 'Q3_2024', label: 'Q3 2024' },
  { value: 'Q4_2024', label: 'Q4 2024' },
  { value: 'Q1_2025', label: 'Q1 2025' },
];

const REPORT_TYPE_OPTIONS = [
  { key: 'showIVA', label: 'IVA' },
  { key: 'showIRPF', label: 'IRPF' },
];

const reportsApi = {
  list: async (filters) => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    if (filters.dateFrom) params.append('date_from', filters.dateFrom);
    if (filters.dateTo) params.append('date_to', filters.dateTo);
    if (filters.showIVA) params.append('show_iva', 'true');
    if (filters.showIRPF) params.append('show_irpf', 'true');
    const res = await fetch(`${API_BASE}?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
  wizardStep1: async (data) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/wizard/step1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create report');
    return res.json();
  },
  wizardStep2: async (data) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/wizard/step2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to calculate');
    return res.json();
  },
  wizardStep3: async (data) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/wizard/step3`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to preview');
    return res.json();
  },
  submit: async (data) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit');
    return res.json();
  },
  download: async (reportId) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/download/${reportId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to download');
    return res.json();
  },
  delete: async (reportId) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/${reportId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
};

const formatCurrency = (val) => {
  const num = parseFloat(val) || 0;
  return `€ ${num.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const ReportsHistory = ({ reports, onDelete, onDownload, loading }) => {
  const columns = [
    { key: 'deadline', label: 'Deadline', render: (val) => formatDate(val) },
    { key: 'submit_date', label: 'Submit date', render: (val) => formatDate(val) },
    { key: 'report_type', label: 'Type', render: (val) => val?.replace('_', ' ') || '' },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge $status={val}>{val}</StatusBadge> },
  ];

  return (
    <ReportsListCard>
      <CardTitle>Reports History</CardTitle>
      <DataTable
        columns={columns}
        data={reports}
        loading={loading}
        loadingText="Loading reports..."
        emptyText="No reports yet. Generate your first report!"
        renderActions={(report) => (
          <>
            <ActionIconButton onClick={() => onDelete(report.id)} title="Delete">
              <AnyIcon icon={DeleteIcon} size="20px" />
            </ActionIconButton>
            <ActionIconButton onClick={() => onDownload(report.id)} title="Download">
              <AnyIcon icon={DownloadIcon} size="20px" />
            </ActionIconButton>
          </>
        )}
      />
    </ReportsListCard>
  );
};

const WizardStep1 = ({ data, onChange, onNext, loading }) => (
  <>
    <FormGroup>
      <Label>Report Type</Label>
      <Select value={data.reportType || ''} onChange={(e) => onChange({ ...data, reportType: e.target.value })}>
        <option value="">Select report type</option>
        {REPORT_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
      </Select>
    </FormGroup>
    <FormGroup>
      <Label>Period</Label>
      <Select value={data.period || ''} onChange={(e) => onChange({ ...data, period: e.target.value })}>
        <option value="">Select Period</option>
        {PERIODS.map((period) => <option key={period.value} value={period.value}>{period.label}</option>)}
      </Select>
    </FormGroup>
    <ButtonGroup>
      <PrimaryButton onClick={onNext} disabled={!data.reportType || !data.period || loading}>
        {loading ? <LoadingSpinner /> : 'Next Step'}
      </PrimaryButton>
    </ButtonGroup>
  </>
);

const WizardStep2 = ({ calculation, legalRef, onBack, onNext, loading }) => (
  <>
    <CalculationTable>
      <CalculationRow>
        <CalculationCell $label>Income</CalculationCell>
        <CalculationCell $value>{formatCurrency(calculation.income)}</CalculationCell>
        <CalculationCell $label>VAT 21%</CalculationCell>
        <CalculationCell $value>{formatCurrency(calculation.vat_collected)}</CalculationCell>
      </CalculationRow>
      <CalculationRow>
        <CalculationCell $label>Expenses</CalculationCell>
        <CalculationCell $value>{formatCurrency(calculation.expenses)}</CalculationCell>
        <CalculationCell $label>Deduct</CalculationCell>
        <CalculationCell $value>{formatCurrency(calculation.vat_deductible)}</CalculationCell>
      </CalculationRow>
      <CalculationRow>
        <CalculationCell $label>Taxable</CalculationCell>
        <CalculationCell $value>{formatCurrency(calculation.taxable_base)}</CalculationCell>
        <CalculationCell $label>Rate</CalculationCell>
        <CalculationCell $value>{((calculation.irpf_rate || 0.19) * 100).toFixed(0)}%</CalculationCell>
      </CalculationRow>
      <CalculationRow>
        <CalculationCell $label>Owed/Refund</CalculationCell>
        <CalculationCell $value>{formatCurrency(calculation.total_tax_due)}</CalculationCell>
        <CalculationCell colSpan={2}>
          <InfoBadge><AnyIcon icon={AlertIcon} size="14px" />Why this rate? - {legalRef}</InfoBadge>
        </CalculationCell>
      </CalculationRow>
    </CalculationTable>
    <ButtonGroup $spaceBetween>
      <SecondaryButton onClick={onBack}>Back</SecondaryButton>
      <PrimaryButton onClick={onNext} disabled={loading}>{loading ? <LoadingSpinner /> : 'Next Step'}</PrimaryButton>
    </ButtonGroup>
  </>
);

const WizardStep3 = ({ preview, calculation, onBack, onSubmit, loading }) => {
  const calc = preview?.calculation || calculation || {};
  return (
    <>
      <CalculationGrid>
        <CalculationCard $highlight>
          <CalculationLabel>Income</CalculationLabel>
          <CalculationValue>{formatCurrency(calc.income)}</CalculationValue>
        </CalculationCard>
        <CalculationCard>
          <CalculationLabel>Expenses</CalculationLabel>
          <CalculationValue>{formatCurrency(calc.expenses)}</CalculationValue>
          <CalculationSubtext>VAT 21%: {formatCurrency(calc.vat_collected)}</CalculationSubtext>
        </CalculationCard>
        <CalculationCard>
          <CalculationLabel>Deductions</CalculationLabel>
          <CalculationValue>{formatCurrency(calc.vat_deductible)}</CalculationValue>
          <CalculationSubtext style={{ color: '#02B0C2', cursor: 'pointer' }}>Why?</CalculationSubtext>
        </CalculationCard>
        <CalculationCard>
          <OutlineButton><AnyIcon icon={FileIcon} size="16px" /> Review PDF</OutlineButton>
        </CalculationCard>
      </CalculationGrid>
      {preview?.qr_code_base64 && (
        <QRCodeContainer>
          <QRCodeImage src={`data:image/png;base64,${preview.qr_code_base64}`} alt="VerifactU QR Code" />
          <VerifactuBadge><AnyIcon icon={ShieldIcon} size="14px" />VERI*FACTU Compliant</VerifactuBadge>
          <QRCodeLabel>Factura verificable en la sede electrónica de la AEAT</QRCodeLabel>
        </QRCodeContainer>
      )}
      <ButtonGroup $spaceBetween>
        <SecondaryButton onClick={onBack}>Back</SecondaryButton>
        <PrimaryButton onClick={onSubmit} disabled={loading}>{loading ? <LoadingSpinner /> : 'Submit to Hacienda'}</PrimaryButton>
      </ButtonGroup>
    </>
  );
};

const ReportWizard = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [stepData, setStepData] = useState({});
  const [reportId, setReportId] = useState(null);
  const [calculation, setCalculation] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleStep1Next = async () => {
    setLoading(true);
    try {
      const result = await reportsApi.wizardStep1({ report_type: stepData.reportType, period: stepData.period });
      setReportId(result.report_id);
      const calcResult = await reportsApi.wizardStep2({ report_id: result.report_id, confirm_calculation: true });
      setCalculation(calcResult);
      setStep(2);
    } catch (err) {
      alert('Failed to create report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Next = async () => {
    setLoading(true);
    try {
      const result = await reportsApi.wizardStep3({ report_id: reportId, review_confirmed: true });
      setPreview(result);
      setStep(3);
    } catch (err) {
      alert('Failed to generate preview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await reportsApi.submit({ report_id: reportId });
      setSubmissionResult(result);
      setShowSuccessModal(true);
      onComplete?.();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit report to AEAT.');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setStepData({});
    setReportId(null);
    setCalculation(null);
    setPreview(null);
    setSubmissionResult(null);
    onClose();
  };

  if (!isOpen) return null;

  const stepTitles = [
    { num: 1, title: 'Select Period' },
    { num: 2, title: 'Review calculation' },
    { num: 3, title: 'Report Preview' },
    { num: 4, title: 'Final summary' },
  ];

  return (
    <>
      <SuccessModal isOpen={showSuccessModal} onClose={() => { setShowSuccessModal(false); handleClose(); }} title="Success" message="Your report has been successfully submitted to AEAT." csvCode={submissionResult?.csv_code} />
      <ErrorModal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} title="Error" message={errorMessage} />
      <WizardCard>
        <WizardHeader>
          <div>
            <WizardTitle>Report Overview</WizardTitle>
            {stepData.reportType && stepData.period && (
              <p style={{ margin: '0.5rem 0 0', opacity: 0.7 }}>{stepData.reportType.replace('_', ' ')} - {stepData.period.replace('_', ' ')}</p>
            )}
          </div>
          <WizardMeta>
            <StepIndicator>Step {step} of 4</StepIndicator>
            <StatusBadge $status={preview?.status || 'Draft'}>[{preview?.status || 'Draft'}]</StatusBadge>
          </WizardMeta>
        </WizardHeader>
        <StepList>
          {stepTitles.map((s) => (
            <StepItem key={s.num} $active={step === s.num} $clickable={s.num < step} onClick={() => s.num < step && setStep(s.num)}>
              <StepTitle $active={step === s.num}>Step {s.num}: {s.title}</StepTitle>
              <StepIcon $completed={s.num < step}>
                {s.num < step ? <AnyIcon icon={CheckIcon} size="20px" /> : <AnyIcon icon={OpenAccordeonIcon} size="20px" />}
              </StepIcon>
            </StepItem>
          ))}
        </StepList>
        <div style={{ marginTop: '1.5rem' }}>
          {step === 1 && <WizardStep1 data={stepData} onChange={setStepData} onNext={handleStep1Next} loading={loading} />}
          {step === 2 && calculation && <WizardStep2 calculation={calculation} legalRef="Art. 29 LIVA deduction" onBack={() => setStep(1)} onNext={handleStep2Next} loading={loading} />}
          {step === 3 && <WizardStep3 preview={preview} calculation={calculation} onBack={() => setStep(2)} onSubmit={handleSubmit} loading={loading} />}
        </div>
      </WizardCard>
    </>
  );
};

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', showIVA: false, showIRPF: false });
  const [wizardOpen, setWizardOpen] = useState(false);
  const [userName, setUserName] = useState('User');

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reportsApi.list(filters);
      setReports(data.reports || []);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReports();
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserName(payload.full_name || payload.sub || 'User');
      } catch (e) {}
    }
  }, [fetchReports]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await reportsApi.delete(id);
        fetchReports();
      } catch (err) {
        alert('Failed to delete report');
      }
    }
  };

  const handleDownload = async (id) => {
    try {
      const data = await reportsApi.download(id);
      alert(`Report ready for download. CSV: ${data.verifactu_hash?.substring(0, 12) || 'N/A'}`);
    } catch (err) {
      alert('Failed to download report');
    }
  };

  const handleClearFilters = () => {
    setFilters({ dateFrom: '', dateTo: '', showIVA: false, showIRPF: false });
  };

  return (
    <ReportsContainer>
      <AppHeader />
      <MainContent>
        <ContentGrid>
          <WelcomeCard>
            <WelcomeTitle>Welcome back, {userName}!</WelcomeTitle>
            <WelcomeSubtitle>Have you already submitted all income and expenses?</WelcomeSubtitle>
            {!wizardOpen && (
              <SubmitButton onClick={() => setWizardOpen(true)} padding="0.75rem 1.5rem">Generate report</SubmitButton>
            )}
          </WelcomeCard>

          {wizardOpen && <ReportWizard isOpen={wizardOpen} onClose={() => setWizardOpen(false)} onComplete={fetchReports} />}

          <ReportsHistory reports={reports} onDelete={handleDelete} onDownload={handleDownload} loading={loading} />

          <FiltersCardStyled>
            <Filters
              filters={filters}
              onChange={setFilters}
              onApply={fetchReports}
              onClear={handleClearFilters}
              showDateRange={true}
              checkboxOptions={REPORT_TYPE_OPTIONS}
            />
          </FiltersCardStyled>
        </ContentGrid>
      </MainContent>
      <Footer />
    </ReportsContainer>
  );
};

export default Reports;