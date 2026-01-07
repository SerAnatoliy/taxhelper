import { useState, useEffect, useCallback } from 'react';
import Footer from '../Footer/Footer';
import { AnyIcon } from '../Shared/AnyIcon/AnyIcon';
import { SubmitButton } from '../Shared/ActionButton/ActionButton';
import { SuccessModal, ErrorModal } from '../Shared/ResultModal/ResultModal';
import AppHeader from '../Shared/AppHeader';

import DataTable, { ActionIconButton, StatusBadge } from '../Shared/DataTable/DataTable';
import Filters from '../Shared/Filters/Filters';

import {
  getProfile,
  getReports,
  deleteReport,
  downloadReport,
  reportWizardStep1,
  reportWizardStep2,
  reportWizardStep3,
  submitReport,
} from '../../services/api';

import DeleteIcon from '../../assets/icons/Delete.svg?react';
import DownloadIcon from '../../assets/icons/Download.svg?react';
import EditIcon from '../../assets/icons/Edit.svg?react';
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
  ReportsListCard,
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
  FormGroup,
  Label,
  Select,
  ButtonGroup,
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
  CalculationTable,
  CalculationRow,
  CalculationCell,
  CalculationGrid,
  CalculationCard,
  CalculationLabel,
  CalculationValue,
  CalculationSubtext,
  InfoBadge,
  QRCodeContainer,
  QRCodeImage,
  QRCodeLabel,
  VerifactuBadge,
  LoadingSpinner,
  FiltersCardStyled,
} from './Reports.styles';

const TAX_CATEGORIES = [
  { value: 'IVA', label: 'IVA (Modelo 303)' },
  { value: 'IRPF', label: 'IRPF (Modelo 130)' },
];

const getAvailablePeriods = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-11
  const currentQuarter = Math.floor(currentMonth / 3) + 1; // 1-4
  
  const periods = [];
  
  let prevQuarter = currentQuarter - 1;
  let prevYear = currentYear;
  if (prevQuarter === 0) {
    prevQuarter = 4;
    prevYear = currentYear - 1;
  }
  periods.push({
    value: `Q${prevQuarter}_${prevYear}`,
    label: `Q${prevQuarter} ${prevYear} (Previous)`,
    quarter: prevQuarter,
    year: prevYear,
  });
  
  periods.push({
    value: `Q${currentQuarter}_${currentYear}`,
    label: `Q${currentQuarter} ${currentYear} (Current)`,
    quarter: currentQuarter,
    year: currentYear,
  });
  
  return periods;
};

const AVAILABLE_PERIODS = getAvailablePeriods();

