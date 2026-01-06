import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { theme, media } from '../../theme';

export const HeaderContainer = styled.header`
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;

  ${media.md} {
    padding: 1rem 2rem;
  }
`;

export const Nav = styled.nav`
  display: none;

  ${media.md} {
    display: flex;
    gap: 2rem;
  }
`;

export const NavLink = styled(Link)`
  text-decoration: none;
  font-weight: ${theme.typography.fontWeight.normal};
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.mainFont};

  &:hover,
  &:focus {
    text-decoration: underline;
  }
`;

export const LoginHeaderButton = styled.div`
  display: none;

  ${media.md} {
    display: flex;
  }
`;

export const BurgerButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: inline-flex;
  z-index: ${theme.zIndex.modal};

  ${media.md} {
    display: none;
  }
`;

export const MobileMenuOverlay = styled.div`
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

  ${media.md} {
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
  transition: transform ${theme.transitions.slow}, opacity ${theme.transitions.slow};
  z-index: ${theme.zIndex.sideMenu};

  ${media.md} {
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
    opacity: ${theme.opacity.subtle};
  }
`;

export const MobileNavLink = styled(Link)`
  color: ${theme.colors.mainFont};
  text-decoration: none;
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.medium};
  text-align: center;

  &:hover,
  &:focus {
    text-decoration: underline;
  }
`;