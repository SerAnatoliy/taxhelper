import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { theme } from '../../theme';

export const HeaderContainer = styled.header`
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;

  @media (min-width: 768px) {
    padding: 1rem 2rem;
  }
`;

export const Nav = styled.nav`
  display: none;

  @media (min-width: 768px) {
    display: flex;
    gap: 2rem;
  }
`;

export const NavLink = styled(Link)`
  text-decoration: none;
  font-weight: 400;
  font-size: 18px;
  color: ${theme.colors.mainFont};

  &:hover,
  &:focus {
    text-decoration: underline;
  }
`;

export const LoginHeaderButton = styled.div`
  display: none;

  @media (min-width: 768px) {
    display: flex;
  }
`;

export const BurgerButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: inline-flex;
  z-index: 1100;

  @media (min-width: 768px) {
    display: none;
  }
`;

export const MobileMenuOverlay = styled.div`
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

  @media (min-width: 768px) {
    display: none;
  }
`;

export const MobileMenu = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${theme.colors.mainColor};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 2rem;
  transform: ${({ $open }) => ($open ? 'translateX(0)' : 'translateX(100%)')};
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  transition: transform 0.3s ease, opacity 0.3s ease;
  z-index: 1001;

  @media (min-width: 768px) {
    display: none;
  }
`;

export const MobileCloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
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

export const MobileNavLink = styled(Link)`
  color: ${theme.colors.mainFont};
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: 500;
  text-align: center;

  &:hover,
  &:focus {
    text-decoration: underline;
  }
`;