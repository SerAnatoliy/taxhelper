import { ActionButton } from '../../Shared/ActionButton';
import { PricingSection, PricingContainer, PricingTitle, PricingGrid, PricingCard, PricingTitleCard, PricingPrice, PricingList, PricingListItem } from './Pricing.styles';

const Pricing = () => {
  return (
    <PricingSection>
      <PricingContainer>
        <PricingTitle>Prices</PricingTitle>
        <PricingGrid>
          <PricingCard>
            <PricingTitleCard>Free</PricingTitleCard>
            <PricingPrice>€0</PricingPrice>
            <PricingList>
              <PricingListItem>• Unlimited uploads</PricingListItem>
              <PricingListItem>• Basic parsing</PricingListItem>
              <PricingListItem>• KYC 1x</PricingListItem>
            </PricingList>
          </PricingCard>
          <PricingCard >
            <PricingTitleCard >Pro</PricingTitleCard>
            <PricingPrice >€9.99/month</PricingPrice>
            <PricingList >
              <PricingListItem>• Advanced parsing</PricingListItem>
              <PricingListItem>• KYC unlimited</PricingListItem>
              <PricingListItem>• AI advice</PricingListItem>
            </PricingList>
          </PricingCard>
          <PricingCard>
            <PricingTitleCard>Premium</PricingTitleCard>
            <PricingPrice>€19.99/month</PricingPrice>
            <PricingList>
              <PricingListItem>• All Pro +</PricingListItem>
              <PricingListItem>• Priority support</PricingListItem>
              <PricingListItem>• Custom reports</PricingListItem>
            </PricingList>
          </PricingCard>
        </PricingGrid>
        <ActionButton to="/signup" width="200px" height="50px" fontSize="16px" style={{ marginTop: '2rem' }}>Get Started</ActionButton>
      </PricingContainer>
    </PricingSection>
  );
};

export default Pricing;