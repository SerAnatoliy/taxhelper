import { AnyIcon } from '../../Shared/AnyIcon';
import { PrivacyPolicyTextContainer, FooterSection, SocialLinksText,PrivacyPolicyLink, PrivacyPolicyText, FooterDiv, SocialLinksIconContainer, PrivacyPolicyLinkContainer } from './Footer.styles';
import FacebookIcon from '../../../assets/icons/facebook.svg?react';
import XIcon from '../../../assets/icons/X.svg?react';
import InstagramIcon from '../../../assets/icons/instagram.svg?react';


const Footer = () => {
  return (
    <FooterSection>
      <FooterDiv>
        <SocialLinksText>Social networks</SocialLinksText>
        <SocialLinksIconContainer>
          <AnyIcon icon={FacebookIcon} size="24" />
          <AnyIcon icon={XIcon} size="24" />
          <AnyIcon icon={InstagramIcon} size="24" />
        </SocialLinksIconContainer>
      </FooterDiv>
      <FooterDiv>
        <PrivacyPolicyLinkContainer>
        <PrivacyPolicyLink href="mailto:info@taxhelper.com">Contact Us</PrivacyPolicyLink>
        <PrivacyPolicyLink to="/">Privacy policy</PrivacyPolicyLink>
        <PrivacyPolicyLink to="/">Terms of Service</PrivacyPolicyLink>
        </PrivacyPolicyLinkContainer>
        <PrivacyPolicyTextContainer>
          <PrivacyPolicyText>Copyright &copy; 2025 TaxHelper. All rights reserved.</PrivacyPolicyText>
          <PrivacyPolicyText> Made in Spain for autónomos. </PrivacyPolicyText>
        </PrivacyPolicyTextContainer>

      </FooterDiv>

    </FooterSection>
  );
};

export default Footer;