import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  PageTitle,
  PageSubtitle,
} from '../../Shared/FormComponents/FormComponents.styles';
import { FormCheckbox } from '../../Shared/FormComponents/FormComponents.jsx';
import {
  FormSection,
  FieldGroup,
  ButtonContainer,
  PrimaryButton,
  SecondaryButton,
  SkipLink,
  ErrorText,
} from '../Onboarding.styles';
import {
  VerificationCard,
  IconContainer,
  CardTitle,
  CardText,
  VerifyButton,
  StatusBadge,
  VeriffAttribution,
  BenefitsList,
} from './StepTwo.styles';
import { createVeriffSession, getVeriffStatus } from '../../../services/api';

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const StepTwo = ({ data, updateData, onNext, onBack, onSkip }) => {
  const [searchParams] = useSearchParams();
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [verificationId, setVerificationId] = useState(null);

  useEffect(() => {
    const veriffCallback = searchParams.get('veriff');
    const storedVerificationId = localStorage.getItem('veriff_session_id');

    if (veriffCallback === 'callback' && storedVerificationId) {
      setVerificationId(storedVerificationId);
      checkVerificationStatus(storedVerificationId);
    }
  }, [searchParams]);

  const checkVerificationStatus = async (id) => {
    try {
      const response = await getVeriffStatus(id);
      setVerificationStatus(response.status);

      if (response.verified) {
        updateData({ kycVerified: true });
      }
    } catch (error) {
      console.error('Failed to check verification status:', error);
      setVerificationStatus('pending');
    }
  };

  const handleStartVerification = async () => {
    if (!data.consents.kycProcessing) {
      setErrors({ kycProcessing: 'You must consent to KYC processing to continue' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await createVeriffSession();

      localStorage.setItem('veriff_session_id', response.verification_id);
      setVerificationId(response.verification_id);

      window.location.href = response.session_url;
    } catch (error) {
      console.error('Failed to start verification:', error);
      setErrors({
        submit: error.response?.data?.detail || 'Failed to start verification. Please try again.',
      });
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, checked } = e.target;
    if (name === 'kycProcessing') {
      updateData({
        consents: { ...data.consents, kycProcessing: checked },
      });
      if (errors.kycProcessing) {
        setErrors((prev) => ({ ...prev, kycProcessing: '' }));
      }
    }
  };

  const handleContinue = () => {
    localStorage.removeItem('veriff_session_id');
    onNext();
  };

  const consentLabel = 'I consent to KYC processing for tax compliance';

  if (verificationStatus === 'approved') {
    return (
      <>
        <PageTitle>Identity Verified!</PageTitle>
        <PageSubtitle $maxWidth="500px">
          Your identity has been successfully verified. You can now proceed with the setup.
        </PageSubtitle>

        <VerificationCard>
          <IconContainer $success>
            <CheckCircleIcon />
          </IconContainer>
          <CardTitle>Verification Complete</CardTitle>
          <StatusBadge $status="approved">✓ Approved</StatusBadge>
        </VerificationCard>

        <ButtonContainer>
          <PrimaryButton onClick={handleContinue}>Continue</PrimaryButton>
        </ButtonContainer>
      </>
    );
  }

  if (verificationStatus === 'pending' || verificationStatus === 'submitted') {
    return (
      <>
        <PageTitle>Verification in Progress</PageTitle>
        <PageSubtitle $maxWidth="500px">
          Your documents are being reviewed. This usually takes a few minutes.
        </PageSubtitle>

        <VerificationCard>
          <IconContainer>
            <ShieldIcon />
          </IconContainer>
          <CardTitle>Under Review</CardTitle>
          <StatusBadge $status="pending">⏳ Pending</StatusBadge>
          <CardText style={{ marginTop: '1rem' }}>
            You can continue with the setup and complete verification later, or wait for the review
            to complete.
          </CardText>
        </VerificationCard>

        <ButtonContainer>
          <SecondaryButton onClick={() => checkVerificationStatus(verificationId)}>
            Check Status
          </SecondaryButton>
          <PrimaryButton onClick={handleContinue}>Continue Anyway</PrimaryButton>
        </ButtonContainer>
      </>
    );
  }

  return (
    <>
      <PageTitle>Verify Your Identity</PageTitle>
      <PageSubtitle $maxWidth="600px">
        Complete a quick identity verification to comply with Spanish tax laws. Secure & fast (Takes
        2 mins; required for Hacienda submissions).
      </PageSubtitle>

      <FormSection>
        <VerificationCard>
          <IconContainer>
            <ShieldIcon />
          </IconContainer>
          <CardTitle>Secure Identity Verification</CardTitle>
          <CardText>
            You'll be redirected to our secure verification partner to verify your DNI/NIE. Have
            your document ready.
          </CardText>

          <BenefitsList>
            <li>
              <CheckIcon /> Takes only 2 minutes
            </li>
            <li>
              <CheckIcon /> Bank-level security
            </li>
            <li>
              <CheckIcon /> Required for tax submissions
            </li>
            <li>
              <CheckIcon /> Your data is encrypted
            </li>
          </BenefitsList>

          <VerifyButton
            onClick={handleStartVerification}
            disabled={isLoading || !data.consents.kycProcessing}
          >
            {isLoading ? 'Starting...' : 'Start Verification'}
          </VerifyButton>
        </VerificationCard>

        <FieldGroup>
          <FormCheckbox
            id="kycProcessing"
            name="kycProcessing"
            checked={data.consents.kycProcessing}
            onChange={handleChange}
            label={consentLabel}
            error={errors.kycProcessing}
          />
        </FieldGroup>

        <VeriffAttribution>
          Verification is performed by{' '}
          <a href="https://www.veriff.com/" target="_blank" rel="noopener noreferrer">
            Veriff
          </a>
        </VeriffAttribution>

        {errors.submit && <ErrorText>{errors.submit}</ErrorText>}
      </FormSection>

      <ButtonContainer>
        <SkipLink type="button" onClick={onSkip}>
          Skip for now
        </SkipLink>
      </ButtonContainer>

      <ButtonContainer>
        <SecondaryButton onClick={onBack}>Back</SecondaryButton>
        <PrimaryButton onClick={onSkip}>Skip & Continue</PrimaryButton>
      </ButtonContainer>
    </>
  );
};

export default StepTwo;