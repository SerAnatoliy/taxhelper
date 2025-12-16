import { useState } from 'react';
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

const scrollToSection = (sectionId, e) => {
    e.preventDefault();  
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
    setIsOpen(false);
  };
  return (
    <HeaderContainer>
      <AnyIcon icon={TaxHelperLogo} size="64px" />

      <Nav>
        <NavLink to="#features" onClick={(e) => scrollToSection('features', e)}>Features</NavLink>
        <NavLink to="#pricing" onClick={(e) => scrollToSection('pricing', e)}>Pricing</NavLink>
        {/* <NavLink to="#blog" onClick={(e) => scrollToSection('blog', e)}>Blog</NavLink> */}
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
        <MobileNavLink to="#features" onClick={(e) => scrollToSection('features', e)}>
          Features
        </MobileNavLink>
        <MobileNavLink to="#pricing" onClick={(e) => scrollToSection('pricing', e)}>
          Pricing
        </MobileNavLink>
        {/* <MobileNavLink to="#blog" onClick={(e) => scrollToSection('blog', e)}>
          Blog
        </MobileNavLink> */}
        <MobileNavLink to="/login" onClick={() => setIsOpen(false)}>
          Login
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