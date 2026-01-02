import styled from 'styled-components';
import { theme } from '../../theme';
import { SubmitButton } from '../Shared/ActionButton/ActionButton';

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 1000;
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
  border-radius: 16px;
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
  opacity: 0.7;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;

export const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: ${theme.colors.mainFont};
  margin: 0 0 1.5rem;
  text-align: center;
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const FormSection = styled.div`
  margin-bottom: 1rem;
`;

export const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
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
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.mainFont};
  margin-bottom: 0.5rem;
`;

export const TextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 0.75rem 1rem;
  font-size: 16px;
  font-family: inherit;
  color: ${theme.colors.mainFont};
  background: ${theme.colors.lightGrey};
  border: 2px solid transparent;
  border-radius: 12px;
  box-sizing: border-box;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${theme.colors.logoBlue};
  }

  &::placeholder {
    color: ${theme.colors.mainFont};
    opacity: 0.5;
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
  font-size: 14px;
  font-weight: 600;
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
  font-size: 14px;
  color: ${theme.colors.mainFont};
  background: ${theme.colors.lightGrey};
  border: 2px solid transparent;
  border-radius: 8px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${theme.colors.logoBlue};
  }
`;

export const AmountCell = styled.td`
  font-weight: 600;
  color: ${theme.colors.mainFont};
  text-align: right;
  padding-right: 1rem;
  min-width: 100px;
`;

export const RemoveItemButton = styled.button`
  background: rgba(218, 28, 28, 0.1);
  color: ${theme.colors.error};
  border: none;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s ease;

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
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(1, 98, 187, 0.1);
  }
`;

export const TotalSection = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
  background: ${theme.colors.lightGrey};
  border-radius: 12px;
  margin-top: 1rem;
`;

export const TotalAmount = styled.div`
  font-size: 20px;
  font-weight: 700;
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
  font-size: 12px;
  color: ${theme.colors.error};
  margin-top: 4px;
  display: block;
`;

export const PreviewContainer = styled.div`
  background: ${theme.colors.lightGrey};
  padding: 1.5rem;
  border-radius: 12px;
`;

export const PreviewInvoice = styled.div`
  background: ${theme.colors.white};
  padding: 2rem;
  max-width: 700px;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
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
    font-size: 1.25rem;
    font-weight: 700;
    color: ${theme.colors.mainFont};
    margin: 0 0 0.5rem;
  }

  p {
    margin: 0.25rem 0;
    color: ${theme.colors.mainFont};
    opacity: 0.8;
    font-size: 0.875rem;
  }
`;

export const PreviewMeta = styled.div`
  text-align: right;
  
  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${theme.colors.logoBlue};
    margin: 0 0 0.5rem;
  }
  
  p {
    margin: 0.25rem 0;
    font-size: 0.875rem;
    color: ${theme.colors.mainFont};
  }
`;

export const PreviewClient = styled.div`
  margin-bottom: 2rem;
  
  h3 {
    font-size: 0.875rem;
    font-weight: 600;
    color: ${theme.colors.mainFont};
    margin: 0 0 0.5rem;
    text-transform: uppercase;
  }
  
  p {
    margin: 0.25rem 0;
    font-size: 0.875rem;
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
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    border-bottom: 2px solid #e5e7eb;
  }
  
  td {
    padding: 0.75rem;
    font-size: 0.875rem;
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
  border-radius: 8px;
  text-align: right;
  
  span {
    font-size: 0.875rem;
    color: ${theme.colors.mainFont};
  }
  
  strong {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: ${theme.colors.logoBlue};
    margin-top: 0.25rem;
  }
`;

export const PreviewFooter = styled.div`
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  
  p {
    font-size: 0.75rem;
    color: ${theme.colors.mainFont};
    opacity: 0.7;
    margin: 0;
  }
`;