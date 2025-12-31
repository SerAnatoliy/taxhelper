import styled from 'styled-components';
import { theme } from '../../../theme';

export const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  width: 100%;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: 1rem 2rem;
  }
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
`;

export const LogoText = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${theme.colors.mainFont};
  display: none;

  @media (min-width: 768px) {
    display: block;
  }
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const NotificationButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 24px;
    height: 24px;
    color: ${theme.colors.mainFont};
  }
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const UserName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.mainFont};
  display: none;

  @media (min-width: 768px) {
    display: block;
  }
`;

export const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${theme.colors.white};
  border: 2px solid ${theme.colors.mainFont};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 24px;
    height: 24px;
    color: ${theme.colors.mainFont};
  }
`;

export const MenuButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  span {
    display: block;
    width: 24px;
    height: 3px;
    background: ${theme.colors.mainFont};
    border-radius: 2px;
  }
`;