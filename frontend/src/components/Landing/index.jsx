import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import LoginModal from '../LoginModal/LoginModal';
import { SubmitButton, ActionButton } from '../Shared/ActionButton/ActionButton';
import { AnyIcon } from '../Shared/AnyIcon/AnyIcon';
import {
  PageTitle,
  PageSubtitle,
  GradientPageContainer,
} from '../Shared/FormComponents/FormComponents.styles';
import {
  MainContent,
  HeroSection,
  EmailFormContainer,
  TrialText,
  ButtonContainer,
  FeaturesSection,
  FeatureItem,
  FeatureTitle,
  PricingSection,
  PricingGrid,
  PricingCard,
  PricingCardTitle,
  PricingPrice,
  PricingList,
  PricingListItem,
  PricingButtonContainer,
  SessionExpiredBanner,
} from './Landing.styles';
import { FormInput } from '../Shared/FormComponents/FormComponents.jsx';

import AIIcon from '../../assets/icons/AI.svg?react';
import KYCIcon from '../../assets/icons/KYC.svg?react';
import DocParseIcon from '../../assets/icons/docparse.svg?react';

const FEATURES = [
  { id: 'ai', icon: AIIcon, title: 'AI Tax Advisor' },
  { id: 'kyc', icon: KYCIcon, title: 'Easy KYC' },
  { id: 'parsing', icon: DocParseIcon, title: 'Document Parsing' },
];

const PRICING_PLANS = [
  {
    id: 'free',
    title: 'Free',
    price: '€0',
    features: ['Unlimited uploads', 'Basic parsing', 'KYC 1x'],
  },
  {
    id: 'pro',
    title: 'Pro',
    price: '€9.99/month',
    features: ['Advanced parsing', 'KYC unlimited', 'AI advice'],
    highlight: true,
  },
  {
    id: 'premium',
    title: 'Premium',
    price: '€19.99/month',
    features: ['All Pro +', 'Priority support', 'Custom reports'],
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const shouldShowLogin = searchParams.get('showLogin') === 'true';
    const isSessionExpired = searchParams.get('sessionExpired') === 'true';
    
    if (shouldShowLogin) {
      setShowLoginModal(true);
      setSessionExpired(isSessionExpired);
      
      searchParams.delete('showLogin');
      searchParams.delete('sessionExpired');
      setSearchParams(searchParams, { replace: true });
    }
    
    if (location.state?.showLogin) {
      setShowLoginModal(true);
      setSessionExpired(location.state?.sessionExpired || false);
      
      navigate('/', { replace: true, state: {} });
    }
  }, [searchParams, setSearchParams, location.state, navigate]);

  const validateEmail = (value) => {
    if (!value.trim()) return 'Please enter your email';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email';
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }
    navigate('/register', { state: { email } });
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError('');
  };

  const handleLoginClose = () => {
    setShowLoginModal(false);
    setSessionExpired(false);
  };

  const handleHeaderLoginClick = () => {
    setShowLoginModal(true);
  };

  return (
    <GradientPageContainer>
      <Header onLoginClick={handleHeaderLoginClick} />
      
      {sessionExpired && showLoginModal && (
        <SessionExpiredBanner>
          Your session has expired. Please log in again.
        </SessionExpiredBanner>
      )}
      
      <MainContent>
        <HeroSection>
          <PageTitle $size="48px">Save 20+ Hours on Taxes with AI</PageTitle>
          <PageSubtitle $size="20px" $maxWidth="600px">
            Automate IVA/IRPF declarations, document parsing, and Verifactu
            compliance in minutes – no accountants needed.
          </PageSubtitle>

          <EmailFormContainer as="form" onSubmit={handleSubmit}>
            <FormInput
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={handleEmailChange}
              error={emailError}
            />
            <TrialText>*No credit card required. 15-day trial.</TrialText>

            <ButtonContainer>
              <SubmitButton
                type="submit"
                width="180px"
                padding="0.875rem 2rem"
                fontSize="16px"
              >
                Sign Up Free
              </SubmitButton>
            </ButtonContainer>
          </EmailFormContainer>
        </HeroSection>

        <FeaturesSection id="features">
          {FEATURES.map((feature) => (
            <FeatureItem key={feature.id}>
              <AnyIcon icon={feature.icon} size="140px" />
              <FeatureTitle>{feature.title}</FeatureTitle>
            </FeatureItem>
          ))}
        </FeaturesSection>

        <PricingSection id="pricing">
          <PageTitle $size="40px">Prices</PageTitle>
          <PricingGrid>
            {PRICING_PLANS.map((plan) => (
              <PricingCard key={plan.id} $highlight={plan.highlight}>
                <PricingCardTitle>{plan.title}</PricingCardTitle>
                <PricingPrice>{plan.price}</PricingPrice>
                <PricingList>
                  {plan.features.map((feature, idx) => (
                    <PricingListItem key={idx}>• {feature}</PricingListItem>
                  ))}
                </PricingList>
              </PricingCard>
            ))}
          </PricingGrid>
          <PricingButtonContainer>
            <ActionButton to="/register" width="200px" height="50px" fontSize="16px">
              Get Started
            </ActionButton>
          </PricingButtonContainer>
        </PricingSection>
      </MainContent>
      
      <Footer />
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={handleLoginClose}
        sessionExpired={sessionExpired}
      />
    </GradientPageContainer>
  );
};

export default Landing;