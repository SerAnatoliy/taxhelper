import { FeaturesSection, FeaturesContainer, FeaturesTitle, FeaturesGrid, FeatureItem, FeatureIcon, FeatureTitle, FeatureText } from './Features.styles';
import {AnyIcon} from '../../Shared/AnyIcon.jsx';
import AIIcon from '../../../assets/icons/AI.svg?react';
import KYCIcon from '../../../assets/icons/KYC.svg?react';
import DocParseIcon from '../../../assets/icons/docparse.svg?react';

const Features = () => {
  return (
    <FeaturesSection>
      <FeaturesContainer>
        <FeaturesTitle>Why TaxHelper?</FeaturesTitle>
        <FeaturesGrid>
          <FeatureItem>
            <AnyIcon icon={DocParseIcon} size='160px' />
            <FeatureTitle>Invoice Parsing</FeatureTitle>
            <FeatureText>Automatically extract amount, date, line items from PDF/invoices. Export to Excel for AEAT.</FeatureText>
          </FeatureItem>
          <FeatureItem>
            <AnyIcon icon={KYCIcon} size='160px' />
            <FeatureTitle>KYC Verification</FeatureTitle>
            <FeatureText>Quickly verify DNI/NIE with selfie. Compatible with banks and tax authorities.</FeatureText>
          </FeatureItem>
          <FeatureItem>
            <AnyIcon icon={AIIcon} size='160px' />
            <FeatureTitle>Tax Advice</FeatureTitle>
            <FeatureText>AI + expert recommendations on deductions, VAT, IRPF. Tax forecasting.</FeatureText>
          </FeatureItem>
        </FeaturesGrid>
      </FeaturesContainer>
    </FeaturesSection>
  );
};

export default Features;