import React, { useState, useEffect, useCallback } from 'react';
import Footer from '../Footer/Footer';
import { SubmitButton } from '../Shared/ActionButton/ActionButton';
import { AnyIcon } from '../Shared/AnyIcon/AnyIcon';
import { SuccessModal, ErrorModal } from '../Shared/ResultModal/ResultModal';

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
  StatusBadge,
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
  ReportsTable,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  ActionIconsWrapper,
  ActionIconButton,
  EmptyState,
  FiltersCard,
  FiltersTitle,
  FilterGroup,
  FilterLabel,
  DateInputGroup,
  DateInput,
  CheckboxGroup,
  CheckboxLabel,
  Checkbox,
  FormGroup,
  Label,
  Select,
  ButtonGroup,
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
  ApplyButton,
  QRCodeContainer,
  QRCodeImage,
  QRCodeLabel,
  VerifactuBadge,
  LoadingSpinner,
  LoadingContainer,
  SuccessContainer,
} from './Reports.styles';
import AppHeader from '../Shared/AppHeader';

const REPORT_TYPES = [
  { value: 'IVA_Q1', label: 'IVA Q1 (Modelo 303)' },
  { value: 'IVA_Q2', label: 'IVA Q2 (Modelo 303)' },
  { value: 'IVA_Q3', label: 'IVA Q3 (Modelo 303)' },
  { value: 'IVA_Q4', label: 'IVA Q4 (Modelo 303)' },
  { value: 'IVA_ANNUAL', label: 'IVA Annual (Modelo 390)' },
  { value: 'IRPF_Q1', label: 'IRPF Q1 (Modelo 130)' },
  { value: 'IRPF_Q2', label: 'IRPF Q2 (Modelo 130)' },
  { value: 'IRPF_Q3', label: 'IRPF Q3 (Modelo 130)' },
  { value: 'IRPF_Q4', label: 'IRPF Q4 (Modelo 130)' },
  { value: 'IRPF_ANNUAL', label: 'IRPF Annual (Modelo 100)' },
];

const PERIODS = [
  { value: 'Q1_2025', label: 'Q1 2025 (Jan-Mar)' },
  { value: 'Q2_2025', label: 'Q2 2025 (Apr-Jun)' },
  { value: 'Q3_2025', label: 'Q3 2025 (Jul-Sep)' },
  { value: 'Q4_2025', label: 'Q4 2025 (Oct-Dec)' },
  { value: 'ANNUAL_2025', label: 'Annual 2025' },
  { value: 'Q1_2026', label: 'Q1 2026 (Jan-Mar)' },
];

const API_BASE = '/api/reports';

const reportsApi = {
  list: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/list?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch reports');
    return res.json();
  },

  wizardStep1: async (data) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/wizard/step1`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to start wizard');
    return res.json();
  },

  wizardStep2: async (data) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/wizard/step2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to calculate');
    return res.json();
  },

  wizardStep3: async (data) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/wizard/step3`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to preview');
    return res.json();
  },

  submit: async (data) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
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
  if (loading) {
    return (
      <ReportsListCard>
        <CardTitle>Reports History</CardTitle>
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      </ReportsListCard>
    );
  }

  return (
    <ReportsListCard>
      <CardTitle>Reports History</CardTitle>
      <ReportsTable>
        <TableHead>
          <tr>
            <TableHeaderCell>Deadline</TableHeaderCell>
            <TableHeaderCell>Submit date</TableHeaderCell>
            <TableHeaderCell>Type</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Action</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell>{formatDate(report.deadline)}</TableCell>
              <TableCell>{formatDate(report.submit_date)}</TableCell>
              <TableCell>{report.report_type?.replace('_', ' ') || report.type}</TableCell>
              <TableCell>
                <StatusBadge $status={report.status}>{report.status}</StatusBadge>
              </TableCell>
              <TableCell>
                <ActionIconsWrapper>
                  <ActionIconButton onClick={() => onDelete(report.id)} title="Delete">
                    <AnyIcon icon={DeleteIcon} size="20px" />
                  </ActionIconButton>
                  <ActionIconButton onClick={() => onDownload(report.id)} title="Download">
                    <AnyIcon icon={DownloadIcon} size="20px" />
                  </ActionIconButton>
                </ActionIconsWrapper>
              </TableCell>
            </TableRow>
          ))}
          {reports.length === 0 && (
            <TableRow>
              <TableCell colSpan={5}>
                <EmptyState>No reports yet. Generate your first report!</EmptyState>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </ReportsTable>
    </ReportsListCard>
  );
};

