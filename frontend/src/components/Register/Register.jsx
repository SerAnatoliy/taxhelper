import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { SubmitButton } from '../Shared/ActionButton/ActionButton';
import { register } from '../../services/api';
import LoginModal from '../LoginModal/LoginModal';
import {
  PageTitle,
  PageSubtitle,
  FormLink,
  GradientPageContainer,
  FormContainer,
} from '../Shared/FormComponents/FormComponents.styles';
import { FormCheckbox, FormInput } from '../Shared/FormComponents/FormComponents';
import {
  MainContent,
  FormFieldsContainer,
  NameFieldsRow,
  PasswordFieldsContainer,
  PasswordRequirements,
  RequirementItem,
  ButtonContainer,
  LoginText,
  ErrorMessage,
} from './Register.styles';

const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (pwd) => pwd.length >= 8 },
  { id: 'uppercase', label: 'One uppercase letter (A-Z)', test: (pwd) => /[A-Z]/.test(pwd) },
  { id: 'lowercase', label: 'One lowercase letter (a-z)', test: (pwd) => /[a-z]/.test(pwd) },
  { id: 'number', label: 'One number (0-9)', test: (pwd) => /\d/.test(pwd) },
  {
    id: 'special',
    label: 'One special character (!@#$%...)',
    test: (pwd) => /[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>/?]/.test(pwd),
  },
];

const Registration = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const prefilledEmail = location.state?.email || '';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: prefilledEmail,
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const validatePassword = (password) => {
    const failedRules = PASSWORD_RULES.filter((rule) => !rule.test(password));
    return failedRules.length === 0 ? null : 'Password does not meet all requirements';
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the Terms & Conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
      const response = await register(fullName, formData.email, formData.password);

      localStorage.setItem('token', response.access_token);

      navigate('/onboarding');
    } catch (error) {
      console.error('Registration error:', error);

      if (error.response?.status === 400) {
        const detail = error.response.data?.detail;
        if (detail?.includes('Email already registered')) {
          setErrors({ email: 'This email is already registered' });
        } else if (detail) {
          setErrors({ submit: detail });
        } else {
          setErrors({ submit: 'Registration failed. Please check your information.' });
        }
      } else {
        setErrors({ submit: 'Registration failed. Please try again later.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkboxLabel = (
    <>
      I agree to Terms & Conditions and <FormLink to="/privacy">Privacy Policy</FormLink>
    </>
  );

  return (
    <GradientPageContainer>
      <Header />
      <MainContent>
        <FormContainer as="form" onSubmit={handleSubmit}>
          <PageTitle>Sign up for TaxHelper</PageTitle>
          <PageSubtitle>
            Create your account in 2 minutes to simplify your taxes. Get started with our 15-day
            free trial – no card required.
          </PageSubtitle>

          <FormFieldsContainer>
            <NameFieldsRow>
              <FormInput
                type="text"
                name="firstName"
                placeholder="First Name*"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
              />
              <FormInput
                type="text"
                name="lastName"
                placeholder="Last Name*"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
              />
            </NameFieldsRow>

            <FormInput
              type="email"
              name="email"
              placeholder="Enter your email*"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />

            <PasswordFieldsContainer>
              <FormInput
                type="password"
                name="password"
                placeholder="Password*"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setShowPasswordRules(true)}
                onBlur={() => setShowPasswordRules(false)}
                error={errors.password}
                showPasswordToggle
              />

              {(showPasswordRules || formData.password) && (
                <PasswordRequirements>
                  {PASSWORD_RULES.map((rule) => (
                    <RequirementItem key={rule.id} $met={rule.test(formData.password)}>
                      {rule.test(formData.password) ? '✓' : '○'} {rule.label}
                    </RequirementItem>
                  ))}
                </PasswordRequirements>
              )}

              <FormInput
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password*"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                showPasswordToggle
              />
            </PasswordFieldsContainer>

            <FormCheckbox
              id="agreeToTerms"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              label={checkboxLabel}
              error={errors.agreeToTerms}
            />

            {errors.submit && <ErrorMessage>{errors.submit}</ErrorMessage>}

            <ButtonContainer>
              <SubmitButton
                type="submit"
                disabled={isSubmitting}
                width="200px"
                padding="0.75rem 2rem"
              >
                {isSubmitting ? 'Registering...' : 'Register'}
              </SubmitButton>
            </ButtonContainer>

            <LoginText>
              Already registered?{' '}
              <FormLink as="button" type="button" onClick={() => setShowLoginModal(true)}>
                Login
              </FormLink>
            </LoginText>
          </FormFieldsContainer>
        </FormContainer>
      </MainContent>
      <Footer />

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </GradientPageContainer>
  );
};

export default Registration;