import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnyIcon } from '../AnyIcon/AnyIcon';
import SideMenu from '../../SideMenu/SideMenu';
import { getProfile } from '../../../services/api';

import TaxHelperLogo from '../../../assets/icons/logoTaxHelper.svg?react';
import NotificationActive from '../../../assets/icons/NotificationActive.svg?react';
import NotificationInactive from '../../../assets/icons/NotificationInactive.svg?react';
import UserIconSvg from '../../../assets/icons/UserIcon.svg?react';

import {
  HeaderContainer,
  HeaderLeft,
  LogoText,
  HeaderRight,
  NotificationButton,
  UserInfo,
  UserName,
  UserAvatar,
  MenuButton,
} from './AppHeader.styles';

const AppHeader = ({ 
  userName = null, 
  hasNotifications = false,
  onNotificationClick,
}) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState({ fullName: '' });

  useEffect(() => {
    if (!userName) {
      const loadProfile = async () => {
        try {
          const profile = await getProfile();
          setUser({ fullName: profile.full_name || '' });
        } catch (error) {
          console.error('Failed to load profile:', error);
        }
      };
      loadProfile();
    }
  }, [userName]);

  const displayName = userName || user.fullName || 'Loading...';
  const nameParts = displayName.split(' ');
  const shortName = nameParts[0] || '';
  const lastInitial = nameParts[1]?.charAt(0) || '';

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  const handleNotificationClick = () => {
    if (onNotificationClick) {
      onNotificationClick();
    }
  };

  return (
    <>
      <HeaderContainer>
        <HeaderLeft onClick={handleLogoClick}>
          <AnyIcon icon={TaxHelperLogo} size="40px" />
          <LogoText>TaxHelper</LogoText>
        </HeaderLeft>
        
        <HeaderRight>
          <NotificationButton onClick={handleNotificationClick}>
            <AnyIcon 
              icon={hasNotifications ? NotificationActive : NotificationInactive} 
              size="24px" 
            />
          </NotificationButton>
          
          <UserInfo>
            <UserName>
              {shortName}{lastInitial ? ` ${lastInitial}.` : ''}
            </UserName>
            <UserAvatar>
              <AnyIcon icon={UserIconSvg} size="24px" />
            </UserAvatar>
          </UserInfo>
          
          <MenuButton onClick={() => setIsMenuOpen(true)}>
            <span />
            <span />
            <span />
          </MenuButton>
        </HeaderRight>
      </HeaderContainer>

      <SideMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
      />
    </>
  );
};

export default AppHeader;