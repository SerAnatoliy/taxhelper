import styled from 'styled-components';
import { theme } from '../../../theme';

export const SummaryCardContainer = styled.div`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.xl};
  padding: 1.5rem;
`;

export const SummaryTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.mainFont};
  margin: 0 0 1rem;
`;

export const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);

  &:last-child {
    border-bottom: none;
    font-weight: ${theme.typography.fontWeight.semibold};
  }
`;

export const SummaryLabel = styled.span`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.mainFont};
`;

export const SummaryValue = styled.span`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${({ $highlight, $variant }) => {
    if ($variant === 'success') return theme.colors.successGreen;
    if ($variant === 'error') return theme.colors.error;
    if ($variant === 'warning') return theme.colors.warningOrange;
    if ($highlight) return theme.colors.logoBlue;
    return theme.colors.mainFont;
  }};
`;