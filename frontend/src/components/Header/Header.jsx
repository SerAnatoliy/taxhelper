import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnyIcon } from '../Shared/AnyIcon.jsx';
import {
  HeaderContainer,
  Nav,
  NavLink,
  BurgerButton,
  MobileMenuOverlay,
  MobileMenu,
  MobileCloseButton,
  MobileNavLink,
  LoginHeaderButton,
} from './Header.styles.js';
import { ActionButton } from '../Shared/ActionButton.jsx';
import TaxHelperLogo from '../../assets/icons/logoTaxHelper.svg?react';
import BurgerIcon from '../../assets/icons/BurgerMenu.svg?react';
import LoginModal from '../LoginModal/LoginModal.jsx';

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const isOnLandingPage = location.pathname === '/';

  const handleNavClick = (sectionId, e) => {
    e.preventDefault();
    setIsOpen(false);

    if (isOnLandingPage) {
      scrollToSection(sectionId);
    } else {
      navigate(`/#${sectionId}`);
      setTimeout(() => {
        scrollToSection(sectionId);
      }, 100);
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleLogoClick = () => {
    if (isOnLandingPage) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const handleMobileLogin = () => {
    setIsOpen(false);
    setShowLogin(true);
  };

  return (
    <HeaderContainer>
      <div onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
        <AnyIcon icon={TaxHelperLogo} size="64px" />
      </div>

      
      <Nav>
        <NavLink to="/#features" onClick={(e) => handleNavClick('features', e)}>
          Features
        </NavLink>
        <NavLink to="/#pricing" onClick={(e) => handleNavClick('pricing', e)}>
          Pricing
        </NavLink>
        <NavLink to="/#blog" onClick={(e) => handleNavClick('blog', e)}>
          Blog
        </NavLink>
      </Nav>

      <LoginHeaderButton>
        <ActionButton onClick={() => setShowLogin(true)}>Login</ActionButton>
      </LoginHeaderButton>

      
      <BurgerButton onClick={() => setIsOpen(true)}>
        <AnyIcon icon={BurgerIcon} size="28px" />
      </BurgerButton>

     
      <MobileMenuOverlay $open={isOpen} onClick={() => setIsOpen(false)} />

     
      <MobileMenu $open={isOpen}>
        <MobileCloseButton onClick={() => setIsOpen(false)}>
          <CloseIcon />
        </MobileCloseButton>

        <MobileNavLink to="/#features" onClick={(e) => handleNavClick('features', e)}>
          Features
        </MobileNavLink>
        <MobileNavLink to="/#pricing" onClick={(e) => handleNavClick('pricing', e)}>
          Pricing
        </MobileNavLink>
        <MobileNavLink to="/#blog" onClick={(e) => handleNavClick('blog', e)}>
          Blog
        </MobileNavLink>

        <ActionButton onClick={handleMobileLogin} width="140px">
          Login
        </ActionButton>
      </MobileMenu>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </HeaderContainer>
  );
};

export default Header;