import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../Footer/Footer';
import { AnyIcon } from '../Shared/AnyIcon/AnyIcon';
import { GradientPageContainer } from '../Shared/FormComponents/FormComponents.styles';
import { getProfile } from '../../services/api';
import TaxHelperLogo from '../../assets/icons/logoTaxHelper.svg?react';

import StepOne from './StepOne/StepOne';
import StepTwo from './StepTwo/StepTwo';
import StepThree from './StepThree/StepThree';

import {
  OnboardingHeader,
  LogoutButton,
  ProgressSection,
  StepIndicator,
  StepText,
  StepCount,
  SkipAllButton,
  MainContent,
} from './Onboarding.styles';

const TOTAL_STEPS = 3;

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    familyStatus: '',
    numChildren: '',
    region: '',
    dniNie: '',
    verificationMethod: 'upload',
    dniFrontFile: null,
    dniBackFile: null,
    selectedBank: '',
    bankStatementFile: null,
    consents: {
      taxPersonalization: false,
      kycProcessing: false,
      bankSync: false,
    },
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        const [firstName = '', lastName = ''] = (profile.full_name || '').split(' ');
        setUserData((prev) => ({
          ...prev,
          firstName,
          lastName,
          familyStatus: profile.family_status || '',
          numChildren: profile.num_children?.toString() || '',
          region: profile.region || '',
        }));
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleSkipAll = () => {
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const updateUserData = (data) => {
    setUserData((prev) => ({ ...prev, ...data }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepOne
            data={userData}
            updateData={updateUserData}
            onNext={handleNext}
            onSkip={handleSkip}
          />
        );
      case 2:
        return (
          <StepTwo
            data={userData}
            updateData={updateUserData}
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
          />
        );
      case 3:
        return (
          <StepThree
            data={userData}
            updateData={updateUserData}
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <GradientPageContainer>
        <MainContent>Loading...</MainContent>
      </GradientPageContainer>
    );
  }

  return (
    <GradientPageContainer>
      <OnboardingHeader>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <AnyIcon icon={TaxHelperLogo} size="64px" />
        </div>
        <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
      </OnboardingHeader>

      <ProgressSection>
        <StepIndicator>
          <StepText>Step</StepText>
          <StepCount>{currentStep} out of {TOTAL_STEPS}</StepCount>
        </StepIndicator>
        <SkipAllButton onClick={handleSkipAll}>Skip all</SkipAllButton>
      </ProgressSection>

      <MainContent>{renderStep()}</MainContent>

      <Footer />
    </GradientPageContainer>
  );
};

export default Onboarding;