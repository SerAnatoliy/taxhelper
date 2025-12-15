import styled from 'styled-components';

export const FeaturesSection = styled.section`
  padding: 5rem 1rem;
  @media (min-width: 768px) {
    padding: 5rem 2rem;
  }
`;

export const FeaturesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

export const FeaturesTitle = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 3rem;
  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
`;

export const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export const FeatureItem = styled.div`
  text-align: center;
`;

export const FeatureIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

export const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

export const FeatureText = styled.p`
  color: #64748b;
`;