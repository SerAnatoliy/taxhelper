import { useState, useEffect, useRef } from 'react';
import { AnyIcon } from '../Shared/AnyIcon/AnyIcon';
import { sendChatMessage } from '../../services/api';
import SendMessageIcon from '../../assets/icons/SendMessage.svg?react';

import {
  ChatContainer,
  ChatHeader,
  ChatTitle,
  NewChatButton,
  MessagesContainer,
  MessageBubble,
  MessageRole,
  MessageContent,
  ResponseCard,
  ResponseCardTitle,
  DeductionsGrid,
  DeductionItem,
  SuggestionsList,
  ModeloTags,
  ModeloTag,
  OffTopicBadge,
  TypingIndicator,
  TypingDot,
  InputContainer,
  ChatInput,
  SendButton,
  EmptyState,
} from './AIChat.styles';

const AIChat = ({ userName = 'there' }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `Hi ${userName}! I'm your AI Tax Advisor. Ask me anything about Spanish taxes, IVA, IRPF, deductions, or your autónomo obligations.`,
      response_data: null
    }]);
  }, [userName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const message = inputValue.trim();
    if (!message || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(message, conversationId);
      
      if (!conversationId) {
        setConversationId(response.conversation_id);
      }

      const assistantMessage = {
        id: response.id,
        role: 'assistant',
        content: response.content,
        response_data: response.response_data,
        is_off_topic: response.is_off_topic
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        response_data: null
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `Hi ${userName}! Starting a new conversation. How can I help you with your taxes today?`,
      response_data: null
    }]);
    setConversationId(null);
  };

  const renderResponseData = (data) => {
    if (!data) return null;

    return (
      <>
        {data.deductions && Object.keys(data.deductions).length > 0 && (
          <ResponseCard>
            <ResponseCardTitle>📊 Deductions</ResponseCardTitle>
            <DeductionsGrid>
              {Object.entries(data.deductions).map(([key, value]) => (
                <DeductionItem key={key}>
                  {key}: <span>{value}%</span>
                </DeductionItem>
              ))}
            </DeductionsGrid>
          </ResponseCard>
        )}

        {data.estimated_tax != null && (
          <ResponseCard>
            <ResponseCardTitle>💰 Estimated Tax</ResponseCardTitle>
            <DeductionItem>
              <span>€{data.estimated_tax.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
            </DeductionItem>
          </ResponseCard>
        )}

        {data.suggestions && data.suggestions.length > 0 && (
          <ResponseCard>
            <ResponseCardTitle>💡 Suggestions</ResponseCardTitle>
            <SuggestionsList>
              {data.suggestions.map((suggestion, idx) => (
                <li key={idx}>{suggestion}</li>
              ))}
            </SuggestionsList>
          </ResponseCard>
        )}

        {data.related_modelos && data.related_modelos.length > 0 && (
          <ResponseCard>
            <ResponseCardTitle>📋 Related Forms</ResponseCardTitle>
            <ModeloTags>
              {data.related_modelos.map((modelo, idx) => (
                <ModeloTag key={idx}>Modelo {modelo}</ModeloTag>
              ))}
            </ModeloTags>
          </ResponseCard>
        )}
      </>
    );
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <ChatTitle>AI Tax Advisor</ChatTitle>
        {messages.length > 1 && (
          <NewChatButton onClick={handleNewChat}>
            + New Chat
          </NewChatButton>
        )}
      </ChatHeader>

      <MessagesContainer>
        {messages.length === 0 ? (
          <EmptyState>
            <span style={{ fontSize: '48px' }}>🤖</span>
            <p>Ask me anything about Spanish taxes!</p>
          </EmptyState>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} $role={msg.role}>
              <MessageRole>
                {msg.role === 'user' ? 'You' : 'TaxHelper AI'}
                {msg.is_off_topic && <OffTopicBadge>Off-topic</OffTopicBadge>}
              </MessageRole>
              <MessageContent>{msg.content}</MessageContent>
              {msg.role === 'assistant' && renderResponseData(msg.response_data)}
            </MessageBubble>
          ))
        )}
        
        {isLoading && (
          <TypingIndicator>
            <TypingDot />
            <TypingDot />
            <TypingDot />
          </TypingIndicator>
        )}
        
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputContainer>
        <ChatInput
          type="text"
          placeholder="Ask about taxes, deductions, IVA..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <SendButton onClick={handleSend} disabled={isLoading || !inputValue.trim()}>
          <AnyIcon icon={SendMessageIcon} size="24px" />
        </SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default AIChat;