import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { theme } from '../../../theme';

export const PricingSection = styled.section`
  padding: 5rem 1rem;
  @media (min-width: 768px) {
    padding: 5rem 2rem;
  }
`;

export const PricingContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const PricingTitle = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 3rem;
  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
`;

export const PricingGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
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
  border-top: 4px solid ${(props) => (props.highlight ? '#2563eb' : '#e5e7eb')};
  color: ${theme.colors.mainFont};

`;

export const PricingTitleCard = styled.h3`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: ${theme.colors.mainFont};
`;

export const PricingPrice = styled.p`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: ${theme.colors.mainFont};
`;

export const PricingList = styled.ul`
  text-align: left;
  margin-bottom: 1.5rem;
  list-style: none;
  padding: 0;
`;

export const PricingListItem = styled.li`
  margin-bottom: 0.5rem;
  color: ${theme.colors.mainFont};
`;
