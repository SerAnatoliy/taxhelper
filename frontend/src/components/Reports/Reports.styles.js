import styled, {keyframes} from 'styled-components';
import { theme, media } from '../../theme';

export const ReportsContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${theme.colors.mainColorYellow};
  width: 100%;
  box-sizing: border-box;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid ${theme.colors.lightGrey};
  border-top: 2px solid ${theme.colors.logoBlue};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;


export const MainContent = styled.main`
  flex: 1;
  padding: 0 1rem 2rem;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  box-sizing: border-box;

  ${media.md} {
    padding: 0 2rem 2rem;
  }
`;

export const ContentGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;

  ${media.lg} {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 1.5rem;
  }
`;

export const WelcomeCard = styled.div`
  background: rgba(231, 248, 255, 0.8);
  border-radius: ${theme.borderRadius.xl};
  padding: 1.5rem;
  text-align: center;

  ${media.lg} {
    grid-column: 1 / -1;
    text-align: left;
    padding: 2rem;
  }
`;

export const WelcomeTitle = styled.h1`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.mainFont};
  margin: 0 0 0.5rem;

  ${media.md} {
    font-size: ${theme.typography.fontSize['4xl']};
  }
`;

export const WelcomeSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.md};
  font-style: italic;
  color: ${theme.colors.mainFont};
  margin: 0 0 1.5rem;

  ${media.md} {
    font-size: ${theme.typography.fontSize.lg};
  }
`;

export const Card = styled.div`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.xl};
  padding: 1.5rem;
`;

export const CardTitle = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.mainFont};
  margin: 0 0 1rem;
`;

export const FiltersCardStyled = styled.div`
  ${media.lg} {
    grid-row: span 2;
  }
`;

export const ReportsListCard = styled(Card)`
  overflow-x: auto;

  ${media.lg} {
    grid-column: 1;
  }
`;

export const WizardCard = styled(Card)`
  ${media.lg} {
    grid-column: 1;
  }
`;

export const WizardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

export const WizardTitle = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.mainFont};
  margin: 0;

  ${media.md} {
    font-size: ${theme.typography.fontSize['2xl']};
  }
`;

export const WizardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const StepIndicator = styled.span`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.mainFont};
  opacity: ${theme.opacity.subtle};
`;

export const StepList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

export const StepItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-radius: ${theme.borderRadius.lg};
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  transition: background ${theme.transitions.default};
  background: ${({ $active }) => ($active ? 'rgba(254, 214, 57, 0.2)' : 'transparent')};

  &:hover {
    background: ${({ $clickable }) => ($clickable ? 'rgba(254, 214, 57, 0.1)' : 'transparent')};
  }
`;

export const StepTitle = styled.span`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  color: ${theme.colors.mainFont};

  ${media.md} {
    font-size: ${theme.typography.fontSize.xl};
  }
`;

export const StepIcon = styled.span`
  display: flex;
  align-items: center;
  color: ${({ $completed }) => ($completed ? theme.colors.successGreen : theme.colors.mainFont)};
  opacity: ${({ $completed }) => ($completed ? 1 : 0.5)};
`;

export const CalculationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 1.5rem 0;

  ${media.md} {
    grid-template-columns: repeat(4, 1fr);
  }
`;

export const CalculationCard = styled.div`
  background: ${({ $highlight }) => ($highlight ? 'rgba(254, 214, 57, 0.3)' : theme.colors.lightGrey)};
  border-radius: ${theme.borderRadius.lg};
  padding: 1rem;
  text-align: center;
  border: ${({ $highlight }) => ($highlight ? `2px solid ${theme.colors.logoYellow}` : '2px solid transparent')};
`;

export const CalculationLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.mainFont};
  opacity: ${theme.opacity.subtle};
  margin-bottom: 0.25rem;
`;

export const CalculationValue = styled.div`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.mainFont};

  ${media.md} {
    font-size: ${theme.typography.fontSize['2xl']};
  }
`;

export const CalculationSubtext = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.mainFont};
  opacity: ${theme.opacity.subtle};
  margin-top: 0.25rem;
`;

export const CalculationTable = styled.div`
  background: ${theme.colors.lightGrey};
  border-radius: ${theme.borderRadius.lg};
  padding: 1rem;
  margin: 1.5rem 0;
`;

export const CalculationRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 0.5rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const CalculationCell = styled.div`
  font-size: ${theme.typography.fontSize.base};
  color: ${({ $label }) => ($label ? theme.colors.mainFont : theme.colors.mainFont)};
  opacity: ${({ $label }) => ($label ? 0.7 : 1)};
  font-weight: ${({ $value }) => ($value ? '600' : '400')};

  ${media.md} {
    font-size: ${theme.typography.fontSize.md};
  }
`;

export const InfoBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${theme.rgba.tealBadge};
  color: ${theme.colors.logoTeal};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: help;
`;

export const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

export const Label = styled.label`
  display: block;
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.mainFont};
  margin-bottom: 0.5rem;
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid transparent;
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.mainFont};
  background: ${theme.colors.lightGrey};
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 20px;

  &:focus {
    outline: none;
    border-color: ${theme.colors.logoBlue};
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;

  ${({ $spaceBetween }) => $spaceBetween && `justify-content: space-between;`}
`;

export const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${theme.colors.mainButton};
  color: ${theme.colors.mainFont};
  border: 3px solid transparent;
  border-radius: ${theme.borderRadius.xl};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: ${theme.transitions.button};

  &:hover:not(:disabled) {
    border-color: ${theme.colors.logoBlue};
  }

  &:disabled {
    opacity: ${theme.opacity.muted};
    cursor: not-allowed;
  }
`;

export const SecondaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: ${theme.colors.mainFont};
  border: 2px solid ${theme.colors.mainFont};
  border-radius: ${theme.borderRadius.xl};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: ${theme.transitions.all};

  &:hover {
    background: ${theme.rgba.blackHover};
  }
`;

export const OutlineButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  color: ${theme.colors.logoBlue};
  border: 2px solid ${theme.colors.logoBlue};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: ${theme.transitions.all};

  &:hover {
    background: ${theme.rgba.blueFocus};
  }
`;

export const QRCodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background: ${theme.colors.lightGrey};
  border-radius: ${theme.borderRadius.lg};
  margin: 1.5rem 0;
`;

export const QRCodeImage = styled.img`
  width: 150px;
  height: 150px;
  margin-bottom: 1rem;
`;

export const QRCodeLabel = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.mainFont};
  opacity: ${theme.opacity.subtle};
  text-align: center;
  margin: 0.5rem 0 0;
`;

export const VerifactuBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(2, 194, 104, 0.15);
  color: ${theme.colors.successGreen};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
`;

export const FiltersCard = styled(Card)`
  ${media.lg} {
    grid-row: span 2;
  }
`;

export const FiltersTitle = styled.h3`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.mainFont};
  margin: 0 0 1.5rem;
`;

export const FilterGroup = styled.div`
  margin-bottom: 1.5rem;
  &:last-of-type { margin-bottom: 0; }
`;