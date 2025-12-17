import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { theme } from '../../theme';

export const FooterSection = styled.footer`
  padding: 2rem 1rem;
  color: ${theme.colors.mainFont};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 2rem;
  }
`;

export const FooterDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  @media (min-width: 768px) {
    align-items: ${({ $align }) => $align || 'flex-start'};
  }
`;

export const SocialLinksText = styled.p`
  font-size: 16px;
  margin: 0;
  text-align: center;

  @media (min-width: 768px) {
    font-size: 18px;
    text-align: left;
  }
`;

export const SocialLinksIconContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 1.5rem;
`;

export const PrivacyPolicyLinkContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;

  @media (min-width: 768px) {
    gap: 1.5rem;
  }
`;

export const PrivacyPolicyLink = styled(Link)`
  color: ${theme.colors.mainFont};
  text-decoration: none;
  font-size: 14px;

  &:hover,
  &:focus {
    text-decoration: underline;
  }

  @media (min-width: 768px) {
    font-size: 16px;
  }
`;

export const PrivacyPolicyText = styled.p`
  font-size: 14px;
  margin: 0;
  text-align: center;

  @media (min-width: 768px) {
    font-size: 16px;
    text-align: right;
  }
`;

export const PrivacyPolicyTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  @media (min-width: 768px) {
    align-items: flex-end;
  }
`;