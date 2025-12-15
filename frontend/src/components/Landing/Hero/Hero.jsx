import { ActionButton } from '../../Shared/ActionButton';
import { HeroSection, HeroContainer, HeroTitle, HeroSubtitle, AdvertCopy } from './Hero.styles';

const Hero = () => {
  return (
    <HeroSection>
      <HeroContainer>
        <HeroTitle>Save 20+ Hours on Taxes with AI</HeroTitle>
        <HeroSubtitle>Automate invoice parsing, KYC verification, and tax reporting. Save time and money on taxes in Spain.</HeroSubtitle>
        <ActionButton to="/signup" width="264px" height="64px" fontSize="18px" primary>Get Started for Free</ActionButton>
        <AdvertCopy>14-day trial for Premium subscription. No credit card required.</AdvertCopy>
      </HeroContainer>
    </HeroSection>
  );
};

export default Hero;