import { useState } from 'react';
import { ModalOverlay, ModalContent, CloseButton, FormTitle, ErrorText, RegisterLink, RegisterLinkText, FieldsForm } from './LoginModal.styles';
import { login } from '../../../services/api';  
import { AnyIcon } from '../AnyIcon';
import CloseIcon from '../../../assets/icons/CloseIcon.svg?react';
import { TextInput } from '../../Shared/TextInput.jsx';
import { ActionButton } from '../ActionButton';

const LoginModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      localStorage.setItem('token', data.access_token);
      onClose();
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.detail || 'Connection Error');
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay $open={isOpen} onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()} $open={isOpen}>
        <CloseButton onClick={onClose}><AnyIcon icon={CloseIcon} size="36px" /></CloseButton>
        <FormTitle>Login</FormTitle>
        <FieldsForm onSubmit={handleSubmit}>
          <TextInput
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextInput
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <ErrorText>{error}</ErrorText>}
          <ActionButton type="submit" disabled={loading} size="160px">
            {loading ? 'Loading...' : 'Login'}
          </ActionButton>
        </FieldsForm>
        <RegisterLinkText>
          Don't have an account? <RegisterLink href="/register">Register</RegisterLink>
        </RegisterLinkText>
      </ModalContent>
    </ModalOverlay>
  );
};

export default LoginModal;