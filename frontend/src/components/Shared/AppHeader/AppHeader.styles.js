import styled from 'styled-components';
import { theme, media } from '../../../theme';

export const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  width: 100%;
  box-sizing: border-box;

  ${media.md} {
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
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.mainFont};
  display: none;

  ${media.md} {
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
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.mainFont};
  display: none;

  ${media.md} {
    display: block;
  }
`;

export const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
 border-radius: ${theme.borderRadius.full};
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
    border-radius: ${theme.borderRadius.sm};
  }
`;