import { useNavigate } from 'react-router-dom';
import { AnyIcon } from '../Shared/AnyIcon/AnyIcon';
import { SubmitButton } from '../Shared/ActionButton/ActionButton';
import CloseIconSvg from '../../assets/icons/CloseIcon.svg?react';
import {
  MenuOverlay,
  MenuPanel,
  CloseButton,
  MenuNav,
  MenuLink,
  FeedbackLink,
} from './SideMenu.styles';

const SideMenu = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    onClose();
    navigate('/');
  };

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <>
      <MenuOverlay $open={isOpen} onClick={onClose} />
      <MenuPanel $open={isOpen}>
        <CloseButton onClick={onClose}>
          <AnyIcon icon={CloseIconSvg} size="24px" />
        </CloseButton>

        <MenuNav>
          <MenuLink to="/dashboard" onClick={handleLinkClick}>
            Dashboard
          </MenuLink>
          <MenuLink to="/income" onClick={handleLinkClick}>
            Income
          </MenuLink>
          <MenuLink to="/expenses" onClick={handleLinkClick}>
            Expenses
          </MenuLink>
          <MenuLink to="/reports" onClick={handleLinkClick}>
            Reports
          </MenuLink>
          <MenuLink to="/profile" onClick={handleLinkClick}>
            Profile
          </MenuLink>
          <MenuLink to="/settings" onClick={handleLinkClick}>
            Settings
          </MenuLink>
          <MenuLink to="/help" onClick={handleLinkClick}>
            Help
          </MenuLink>

          <SubmitButton 
            onClick={handleLogout}
            padding="0.625rem 2rem"
          >
            Logout
          </SubmitButton>
        </MenuNav>

        <FeedbackLink to="/feedback" onClick={handleLinkClick}>
          Feedback
        </FeedbackLink>
      </MenuPanel>
    </>
  );
};

export default SideMenu;