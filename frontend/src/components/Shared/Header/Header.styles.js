import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { theme } from '../../../theme';  

export const HeaderContainer = styled.header`
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
`;
export const Nav = styled.nav`
  display: none;

  @media (min-width: 768px) {
    display: flex;
    gap: 2rem;
  }
`;
export const LoginHeaderButton = styled.div`
  display: none;
 @media (min-width: 768px) {
  display: flex;
  }
`;
export const NavLink = styled(Link)`
  text-decoration: none;
  font-weight: 400;
  font-size: 18px;

  &:hover,
  &:focus {
    text-decoration: underline;
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

export const MobileMenu = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 50%;

  background: ${theme.colors.mainColor};
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem 1.5rem;
  transform: ${({ $open }) => ($open ? 'translateY(0)' : 'translateY(-10px)')};
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  pointer-events: ${({ $open }) => ($open ? 'auto' : 'none')};
  transition: all 0.25s ease;
  z-index: 1000;

  @media (min-width: 768px) {
    display: none;
  }
`;

export const MobileNavLink = styled(Link)`
  color: ${theme.colors.textWhite};
  text-decoration: none;
  font-size: 1.25rem;
  font-weight: 600;
`;