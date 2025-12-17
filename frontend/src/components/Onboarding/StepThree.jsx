import { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { createPlaidLinkToken, exchangePlaidToken, uploadBankStatement } from '../../services/api';
import { theme } from '../../theme';
import {
  PageTitle,
  PageSubtitle,
  FormCheckbox,
} from '../Shared/FormComponents';
import {
  FormSection,
  FieldGroup,
  FieldLabel,
  ButtonContainer,
  PrimaryButton,
  SecondaryButton,
  SkipLink,
  ErrorText,
} from './Onboarding.styles';

const ConnectSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
`;

const PlaidButton = styled.button`
  width: 100%;
  max-width: 280px;
  padding: 1rem 2rem;
  background: ${theme.colors.mainButton};
  border: 2px solid transparent;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.mainFont};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${theme.colors.logoBlue};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const OrDivider = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 400px;
  margin: 1.5rem 0;
  color: ${theme.colors.mainFont};
  font-size: 14px;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${theme.colors.mainFont};
    opacity: 0.3;
  }

  span {
    padding: 0 1rem;
  }
`;

const UploadArea = styled.div`
  width: 100%;
  max-width: 280px;
  aspect-ratio: 1;
  border: 3px dashed ${({ $hasFile }) => ($hasFile ? theme.colors.successGreen : theme.colors.mainFont)};
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
  background: ${({ $hasFile }) => ($hasFile ? 'rgba(2, 194, 104, 0.1)' : 'transparent')};

  &:hover {
    border-color: ${theme.colors.logoBlue};
    background: rgba(255, 255, 255, 0.3);
  }

  svg {
    width: 60px;
    height: 60px;
    color: ${theme.colors.mainFont};
    opacity: 0.7;
  }
`;

const UploadText = styled.p`
  font-size: 14px;
  color: ${theme.colors.mainFont};
  margin: 0.5rem 0 0;
  text-align: center;
  padding: 0 1rem;
`;

const SuccessMessage = styled.div`
  background: rgba(2, 194, 104, 0.1);
  border: 1px solid ${theme.colors.successGreen};
  border-radius: 12px;
  padding: 1rem;
  width: 100%;
  max-width: 400px;
  text-align: center;

  h4 {
    color: ${theme.colors.successGreen};
    margin: 0 0 0.5rem;
  }

  p {
    color: ${theme.colors.mainFont};
    margin: 0;
    font-size: 14px;
  }
`;

const StatusText = styled.p`
  font-size: 14px;
  color: ${theme.colors.mainFont};
  text-align: center;
  margin: 0.5rem 0;
`;

const BankIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
  </svg>
);

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const StepThree = ({ data, updateData, onNext, onBack, onSkip }) => {
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [plaidReady, setPlaidReady] = useState(false);
  const [linkToken, setLinkToken] = useState(null);
  const [bankConnected, setBankConnected] = useState(false);
  const [connectionResult, setConnectionResult] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
    script.async = true;
    script.onload = () => setPlaidReady(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const fetchLinkToken = async () => {
      try {
        const response = await createPlaidLinkToken();
        setLinkToken(response.link_token);
      } catch (error) {
        console.error('Failed to get link token:', error);
        setErrors({ plaid: 'Failed to initialize bank connection. Please try manual upload.' });
      }
    };

    fetchLinkToken();
  }, []);

  const handlePlaidSuccess = useCallback(async (publicToken, metadata) => {
    setIsLoading(true);
    try {
      const result = await exchangePlaidToken(publicToken);
      setBankConnected(true);
      setConnectionResult(result);
      updateData({ bankConnected: true });
    } catch (error) {
      console.error('Failed to connect bank:', error);
      setErrors({ plaid: 'Failed to connect bank. Please try again or use manual upload.' });
    } finally {
      setIsLoading(false);
    }
  }, [updateData]);

  const openPlaidLink = useCallback(() => {
    if (!window.Plaid || !linkToken) {
      setErrors({ plaid: 'Bank connection not ready. Please try again.' });
      return;
    }

    const handler = window.Plaid.create({
      token: linkToken,
      onSuccess: handlePlaidSuccess,
      onExit: (err, metadata) => {
        if (err) {
          console.error('Plaid Link error:', err);
        }
      },
    });

    handler.open();
  }, [linkToken, handlePlaidSuccess]);

  const handleChange = (e) => {
    const { name, checked } = e.target;
    if (name === 'bankSync') {
      updateData({
        consents: { ...data.consents, bankSync: checked },
      });
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    updateData({ bankStatementFile: file });
    setIsLoading(true);

    try {
      const result = await uploadBankStatement(file);
      setConnectionResult({
        message: 'Bank statement uploaded successfully',
        transactions_added: result.transactions_created,
        accounts_synced: 0,
      });
      setBankConnected(true);
      updateData({ bankConnected: true });
    } catch (error) {
      console.error('Failed to upload bank statement:', error);
      setErrors({ upload: error.response?.data?.detail || 'Failed to process bank statement.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    onNext();
  };

  const consentLabel = 'I consent to bank sync for tax verification';

  return (
    <>
      <PageTitle>Connect Your Bank Account</PageTitle>
      <PageSubtitle $maxWidth="600px">
        Link your bank to auto-sync transactions for accurate tax reports.
        Read-only access – your data is encrypted & secure (OAuth).
      </PageSubtitle>

      <FormSection>
        {bankConnected && connectionResult && (
          <SuccessMessage>
            <h4><CheckIcon /> Bank Connected!</h4>
            <p>
              {connectionResult.transactions_added > 0
                ? `${connectionResult.transactions_added} transactions imported.`
                : 'Your bank account is now linked.'}
            </p>
          </SuccessMessage>
        )}

        {!bankConnected && (
          <>
            <ConnectSection>
              <PlaidButton
                onClick={openPlaidLink}
                disabled={!plaidReady || !linkToken || isLoading}
              >
                <BankIcon />
                {isLoading ? 'Connecting...' : 'Connect Your Bank'}
              </PlaidButton>
              {!plaidReady && <StatusText>Loading bank connection...</StatusText>}
              {errors.plaid && <ErrorText>{errors.plaid}</ErrorText>}
            </ConnectSection>

            <OrDivider><span>or upload manually</span></OrDivider>

            <FieldGroup>
              <FieldLabel>Upload Bank Statement (CSV/Excel)</FieldLabel>
              <UploadArea
                onClick={() => fileInputRef.current?.click()}
                $hasFile={!!uploadedFileName}
              >
                <UploadIcon />
                <UploadText>
                  {uploadedFileName || 'Click to upload CSV or Excel file'}
                </UploadText>
              </UploadArea>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              {errors.upload && <ErrorText>{errors.upload}</ErrorText>}
            </FieldGroup>
          </>
        )}

        <FormCheckbox
          id="bankSync"
          name="bankSync"
          checked={data.consents.bankSync}
          onChange={handleChange}
          label={consentLabel}
          error={errors.bankSync}
        />

        {errors.submit && <ErrorText>{errors.submit}</ErrorText>}
      </FormSection>

      <ButtonContainer>
        <SkipLink type="button" onClick={onSkip}>
          Skip
        </SkipLink>
      </ButtonContainer>

      <ButtonContainer>
        <SecondaryButton onClick={onBack}>Back</SecondaryButton>
        <PrimaryButton onClick={handleSubmit} disabled={isLoading}>
          {bankConnected ? 'Continue' : 'Skip & Continue'}
        </PrimaryButton>
      </ButtonContainer>
    </>
  );
};

export default StepThree;