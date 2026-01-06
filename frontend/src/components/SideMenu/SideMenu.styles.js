import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { theme } from '../../theme';

export const MenuOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${theme.rgba.blackOverlay};
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  visibility: ${({ $open }) => ($open ? 'visible' : 'hidden')};
  transition: opacity ${theme.transitions.slow}, visibility ${theme.transitions.slow};
  z-index: ${theme.zIndex.overlay};
`;

export const MenuPanel = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 280px;
  background: ${theme.colors.mainColor};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1.5rem;
  transform: ${({ $open }) => ($open ? 'translateX(0)' : 'translateX(100%)')};
  transition: transform ${theme.transitions.slow};
  z-index: ${theme.zIndex.sideMenu};
  box-sizing: border-box;

  @media (max-width: 767px) {
    max-width: 100%;
  }
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  color: ${theme.colors.mainFont};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;

  &:hover {
    opacity: ${theme.opacity.subtle};
  }
`;

export const MenuNav = styled.nav`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-top: 2rem;
  flex: 1;
`;

export const MenuLink = styled(Link)`
  color: ${theme.colors.mainFont};
  text-decoration: none;
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.medium};
  font-style: italic;
  text-align: center;
  transition: ${theme.transitions.opacity};

  &:hover,
  &:focus {
    opacity: ${theme.opacity.subtle};
  }
`;

export const FeedbackLink = styled(Link)`
  color: ${theme.colors.mainFont};
  text-decoration: none;
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.medium};
  font-style: italic;
  margin-top: auto;
  padding-bottom: 1rem;
  transition: ${theme.transitions.opacity};

  &:hover,
  &:focus {
    opacity: ${theme.opacity.subtle};
  }
`;