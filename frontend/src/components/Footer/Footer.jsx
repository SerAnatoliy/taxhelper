import { AnyIcon } from '../Shared/AnyIcon';
import {
  FooterSection,
  FooterDiv,
  SocialLinksText,
  SocialLinksIconContainer,
  PrivacyPolicyLinkContainer,
  PrivacyPolicyLink,
  PrivacyPolicyText,
  PrivacyPolicyTextContainer,
} from './Footer.styles';
import FacebookIcon from '../../assets/icons/facebook.svg?react';
import XIcon from '../../assets/icons/X.svg?react';
import InstagramIcon from '../../assets/icons/instagram.svg?react';

const Footer = () => {
  return (
    <FooterSection>
      <FooterDiv>
        <SocialLinksText>Social networks</SocialLinksText>
        <SocialLinksIconContainer>
          <AnyIcon icon={FacebookIcon} size="24px" />
          <AnyIcon icon={InstagramIcon} size="24px" />
          <AnyIcon icon={XIcon} size="24px" />
        </SocialLinksIconContainer>
      </FooterDiv>

      <FooterDiv $align="flex-end">
        <PrivacyPolicyLinkContainer>
          <PrivacyPolicyLink as="a" href="mailto:info@taxhelper.com">
            Contact us
          </PrivacyPolicyLink>
          <PrivacyPolicyLink to="/privacy">Privacy Policy</PrivacyPolicyLink>
          <PrivacyPolicyLink to="/terms">Terms of service</PrivacyPolicyLink>
        </PrivacyPolicyLinkContainer>
        <PrivacyPolicyTextContainer>
          <PrivacyPolicyText>Copyright © 2025 TaxHelper.</PrivacyPolicyText>
          <PrivacyPolicyText>All rights reserved. Made in Spain for autónomos.</PrivacyPolicyText>
        </PrivacyPolicyTextContainer>
      </FooterDiv>
    </FooterSection>
  );
};

export default Footer;