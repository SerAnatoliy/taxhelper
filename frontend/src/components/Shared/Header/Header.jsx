// frontend/src/components/Shared/Header/Header.jsx
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnyIcon } from '../../Shared/AnyIcon.jsx';
import {
  HeaderContainer,
  Nav,
  NavLink,
  BurgerButton,
  MobileMenu,
  MobileNavLink,
  LoginHeaderButton
} from './Header.styles';
import { ActionButton } from '../../Shared/ActionButton.jsx';
import TaxHelperLogo from '../../../assets/icons/logoTaxHelper.svg?react';
import BurgerIcon from '../../../assets/icons/BurgerMenu.svg?react';
import CloseIcon from '../../../assets/icons/CloseIcon.svg?react';
import LoginModal from '../LoginModal/LoginModal.jsx';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const isOnLandingPage = location.pathname === '/';

  // Handles navigation to sections - works from any page
  const handleNavClick = (sectionId, e) => {
    e.preventDefault();
    setIsOpen(false);

    if (isOnLandingPage) {
      // Already on landing page - scroll to section
      scrollToSection(sectionId);
    } else {
      // Navigate to landing page with hash, then scroll
      navigate(`/#${sectionId}`);
      // Small delay to ensure page loads before scrolling
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
        behavior: 'smooth'
      });
    }
  };

  // Handle logo click - go to landing page
  const handleLogoClick = () => {
    if (isOnLandingPage) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <HeaderContainer>
      <div onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
        <AnyIcon icon={TaxHelperLogo} size="64px" />
      </div>

      <Nav>
        <NavLink 
          to="/#features" 
          onClick={(e) => handleNavClick('features', e)}
        >
          Features
        </NavLink>
        <NavLink 
          to="/#pricing" 
          onClick={(e) => handleNavClick('pricing', e)}
        >
          Pricing
        </NavLink>
        <NavLink 
          to="/#blog" 
          onClick={(e) => handleNavClick('blog', e)}
        >
          Blog
        </NavLink>
      </Nav>

      <LoginHeaderButton>
        <ActionButton onClick={() => setShowLogin(true)}>
          Login
        </ActionButton>
      </LoginHeaderButton>

      <BurgerButton onClick={() => setIsOpen(!isOpen)}>
        <AnyIcon icon={isOpen ? CloseIcon : BurgerIcon} size="28px" />
      </BurgerButton>

      <MobileMenu $open={isOpen}>
        <MobileNavLink 
          to="/#features" 
          onClick={(e) => handleNavClick('features', e)}
        >
          Features
        </MobileNavLink>
        <MobileNavLink 
          to="/#pricing" 
          onClick={(e) => handleNavClick('pricing', e)}
        >
          Pricing
        </MobileNavLink>
        <MobileNavLink 
          to="/#blog" 
          onClick={(e) => handleNavClick('blog', e)}
        >
          Blog
        </MobileNavLink>
        <ActionButton onClick={() => { setShowLogin(true); setIsOpen(false); }}>
          Login
        </ActionButton>
      </MobileMenu>
      
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </HeaderContainer>
  );
};

export default Header;