const ReportsFilters = ({ filters, onChange, onApply }) => {
  return (
    <FiltersCard>
      <FiltersTitle>Filters</FiltersTitle>

      <FilterGroup>
        <FilterLabel>Date Range</FilterLabel>
        <DateInputGroup>
          <DateInput
            type="text"
            placeholder="From"
            value={filters.dateFrom || ''}
            onFocus={(e) => (e.target.type = 'date')}
            onBlur={(e) => !e.target.value && (e.target.type = 'text')}
            onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
          />
          <DateInput
            type="text"
            placeholder="To"
            value={filters.dateTo || ''}
            onFocus={(e) => (e.target.type = 'date')}
            onBlur={(e) => !e.target.value && (e.target.type = 'text')}
            onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
          />
        </DateInputGroup>
      </FilterGroup>

      <FilterGroup>
        <FilterLabel>Type</FilterLabel>
        <CheckboxGroup>
          <CheckboxLabel>
            <Checkbox
              checked={filters.showIVA || false}
              onChange={(e) => onChange({ ...filters, showIVA: e.target.checked })}
            />
            IVA
          </CheckboxLabel>
          <CheckboxLabel>
            <Checkbox
              checked={filters.showIRPF || false}
              onChange={(e) => onChange({ ...filters, showIRPF: e.target.checked })}
            />
            IRPF
          </CheckboxLabel>
        </CheckboxGroup>
      </FilterGroup>

      <ApplyButton onClick={onApply}>Apply</ApplyButton>
    </FiltersCard>
  );
};

