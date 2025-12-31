import styled from 'styled-components';
import { theme } from '../../theme';

export const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1rem;

  @media (min-width: 768px) {
    padding: 4rem 2rem;
  }
`;

export const HeroSection = styled.section`
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 4rem;
`;

export const EmailFormContainer = styled.div`
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

export const TrialText = styled.p`
  font-size: 14px;
  color: ${theme.colors.mainFont};
  margin: 0;
  align-self: flex-start;
  font-style: italic;

  @media (min-width: 768px) {
    font-size: 16px;
  }
`;

export const ButtonContainer = styled.div`
  margin-top: 1.5rem;
`;

export const FeaturesSection = styled.section`
  width: 100%;
  max-width: 900px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
`;

export const FeatureItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

export const FeatureTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: ${theme.colors.mainFont};
  margin: 1rem 0 0 0;

  @media (min-width: 768px) {
    font-size: 24px;
  }
`;

export const PricingSection = styled.section`
  width: 100%;
  max-width: 1200px;
  padding: 4rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (min-width: 768px) {
    padding: 5rem 2rem;
  }
`;

export const PricingGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  width: 100%;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export const PricingCard = styled.div`
  background: ${theme.colors.white};
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
  border-top: 4px solid ${({ $highlight }) => ($highlight ? theme.colors.logoBlue : '#e5e7eb')};
  color: ${theme.colors.mainFont};
`;

export const PricingCardTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
  color: ${theme.colors.mainFont};
`;

export const PricingPrice = styled.p`
  font-size: 2rem;
  font-weight: bold;
  margin: 0 0 2rem 0;
  color: ${theme.colors.mainFont};
`;

export const PricingList = styled.ul`
  text-align: left;
  margin: 0 0 1.5rem 0;
  list-style: none;
  padding: 0;
`;

export const PricingListItem = styled.li`
  margin-bottom: 0.5rem;
  color: ${theme.colors.mainFont};
`;

export const PricingButtonContainer = styled.div`
  margin-top: 2rem;
`;

export const SessionExpiredBanner = styled.div`
  background: ${theme.colors.error};
  color: ${theme.colors.white};
  padding: 0.75rem 1rem;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 3000;
  animation: slideDown 0.3s ease;

  @keyframes slideDown {
    from {
      transform: translateY(-100%);
    }
    to {
      transform: translateY(0);
    }
  }
`;