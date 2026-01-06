import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { theme, media} from '../../theme';

export const FooterSection = styled.footer`
  padding: 2rem 1rem;
  color: ${theme.colors.mainFont};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;

  ${media.md} {
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

  ${media.md} {
    align-items: ${({ $align }) => $align || 'flex-start'};
  }
`;

export const SocialLinksText = styled.p`
  font-size: ${theme.typography.fontSize.md};
  margin: 0;
  text-align: center;

  ${media.md} {
    font-size: ${theme.typography.fontSize.lg};
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

  ${media.md} {
    gap: 1.5rem;
  }
`;

export const PrivacyPolicyLink = styled(Link)`
  color: ${theme.colors.mainFont};
  text-decoration: none;
  font-size: ${theme.typography.fontSize.base};

  &:hover,
  &:focus {
    text-decoration: underline;
  }

  ${media.md} {
    font-size: ${theme.typography.fontSize.md};
  }
`;

export const PrivacyPolicyText = styled.p`
  font-size: ${theme.typography.fontSize.base};
  margin: 0;
  text-align: center;

  ${media.md} {
    font-size: ${theme.typography.fontSize.md};
    text-align: right;
  }
`;

export const PrivacyPolicyTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  ${media.md} {
    align-items: flex-end;
  }
`;