import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { theme } from '../../theme';

export const MenuOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  visibility: ${({ $open }) => ($open ? 'visible' : 'hidden')};
  transition: opacity 0.3s ease, visibility 0.3s ease;
  z-index: 1000;
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
  transition: transform 0.3s ease;
  z-index: 1001;
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
    opacity: 0.7;
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
  font-size: 1.25rem;
  font-weight: 500;
  font-style: italic;
  text-align: center;
  transition: opacity 0.2s ease;

  &:hover,
  &:focus {
    opacity: 0.7;
  }
`;

export const FeedbackLink = styled(Link)`
  color: ${theme.colors.mainFont};
  text-decoration: none;
  font-size: 1.125rem;
  font-weight: 500;
  font-style: italic;
  margin-top: auto;
  padding-bottom: 1rem;
  transition: opacity 0.2s ease;

  &:hover,
  &:focus {
    opacity: 0.7;
  }
`;