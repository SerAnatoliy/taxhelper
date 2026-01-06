import styled from 'styled-components';
import { theme, media } from '../../theme';
import { SubmitButton } from '../Shared/ActionButton/ActionButton';

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${theme.rgba.blackOverlayDark};
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: ${theme.zIndex.overlay};
  padding: 1rem;
  overflow-y: auto;
    ${({ $isOpen }) => $isOpen && `
    body {
      overflow: hidden;
    }
  `}
`;

export const ModalContent = styled.div`
  background: ${theme.colors.white};
  order-radius: ${theme.borderRadius.xl};
  padding: 2rem;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${theme.opacity.subtle};
  transition: ${theme.transitions.opacity};

  &:hover {
    opacity: ${theme.opacity.full};
  }
`;

export const ModalTitle = styled.h2`
    font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.mainFont};
  margin: 0 0 1.5rem;
  text-align: center;
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  ${media.md} {
    grid-template-columns: 1fr 1fr;
  }
`;

export const FormSection = styled.div`
  margin-bottom: 1rem;
`;

export const SectionTitle = styled.h3`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.mainFont};
  margin: 0 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid ${theme.colors.logoBlue};
`;

export const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

export const Label = styled.label`
  display: block;
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.mainFont};
  margin-bottom: 0.5rem;
`;

export const TextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 0.75rem 1rem;
  font-size: ${theme.typography.fontSize.md};
  font-family: inherit;
  color: ${theme.colors.mainFont};
  background: ${theme.colors.lightGrey};
  border: 2px solid transparent;
  border-radius: ${theme.borderRadius.lg};
  box-sizing: border-box;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${theme.colors.logoBlue};
  }

  &::placeholder {
    color: ${theme.colors.mainFont};
    opacity: ${theme.opacity.overlayDark};
  }
`;

export const ItemsSection = styled.div`
  grid-column: 1 / -1;
`;

export const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
`;

export const TableHeader = styled.th`
  background: ${theme.colors.lightGrey};
  padding: 0.75rem;
  text-align: left;
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.mainFont};
  border-bottom: 2px solid #e5e7eb;

  &:last-child {
    text-align: right;
  }
`;

export const TableCell = styled.td`
  padding: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

export const TableInput = styled.input`
  width: 100%;
  height: 40px;
  padding: 0 0.75rem;
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.mainFont};
  background: ${theme.colors.lightGrey};
  border: 2px solid transparent;
  border-radius: ${theme.borderRadius.md};
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${theme.colors.logoBlue};
  }
`;

export const AmountCell = styled.td`
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.mainFont};
  text-align: right;
  padding-right: 1rem;
  min-width: 100px;
`;

export const RemoveItemButton = styled.button`
  background: ${theme.rgba.errorBg};
  color: ${theme.colors.error};
  border: none;
  padding: 0.375rem 0.75rem;
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  font-size: ${theme.typography.fontSize.base};
  transition: background ${theme.transitions.default};

  &:hover {
    background: rgba(218, 28, 28, 0.2);
  }
`;

export const AddItemButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${theme.colors.secondaryButton};
  color: ${theme.colors.logoBlue};
  border: 2px dashed ${theme.colors.logoBlue};
  padding: 0.5rem 1rem;
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  transition: background ${theme.transitions.default};

  &:hover {
    background: ${theme.rgba.blueFocus};
  }
`;

export const TotalSection = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
  background: ${theme.colors.lightGrey};
  border-radius: ${theme.borderRadius.lg};
  margin-top: 1rem;
`;

export const TotalAmount = styled.div`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.mainFont};

  span {
    color: ${theme.colors.logoBlue};
  }
`;

export const TermsSection = styled.div`
  grid-column: 1 / -1;
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  justify-content: flex-end;
`;

export const CancelButton = styled(SubmitButton)`
  background: rgba(255, 255, 255, 0.5);
  border: 2px solid ${theme.colors.mainFont};

  &:hover,
  &:focus {
    border-color: ${theme.colors.logoBlue};
    background: rgba(255, 255, 255, 0.7);
  }
`;

export const GenerateButton = styled(SubmitButton)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const ErrorText = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.error};
  margin-top: 4px;
  display: block;
`;

export const PreviewContainer = styled.div`
  background: ${theme.colors.lightGrey};
  padding: 1.5rem;
  border-radius: ${theme.borderRadius.lg};
`;

export const PreviewInvoice = styled.div`
  background: ${theme.colors.white};
  padding: 2rem;
  max-width: 700px;
  margin: 0 auto;
  box-shadow: ${theme.shadows.md};
  border-radius: ${theme.borderRadius.md};
`;

export const PreviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid ${theme.colors.logoBlue};
`;

export const PreviewBusiness = styled.div`
  h1 {
    font-size: ${theme.typography.fontSize.xl};
    font-weight: ${theme.typography.fontWeight.bold};
    color: ${theme.colors.mainFont};
    margin: 0 0 0.5rem;
  }

  p {
    margin: 0.25rem 0;
    color: ${theme.colors.mainFont};
    opacity: ${theme.opacity.hover};
    font-size: ${theme.typography.fontSize.base};
  }
`;

export const PreviewMeta = styled.div`
  text-align: right;
  
  h2 {
    font-size: ${theme.typography.fontSize['2xl']};
    font-weight: ${theme.typography.fontWeight.bold};
    color: ${theme.colors.logoBlue};
    margin: 0 0 0.5rem;
  }
  
  p {
    margin: 0.25rem 0;
    font-size: ${theme.typography.fontSize.base};
    color: ${theme.colors.mainFont};
  }
`;

export const PreviewClient = styled.div`
  margin-bottom: 2rem;
  
  h3 {
    font-size: ${theme.typography.fontSize.base};
    font-weight: ${theme.typography.fontWeight.semibold};
    color: ${theme.colors.mainFont};
    margin: 0 0 0.5rem;
    text-transform: uppercase;
  }
  
  p {
    margin: 0.25rem 0;
    font-size: ${theme.typography.fontSize.base};
    color: ${theme.colors.mainFont};
  }
`;

export const PreviewTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.5rem;
  
  th {
    background: ${theme.colors.lightGrey};
    padding: 0.75rem;
    text-align: left;
    font-size: ${theme.typography.fontSize.sm};
    font-weight: ${theme.typography.fontWeight.semibold};
    text-transform: uppercase;
    border-bottom: 2px solid #e5e7eb;
  }
  
  td {
    padding: 0.75rem;
    font-size: ${theme.typography.fontSize.base};
    border-bottom: 1px solid #e5e7eb;
  }
  
  th:last-child,
  td:last-child {
    text-align: right;
  }
`;

export const PreviewTotalRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const PreviewTotalBox = styled.div`
  background: ${theme.colors.lightGrey};
  padding: 1rem 1.5rem;
  border-radius: ${theme.borderRadius.md};
  text-align: right;
  
  span {
    font-size: ${theme.typography.fontSize.base};
    color: ${theme.colors.mainFont};
  }
  
  strong {
    display: block;
    font-size: ${theme.typography.fontSize['2xl']};
    font-weight: ${theme.typography.fontWeight.bold};
    color: ${theme.colors.logoBlue};
    margin-top: 0.25rem;
  }
`;

export const PreviewFooter = styled.div`
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  
  p {
    font-size: ${theme.typography.fontSize.sm};
    color: ${theme.colors.mainFont};
    opacity: ${theme.opacity.subtle};
    margin: 0;
  }
`;