const formatCurrency = (val) => {
  const num = parseFloat(val) || 0;
  return `€ ${num.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const ReportsHistory = ({ reports, total, onDelete, onDownload, onEdit, loading }) => {
  const columns = [
    { key: 'deadline', label: 'Deadline', render: (val) => formatDate(val) },
    { key: 'submit_date', label: 'Submit date', render: (val) => formatDate(val) },
    { key: 'report_type', label: 'Type', render: (val) => val?.replace('_', ' ') || '' },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge $status={val}>{val}</StatusBadge> },
  ];

  const canEdit = (report) => report.status !== 'Submitted' && report.status !== 'Accepted';

  return (
    <ReportsListCard>
      <CardTitle>Reports History {total > 0 && `(${total})`}</CardTitle>
      <DataTable
        columns={columns}
        data={reports}
        loading={loading}
        loadingText="Loading reports..."
        emptyText="No reports yet. Generate your first report!"
        onRowClick={(report) => canEdit(report) && onEdit(report)}
        renderActions={(report) => (
          <>
            {canEdit(report) && (
              <ActionIconButton onClick={(e) => { e.stopPropagation(); onEdit(report); }} title="Edit/Resume">
                <AnyIcon icon={EditIcon} size="20px" />
              </ActionIconButton>
            )}
            <ActionIconButton onClick={(e) => { e.stopPropagation(); onDelete(report.id); }} title="Delete">
              <AnyIcon icon={DeleteIcon} size="20px" />
            </ActionIconButton>
            <ActionIconButton onClick={(e) => { e.stopPropagation(); onDownload(report.id); }} title="Download">
              <AnyIcon icon={DownloadIcon} size="20px" />
            </ActionIconButton>
          </>
        )}
      />
    </ReportsListCard>
  );
};

const WizardStep1 = ({ data, onChange, onNext, loading }) => {
  const handleCategoryChange = (category) => {
    onChange({ ...data, category, reportType: '' });
  };

  const handlePeriodChange = (period) => {
    const reportType = data.category && period ? `${data.category}_${period.split('_')[0]}` : '';
    onChange({ ...data, period, reportType });
  };

  const isValid = data.category && data.period;

  return (
    <>
      <FormGroup>
        <Label>Tax Category</Label>
        <Select 
          value={data.category || ''} 
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          <option value="">Select tax category</option>
          {TAX_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </Select>
      </FormGroup>
      
      <FormGroup>
        <Label>Period</Label>
        <Select 
          value={data.period || ''} 
          onChange={(e) => handlePeriodChange(e.target.value)}
          disabled={!data.category}
        >
          <option value="">Select period</option>
          {AVAILABLE_PERIODS.map((period) => (
            <option key={period.value} value={period.value}>{period.label}</option>
          ))}
        </Select>
      </FormGroup>

      {data.category && data.period && (
        <InfoBadge style={{ marginBottom: '1rem' }}>
          <AnyIcon icon={AlertIcon} size="14px" />
          Report: {data.category} {data.period.replace('_', ' ')}
        </InfoBadge>
      )}

      <ButtonGroup>
        <PrimaryButton onClick={onNext} disabled={!isValid || loading}>
          {loading ? <LoadingSpinner /> : 'Next Step'}
        </PrimaryButton>
      </ButtonGroup>
    </>
  );
};

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
      <PrimaryButton onClick={onNext} disabled={loading}>
        {loading ? <LoadingSpinner /> : 'Next Step'}
      </PrimaryButton>
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
        <PrimaryButton onClick={onSubmit} disabled={loading}>
          {loading ? <LoadingSpinner /> : 'Submit to Hacienda'}
        </PrimaryButton>
      </ButtonGroup>
    </>
  );
};

const ReportWizard = ({ isOpen, onClose, onComplete, editingReport }) => {
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

  useEffect(() => {
    if (editingReport) {
      const category = editingReport.report_type?.split('_')[0] || '';
      const period = editingReport.period || '';
      setStepData({ category, period, reportType: editingReport.report_type });
      setReportId(editingReport.id);
      
      if (editingReport.status === 'Pending' || editingReport.calculation_data) {
        setStep(2);
        handleResumeCalculation(editingReport.id);
      }
    }
  }, [editingReport]);

  const handleResumeCalculation = async (id) => {
    setLoading(true);
    try {
      const calcResult = await reportWizardStep2({ reportId: id, confirmCalculation: true });
      setCalculation(calcResult);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Failed to load calculation.');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleStep1Next = async () => {
    setLoading(true);
    try {
      const quarter = stepData.period.split('_')[0]; 
      const reportType = `${stepData.category}_${quarter}`;
      
      const result = await reportWizardStep1({
        reportType: reportType,
        period: stepData.period,
      });
      setReportId(result.report_id);

      const calcResult = await reportWizardStep2({
        reportId: result.report_id,
        confirmCalculation: true,
      });
      setCalculation(calcResult);
      setStep(2);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Failed to create report. Please try again.');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Next = async () => {
    setLoading(true);
    try {
      const result = await reportWizardStep3({
        reportId: reportId,
        reviewConfirmed: true,
      });
      setPreview(result);
      setStep(3);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Failed to generate preview. Please try again.');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await submitReport({ reportId: reportId });
      setSubmissionResult(result);
      setShowSuccessModal(true);
      onComplete?.();
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Failed to submit report to AEAT.');
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

  const displayTitle = stepData.category && stepData.period 
    ? `${stepData.category} ${stepData.period.replace('_', ' ')}`
    : 'Report Overview';

  return (
    <>
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => { setShowSuccessModal(false); handleClose(); }}
        title="Success"
        message="Your report has been successfully submitted to AEAT."
        csvCode={submissionResult?.csv_code}
      />
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        message={errorMessage}
      />
      <WizardCard>
        <WizardHeader>
          <div>
            <WizardTitle>{editingReport ? 'Resume Report' : 'New Report'}</WizardTitle>
            {(stepData.category || stepData.period) && (
              <p style={{ margin: '0.5rem 0 0', opacity: 0.7 }}>{displayTitle}</p>
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
              <StepTitle $active={step === s.num}>Step {s.num}: {s.title}</StepTitle>
              <StepIcon $completed={s.num < step}>
                {s.num < step ? <AnyIcon icon={CheckIcon} size="20px" /> : <AnyIcon icon={OpenAccordeonIcon} size="20px" />}
              </StepIcon>
            </StepItem>
          ))}
        </StepList>
        <div style={{ marginTop: '1.5rem' }}>
          {step === 1 && (
            <WizardStep1
              data={stepData}
              onChange={setStepData}
              onNext={handleStep1Next}
              loading={loading}
            />
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

const REPORT_TYPE_OPTIONS = [
  { key: 'showIVA', label: 'IVA' },
  { key: 'showIRPF', label: 'IRPF' },
];

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [totalReports, setTotalReports] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', showIVA: false, showIRPF: false });
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [userName, setUserName] = useState('User');

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const apiFilters = {
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      };
      
      if (filters.showIVA && !filters.showIRPF) {
        apiFilters.showIVA = true;
      } else if (filters.showIRPF && !filters.showIVA) {
        apiFilters.showIRPF = true;
      }

      const data = await getReports(apiFilters);
      setReports(data.reports || []);
      setTotalReports(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        const nameParts = (profile.full_name || '').split(' ');
        setUserName(nameParts[0] || 'User');
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    };
    loadProfile();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await deleteReport(id);
        fetchReports();
      } catch (err) {
        const message = err.response?.data?.detail || 'Failed to delete report';
        alert(message);
      }
    }
  };

  const handleDownload = async (id) => {
    try {
      const data = await downloadReport(id);
      if (data.download_url) {
        window.open(data.download_url, '_blank');
      } else {
        alert(`Report ready. CSV Code: ${data.verifactu_hash?.substring(0, 12) || 'N/A'}`);
      }
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to download report';
      alert(message);
    }
  };

  const handleEdit = (report) => {
    setEditingReport(report);
    setWizardOpen(true);
  };

  const handleWizardClose = () => {
    setWizardOpen(false);
    setEditingReport(null);
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
              <SubmitButton
                onClick={() => { setEditingReport(null); setWizardOpen(true); }}
                padding="0.75rem 1.5rem"
              >
                Generate report
              </SubmitButton>
            )}
          </WelcomeCard>

          {wizardOpen && (
            <ReportWizard
              isOpen={wizardOpen}
              onClose={handleWizardClose}
              onComplete={fetchReports}
              editingReport={editingReport}
            />
          )}

          <ReportsHistory
            reports={reports}
            total={totalReports}
            onDelete={handleDelete}
            onDownload={handleDownload}
            onEdit={handleEdit}
            loading={loading}
          />

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