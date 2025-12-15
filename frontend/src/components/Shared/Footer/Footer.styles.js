import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { theme } from '../../../theme';

export const FooterSection = styled.footer`
  padding: 2rem 1rem;
  color: ${theme.colors.mainFont};
  text-align: center;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${theme.colors.footerBg};
`;

export const FooterDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
`;

export const SocialLinksText = styled.p`
  font-size: 18px;
  margin: 0;
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
  justify-content: center;
  gap: 1.5rem;
`;
export const PrivacyPolicyLink = styled(Link)`
  color: ${theme.colors.mainFont};
  text-decoration: none;
  &:hover,
  &:focus {
    text-decoration: underline;
  }
`;

export const PrivacyPolicyText = styled.p`
  font-size: 18px;
  margin: 0;
  text-align: right;
`;

export const PrivacyPolicyTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: roght;
  justify-content: center;
`;