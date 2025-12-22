import styled, { keyframes } from 'styled-components';
import { theme } from '../../theme';

export const ChatContainer = styled.div`
  background: ${theme.colors.white};
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

export const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

export const ChatTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: ${theme.colors.mainFont};
  margin: 0;

  @media (min-width: 768px) {
    font-size: 24px;
  }
`;

export const NewChatButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.logoBlue};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

export const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-right: 0.5rem;
  margin-bottom: 1rem;
  min-height: 0;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }
`;

export const MessageBubble = styled.div`
  max-width: 85%;
  padding: 0.75rem 1rem;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
  
  ${({ $role }) => $role === 'user' ? `
    align-self: flex-end;
    background: ${theme.colors.secondaryButton};
    color: ${theme.colors.mainFont};
    border-bottom-right-radius: 4px;
  ` : `
    align-self: flex-start;
    background: ${theme.colors.lightGrey};
    color: ${theme.colors.mainFont};
    border-bottom-left-radius: 4px;
  `}
`;

export const MessageRole = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${theme.colors.mainFont};
  opacity: 0.6;
  display: block;
  margin-bottom: 0.25rem;
`;

export const MessageContent = styled.p`
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
`;

export const ResponseCard = styled.div`
  background: rgba(231, 248, 255, 0.5);
  border-radius: 8px;
  padding: 0.75rem;
  margin-top: 0.75rem;
`;

export const ResponseCardTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${theme.colors.logoBlue};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

export const DeductionsGrid = styled.div`
  display: flex;
  gap: 1rem;
`;

export const DeductionItem = styled.div`
  font-size: 13px;
  color: ${theme.colors.mainFont};
  
  span {
    font-weight: 600;
  }
`;

export const SuggestionsList = styled.ul`
  margin: 0;
  padding-left: 1.25rem;
  font-size: 13px;
  color: ${theme.colors.mainFont};
  
  li {
    margin-bottom: 0.25rem;
  }
`;

export const ModeloTags = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

export const ModeloTag = styled.span`
  background: ${theme.colors.mainButton};
  color: ${theme.colors.mainFont};
  font-size: 11px;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
`;

export const OffTopicBadge = styled.span`
  background: #ffebee;
  color: ${theme.colors.error};
  font-size: 11px;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  margin-left: 0.5rem;
`;

const bounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-6px); }
`;

export const TypingIndicator = styled.div`
  align-self: flex-start;
  display: flex;
  gap: 4px;
  padding: 0.75rem 1rem;
  background: ${theme.colors.lightGrey};
  border-radius: 16px;
  border-bottom-left-radius: 4px;
`;

export const TypingDot = styled.span`
  width: 8px;
  height: 8px;
  background: ${theme.colors.mainFont};
  opacity: 0.4;
  border-radius: 50%;
  animation: ${bounce} 1.4s ease-in-out infinite;
  
  &:nth-child(1) { animation-delay: 0s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.4s; }
`;

export const InputContainer = styled.div`
  display: flex;
  align-items: center;
  background: ${theme.colors.white};
  border: 2px solid ${theme.colors.mainFont};
  border-radius: 24px;
  padding: 0.5rem 1rem;
`;

export const ChatInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: ${theme.colors.mainFont};
  background: transparent;

  &::placeholder {
    color: ${theme.colors.mainFont};
    opacity: 0.6;
  }
  
  &:disabled {
    opacity: 0.5;
  }
`;

export const SendButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  svg {
    width: 24px;
    height: 24px;
    color: ${theme.colors.mainFont};
  }
`;

export const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.mainFont};
  opacity: 0.6;
  text-align: center;
  padding: 2rem;
  
  p {
    margin: 0.5rem 0 0;
    font-size: 14px;
  }
`;