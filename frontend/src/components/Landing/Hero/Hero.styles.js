import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { theme } from '../../../theme';

export const HeroSection = styled.section`
  padding: 5rem 1rem;
  text-align: center;
  @media (min-width: 768px) {
    padding: 5rem 2rem;
  }
`;

export const HeroContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

export const HeroTitle = styled.h1`
  font-size: 48px;
  font-weight: bold;
  color:${theme.colors.mainFont};
  margin-bottom: 1rem;
  @media (min-width: 768px) {
    font-size: 4rem;
  }
`;

export const HeroSubtitle = styled.p`
  font-size: 24px;
  color:${theme.colors.mainFont};
  text-align: center;
  font-style: italic;
  font-weight: 400;
  margin-bottom: 2rem;
  max-width: 32rem;
  margin-left: auto;
  margin-right: auto;
`;

export const AdvertCopy = styled.p`
  text-align: center;
  margin-top: 2rem;
  color: ${theme.colors.mainFont};
  font-size: 16px;
  font-style: italic;

`;
