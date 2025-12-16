// frontend/src/components/Landing/index.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Shared/Header/Header';
import Footer from '../Shared/Footer/Footer';
import { SubmitButton, ActionButton } from '../Shared/ActionButton';
import { AnyIcon } from '../Shared/AnyIcon';
import {
  PageTitle,
  PageSubtitle,
  FormInput,
  GradientPageContainer,
} from '../Shared/FormComponents';
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
} from './Landing.styles';

// Icons
import AIIcon from '../../assets/icons/AI.svg?react';
import KYCIcon from '../../assets/icons/KYC.svg?react';
import DocParseIcon from '../../assets/icons/docparse.svg?react';

// ============ DATA ============
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

// ============ COMPONENT ============
const Landing = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

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

  return (
    <GradientPageContainer>
      <Header />
      <MainContent>
        {/* Hero Section */}
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

        {/* Features Section */}
        <FeaturesSection id="features">
          {FEATURES.map((feature) => (
            <FeatureItem key={feature.id}>
              <AnyIcon icon={feature.icon} size="140px" />
              <FeatureTitle>{feature.title}</FeatureTitle>
            </FeatureItem>
          ))}
        </FeaturesSection>

        {/* Pricing Section */}
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
    </GradientPageContainer>
  );
};

export default Landing;