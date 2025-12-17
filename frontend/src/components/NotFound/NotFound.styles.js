import styled from 'styled-components';
import { theme } from '../../theme';


export const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  text-align: center;
`;

export const ErrorCode = styled.h1`
  font-size: 120px;
  font-weight: 700;
  color: ${theme.colors.logoBlue};
  margin: 0;
  line-height: 1;

  @media (min-width: 768px) {
    font-size: 180px;
  }
`;

export const Illustration = styled.div`
  font-size: 80px;
  margin: 1rem 0 2rem;

  @media (min-width: 768px) {
    font-size: 100px;
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;

  @media (min-width: 768px) {
    flex-direction: row;
    gap: 1.5rem;
  }
`;
