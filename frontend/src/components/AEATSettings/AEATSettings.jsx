import { useState, useEffect, useRef } from 'react';
import { AnyIcon } from '../Shared/AnyIcon/AnyIcon';
import ShieldIcon from '../../assets/icons/Shield.svg?react';
import UploadIcon from '../../assets/icons/UploadInvoice.svg?react';
import CheckIcon from '../../assets/icons/CheckIcon.svg?react';
import DeleteIcon from '../../assets/icons/Delete.svg?react';
import {
  getAEATStatus,
  uploadAEATCertificateFile,
  deleteAEATCertificate,
  testAEATConnection,
} from '../../services/api';
import {
  SettingsContainer,
  SettingsCard,
  CardHeader,
  CardTitle,
  CardDescription,
  StatusBadge,
  CertificateInfo,
  InfoRow,
  InfoLabel,
  InfoValue,
  UploadSection,
  UploadDropzone,
  UploadText,
  PasswordInput,
  ButtonRow,
  PrimaryButton,
  SecondaryButton,
  DangerButton,
  TestResultCard,
  TestResultIcon,
  TestResultText,
  ErrorMessage,
  SuccessMessage,
  LoadingSpinner,
  EnvironmentToggle,
  ToggleOption,
} from './AEATSettings.styles';

const AEATSettings = ({ onStatusChange }) => {
  const fileInputRef = useRef(null);
  
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [password, setPassword] = useState('');
  const [useSandbox, setUseSandbox] = useState(true);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const data = await getAEATStatus();
      setStatus(data);
      onStatusChange?.(data);
    } catch (err) {
      setError('Failed to load AEAT status');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.p12') && !file.name.endsWith('.pfx')) {
        setError('Only .p12 or .pfx certificate files are accepted');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a certificate file');
      return;
    }

    try {
      setUploading(true);
      setError('');
      
      const result = await uploadAEATCertificateFile(selectedFile, password);
      
      setSuccess('Certificate uploaded successfully!');
      setSelectedFile(null);
      setPassword('');
      await loadStatus();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload certificate');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove your certificate?')) return;
    
    try {
      await deleteAEATCertificate();
      setSuccess('Certificate removed');
      await loadStatus();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to remove certificate');
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      setError('');
      
      const result = await testAEATConnection(useSandbox);
      setTestResult(result);
    } catch (err) {
      setError(err.response?.data?.detail || 'Connection test failed');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <SettingsContainer>
        <LoadingSpinner>Loading AEAT settings...</LoadingSpinner>
      </SettingsContainer>
    );
  }

  const certInfo = status?.certificate_info;
  const hasCertificate = status?.certificate_loaded && certInfo?.valid;

  return (
    <SettingsContainer>
      <SettingsCard>
        <CardHeader>
          <div>
            <CardTitle>
              <AnyIcon icon={ShieldIcon} size="24px" />
              AEAT Digital Certificate
            </CardTitle>
            <CardDescription>
              Configure your digital certificate for submitting invoices and reports to Agencia Tributaria
            </CardDescription>
          </div>
          <StatusBadge $status={hasCertificate ? 'active' : 'inactive'}>
            {hasCertificate ? 'Configured' : 'Not Configured'}
          </StatusBadge>
        </CardHeader>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        {hasCertificate ? (
          <>
            <CertificateInfo>
              <InfoRow>
                <InfoLabel>Subject</InfoLabel>
                <InfoValue>{certInfo.subject}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Issuer</InfoLabel>
                <InfoValue>{certInfo.issuer}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Valid From</InfoLabel>
                <InfoValue>{new Date(certInfo.not_before).toLocaleDateString('es-ES')}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Valid Until</InfoLabel>
                <InfoValue $warning={certInfo.is_expired}>
                  {new Date(certInfo.not_after).toLocaleDateString('es-ES')}
                  {certInfo.is_expired && ' (EXPIRED)'}
                </InfoValue>
              </InfoRow>
            </CertificateInfo>

            <ButtonRow>
              <DangerButton onClick={handleDelete}>
                <AnyIcon icon={DeleteIcon} size="16px" />
                Remove Certificate
              </DangerButton>
            </ButtonRow>
          </>
        ) : (
          <UploadSection>
            <UploadDropzone onClick={() => fileInputRef.current?.click()}>
              <AnyIcon icon={UploadIcon} size="48px" />
              <UploadText>
                {selectedFile ? selectedFile.name : 'Click to select your .p12 or .pfx certificate'}
              </UploadText>
            </UploadDropzone>
            <input
              ref={fileInputRef}
              type="file"
              accept=".p12,.pfx"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            
            {selectedFile && (
              <>
                <PasswordInput
                  type="password"
                  placeholder="Certificate password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <ButtonRow>
                  <SecondaryButton onClick={() => setSelectedFile(null)}>
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton onClick={handleUpload} disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload Certificate'}
                  </PrimaryButton>
                </ButtonRow>
              </>
            )}
          </UploadSection>
        )}
      </SettingsCard>

      <SettingsCard>
        <CardHeader>
          <div>
            <CardTitle>Test Connection</CardTitle>
            <CardDescription>
              Verify your certificate works with AEAT servers
            </CardDescription>
          </div>
        </CardHeader>

        <EnvironmentToggle>
          <ToggleOption 
            $active={useSandbox} 
            onClick={() => setUseSandbox(true)}
          >
            Sandbox (Testing)
          </ToggleOption>
          <ToggleOption 
            $active={!useSandbox} 
            onClick={() => setUseSandbox(false)}
          >
            Production
          </ToggleOption>
        </EnvironmentToggle>

        <ButtonRow>
          <PrimaryButton 
            onClick={handleTestConnection} 
            disabled={!hasCertificate || testing}
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </PrimaryButton>
        </ButtonRow>

        {testResult && (
          <TestResultCard $success={testResult.success}>
            <TestResultIcon $success={testResult.success}>
              {testResult.success ? <AnyIcon icon={CheckIcon} size="24px" /> : '✗'}
            </TestResultIcon>
            <TestResultText>
              {testResult.success 
                ? 'Connection successful! Your certificate is working correctly.'
                : `Connection failed: ${testResult.error}`
              }
            </TestResultText>
          </TestResultCard>
        )}

        {status?.last_submission && (
          <InfoRow style={{ marginTop: '1rem' }}>
            <InfoLabel>Last Submission</InfoLabel>
            <InfoValue>
              {new Date(status.last_submission).toLocaleString('es-ES')}
            </InfoValue>
          </InfoRow>
        )}
      </SettingsCard>
    </SettingsContainer>
  );
};

export default AEATSettings;