const WizardStep1 = ({ data, onChange, onNext, loading }) => {
  return (
    <>
      <FormGroup>
        <Label>Report Type</Label>
        <Select
          value={data.reportType || ''}
          onChange={(e) => onChange({ ...data, reportType: e.target.value })}
        >
          <option value="">Select report type</option>
          {REPORT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Select>
      </FormGroup>

      <FormGroup>
        <Label>Period</Label>
        <Select
          value={data.period || ''}
          onChange={(e) => onChange({ ...data, period: e.target.value })}
        >
          <option value="">Select Period</option>
          {PERIODS.map((period) => (
            <option key={period.value} value={period.value}>
              {period.label}
            </option>
          ))}
        </Select>
      </FormGroup>

      <ButtonGroup>
        <PrimaryButton onClick={onNext} disabled={!data.reportType || !data.period || loading}>
          {loading ? <LoadingSpinner /> : 'Next Step'}
        </PrimaryButton>
      </ButtonGroup>
    </>
  );
};

const WizardStep2 = ({ calculation, legalRef, onBack, onNext, loading }) => {
  return (
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
            <InfoBadge>
              <AnyIcon icon={AlertIcon} size="14px" />
              Why this rate? - {legalRef}
            </InfoBadge>
          </CalculationCell>
        </CalculationRow>
      </CalculationTable>

      <ButtonGroup $spaceBetween>
        <SecondaryButton onClick={onBack}>Back</SecondaryButton>
        <PrimaryButton onClick={onNext} disabled={loading}>
          {loading ? <LoadingSpinner /> : 'Next Step'}
        </PrimaryButton>
      </ButtonGroup>
    </>
  );
};

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
          <OutlineButton>
            <AnyIcon icon={FileIcon} size="16px" /> Review PDF
          </OutlineButton>
        </CalculationCard>
      </CalculationGrid>

      {preview?.qr_code_base64 && (
        <QRCodeContainer>
          <QRCodeImage src={`data:image/png;base64,${preview.qr_code_base64}`} alt="VerifactU QR Code" />
          <VerifactuBadge>
            <AnyIcon icon={ShieldIcon} size="14px" />
            VERI*FACTU Compliant
          </VerifactuBadge>
          <QRCodeLabel>Factura verificable en la sede electrónica de la AEAT</QRCodeLabel>
        </QRCodeContainer>
      )}

      <ButtonGroup $spaceBetween>
        <SecondaryButton onClick={onBack}>Back</SecondaryButton>
        <PrimaryButton onClick={onSubmit} disabled={loading}>
          {loading ? <LoadingSpinner /> : 'Submit to Hacienda'}
        </PrimaryButton>
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
      const result = await reportsApi.wizardStep1({
        report_type: stepData.reportType,
        period: stepData.period,
      });
      setReportId(result.report_id);
      
      const calcResult = await reportsApi.wizardStep2({
        report_id: result.report_id,
        confirm_calculation: true,
      });
      setCalculation(calcResult);
      setStep(2);
    } catch (err) {
      console.error('Step 1 error:', err);
      alert('Failed to create report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Next = async () => {
    setLoading(true);
    try {
      const result = await reportsApi.wizardStep3({
        report_id: reportId,
        review_confirmed: true,
      });
      setPreview(result);
      setStep(3);
    } catch (err) {
      console.error('Step 2 error:', err);
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
      console.error('Submit error:', err);
      setErrorMessage(err.message || 'Failed to submit report to AEAT. Please try again.');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    handleClose();
  };

  const handleErrorClose = () => {
    setShowErrorModal(false);
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
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        title="Success"
        message="Your report has been successfully submitted to AEAT."
        csvCode={submissionResult?.csv_code}
      />

      <ErrorModal
        isOpen={showErrorModal}
        onClose={handleErrorClose}
        title="Error"
        message={errorMessage}
      />

      <WizardCard>
      <WizardHeader>
        <div>
          <WizardTitle>Report Overview</WizardTitle>
          {stepData.reportType && stepData.period && (
            <p style={{ margin: '0.5rem 0 0', opacity: 0.7 }}>
              {stepData.reportType.replace('_', ' ')} - {stepData.period.replace('_', ' ')}
            </p>
          )}
        </div>
        <WizardMeta>
          <StepIndicator>Step {step} of 4</StepIndicator>
          <StatusBadge $status={preview?.status || 'Draft'}>[{preview?.status || 'Draft'}]</StatusBadge>
        </WizardMeta>
      </WizardHeader>

      <StepList>
        {stepTitles.map((s) => (
          <StepItem
            key={s.num}
            $active={step === s.num}
            $clickable={s.num < step}
            onClick={() => s.num < step && setStep(s.num)}
          >
            <StepTitle $active={step === s.num}>
              Step {s.num}: {s.title}
              {step === 3 && s.num === 3 && stepData.reportType && (
                <span style={{ fontWeight: 400, marginLeft: '0.5rem' }}>
                  [{stepData.reportType.replace('_', ' ')}] [{stepData.period?.replace('_', ' ')}]
                </span>
              )}
            </StepTitle>
            <StepIcon $completed={s.num < step}>
              {s.num < step ? (
                <AnyIcon icon={CheckIcon} size="20px" />
              ) : (
                <AnyIcon icon={OpenAccordeonIcon} size="20px" />
              )}
            </StepIcon>
          </StepItem>
        ))}
      </StepList>

      <div style={{ marginTop: '1.5rem' }}>
        {step === 1 && (
          <WizardStep1 data={stepData} onChange={setStepData} onNext={handleStep1Next} loading={loading} />
        )}
        {step === 2 && calculation && (
          <WizardStep2
            calculation={calculation}
            legalRef="Art. 29 LIVA deduction"
            onBack={() => setStep(1)}
            onNext={handleStep2Next}
            loading={loading}
          />
        )}
        {step === 3 && (
          <WizardStep3
            preview={preview}
            calculation={calculation}
            onBack={() => setStep(2)}
            onSubmit={handleSubmit}
            loading={loading}
          />
        )}
      </div>
    </WizardCard>
    </>
  );
};

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
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
      } catch (e) {
        console.error('Failed to parse token');
      }
    }
  }, [fetchReports]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await reportsApi.delete(id);
        fetchReports();
      } catch (err) {
        console.error('Failed to delete report:', err);
        alert('Failed to delete report');
      }
    }
  };

  const handleDownload = async (id) => {
    try {
      const data = await reportsApi.download(id);
      console.log('Download data:', data);
      alert(`Report ready for download. CSV: ${data.verifactu_hash?.substring(0, 12) || 'N/A'}`);
    } catch (err) {
      console.error('Failed to download:', err);
      alert('Failed to download report');
    }
  };

  const handleApplyFilters = () => {
    fetchReports();
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
              <SubmitButton onClick={() => setWizardOpen(true)} padding="0.75rem 1.5rem">
                Generate report
              </SubmitButton>
            )}
          </WelcomeCard>

          {wizardOpen && (
            <ReportWizard
              isOpen={wizardOpen}
              onClose={() => setWizardOpen(false)}
              onComplete={fetchReports}
            />
          )}

          <ReportsHistory
            reports={reports}
            onDelete={handleDelete}
            onDownload={handleDownload}
            loading={loading}
          />

          <ReportsFilters filters={filters} onChange={setFilters} onApply={handleApplyFilters} />
        </ContentGrid>
      </MainContent>
      <Footer />
    </ReportsContainer>
  );
};

export default Reports;