import styled from 'styled-components';
import { theme } from '../../../theme';

export const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
`;

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: ${({ $minWidth }) => $minWidth || '500px'};
`;

export const TableHead = styled.thead`
  background: ${theme.rgba.blueLight};
`;

export const TableHeaderCell = styled.th`
  padding: 0.75rem 1rem;
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.mainFont};
  text-align: ${({ $align }) => $align || 'left'};
  border: 1px solid ${theme.colors.mainFont};

  &:last-child {
    text-align: center;
  }
`;

export const TableBody = styled.tbody``;

export const TableRow = styled.tr`
  &:hover {
    background: ${theme.rgba.yellowHover};
  }
`;

export const TableCell = styled.td`
  padding: 0.75rem 1rem;
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.mainFont};
  text-align: ${({ $align }) => $align || 'left'};
  border: 1px solid ${theme.colors.mainFont};

  &:last-child {
    text-align: center;
  }
`;

export const ActionIconsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

export const ActionIconButton = styled.button`
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

  &:disabled {
    opacity: ${theme.opacity.overlay};
    cursor: not-allowed;
  }

  svg {
    width: 20px;
    height: 20px;
    color: ${theme.colors.mainFont};
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${theme.colors.mainFont};
  opacity: ${theme.opacity.subtle};
`;

export const LoadingState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${theme.colors.mainFont};
`;

export const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  text-transform: capitalize;

  ${({ $status, $variant }) => {
    const statusKey = $status?.toLowerCase() || $variant;
    
    switch (statusKey) {
      case 'paid':
      case 'accepted':
      case 'success':
        return `
          background: ${theme.rgba.successBg};
          color: #4CAF50;
        `;
      case 'pending':
        return `
          background: rgba(255, 152, 0, 0.15);
          color: #FF9800;
        `;
      case 'overdue':
      case 'rejected':
      case 'error':
        return `
          background: ${theme.rgba.deleteBg};
          color: #f44336;
        `;
      case 'submitted':
        return `
          background: rgba(1, 98, 187, 0.15);
          color: ${theme.colors.logoBlue};
        `;
      case 'draft':
      default:
        return `
          background: rgba(51, 51, 51, 0.1);
          color: ${theme.colors.mainFont};
        `;
    }
  }}
`;