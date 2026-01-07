import styled from 'styled-components';
import { theme } from '../../../theme';

export const VerificationCard = styled.div`
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: ${theme.borderRadius.xl};
  padding: 2rem;
  text-align: center;
  margin: 1rem 0;
`;

export const IconContainer = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  background: ${({ $success }) => $success ? 'rgba(2, 194, 104, 0.1)' : theme.rgba.blueFocus};
 border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 40px;
    height: 40px;
    color: ${({ $success }) => $success ? theme.colors.successGreen : theme.colors.logoBlue};
  }
`;

export const CardTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.mainFont};
  margin: 0 0 0.5rem;
`;

export const CardText = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.mainFont};
  margin: 0 0 1.5rem;
  line-height: ${theme.typography.lineHeight.relaxed};
`;

export const VerifyButton = styled.button`
  width: 100%;
  max-width: 250px;
  padding: 1rem 2rem;
  background: ${theme.colors.mainButton};
  border: 2px solid transparent;
  border-radius: ${theme.borderRadius.xl};
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.mainFont};
  cursor: pointer;
  transition: ${theme.transitions.button};;

  &:hover {
    border-color: ${theme.colors.logoBlue};
  }

  &:disabled {
    opacity: ${theme.opacity.muted};
    cursor: not-allowed;
  }
`;

export const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
 border-radius: ${theme.borderRadius['2xl']};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  background: ${({ $status }) => {
    switch ($status) {
      case 'approved': return 'rgba(2, 194, 104, 0.2)';
      case 'pending': return 'rgba(252, 202, 58, 0.2)';
      case 'declined': return 'rgba(218, 28, 28, 0.2)';
      default: return 'rgba(0, 0, 0, 0.1)';
    }
  }};
  color: ${({ $status }) => {
    switch ($status) {
      case 'approved': return theme.colors.successGreen;
      case 'pending': return '#B8860B';
      case 'declined': return theme.colors.error;
      default: return theme.colors.mainFont;
    }
  }};
`;

export const VeriffAttribution = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.mainFont};
  margin: 1rem 0 0;
  text-align: center;

  a {
    color: ${theme.colors.logoBlue};
    text-decoration: underline;

    &:hover {
      text-decoration: none;
    }
  }
`;

export const BenefitsList = styled.ul`
  text-align: left;
  margin: 1rem 0;
  padding: 0;
  list-style: none;

  li {
    padding: 0.5rem 0;
    font-size: ${theme.typography.fontSize.base};
    color: ${theme.colors.mainFont};
    display: flex;
    align-items: center;
    gap: 0.5rem;

    svg {
      width: 16px;
      height: 16px;
      color: ${theme.colors.successGreen};
      flex-shrink: 0;
    }
  }
`;