// frontend/src/components/Registration/Registration.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../Shared/Header/Header';
import Footer from '../Shared/Footer/Footer';
import { SubmitButton } from '../Shared/ActionButton';
import { register } from '../../services/api';
import { theme } from '../../theme';
import LoginModal from '../Shared/LoginModal/LoginModal';
import {
  PageTitle,
  PageSubtitle,
  FormInput,
  FormCheckbox,
  FormLink,
  GradientPageContainer,
  FormContainer,
} from '../Shared/FormComponents';

// ============ LOCAL STYLES ============
const MainContent = styled.main`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem 1rem;

  @media (min-width: 768px) {
    padding: 3rem 2rem;
  }
`;

const FormFieldsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const NameFieldsRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (min-width: 768px) {
    flex-direction: row;
    gap: 1.5rem;

    > div {
      flex: 1;
    }
  }
`;

const PasswordFieldsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (min-width: 768px) {
    max-width: 320px;
  }
`;

const PasswordRequirements = styled.ul`
  margin: 0;
  padding: 0.75rem 1rem;
  list-style: none;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  font-size: 13px;
`;

const RequirementItem = styled.li`
  color: ${({ $met }) => ($met ? theme.colors.successGreen : theme.colors.mainFont)};
  padding: 2px 0;
  transition: color 0.2s ease;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
`;

const LoginText = styled.p`
  font-size: 14px;
  color: ${theme.colors.mainFont};
  text-align: left;
  margin: 0.5rem 0 0 0;

  @media (min-width: 768px) {
    font-size: 16px;
  }
`;

const ErrorMessage = styled.p`
  font-size: 14px;
  color: ${theme.colors.error};
  text-align: center;
  margin: 0;
`;

// ============ PASSWORD VALIDATION RULES ============
const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (pwd) => pwd.length >= 8 },
  { id: 'uppercase', label: 'One uppercase letter (A-Z)', test: (pwd) => /[A-Z]/.test(pwd) },
  { id: 'lowercase', label: 'One lowercase letter (a-z)', test: (pwd) => /[a-z]/.test(pwd) },
  { id: 'number', label: 'One number (0-9)', test: (pwd) => /\d/.test(pwd) },
  { id: 'special', label: 'One special character (!@#$%...)', test: (pwd) => /[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>/?]/.test(pwd) },
];

// ============ COMPONENT ============
const Registration = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get pre-filled email from Landing page (if any)
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

  // Validate password against all rules
  const validatePassword = (password) => {
    const failedRules = PASSWORD_RULES.filter((rule) => !rule.test(password));
    return failedRules.length === 0 ? null : 'Password does not meet all requirements';
  };

  // Validate entire form
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

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
      const response = await register(fullName, formData.email, formData.password);

      // Store the token
      localStorage.setItem('token', response.access_token);

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);

      // Handle specific API errors
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

  // Checkbox label with link
  const checkboxLabel = (
    <>
      I agree to Terms & Conditions and{' '}
      <FormLink to="/privacy">Privacy Policy</FormLink>
    </>
  );

  return (
    <GradientPageContainer>
      <Header />
      <MainContent>
        <FormContainer as="form" onSubmit={handleSubmit}>
          <PageTitle>Sign up for TaxHelper</PageTitle>
          <PageSubtitle>
            Create your account in 2 minutes to simplify your taxes. Get started
            with our 15-day free trial – no card required.
          </PageSubtitle>

          <FormFieldsContainer>
            {/* Name Fields */}
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

            {/* Email Field */}
            <FormInput
              type="email"
              name="email"
              placeholder="Enter your email*"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />

            {/* Password Fields */}
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
              />

              {/* Password Requirements Checklist */}
              {(showPasswordRules || formData.password) && (
                <PasswordRequirements>
                  {PASSWORD_RULES.map((rule) => (
                    <RequirementItem
                      key={rule.id}
                      $met={rule.test(formData.password)}
                    >
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
              />
            </PasswordFieldsContainer>

            {/* Terms Checkbox */}
            <FormCheckbox
              id="agreeToTerms"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              label={checkboxLabel}
              error={errors.agreeToTerms}
            />

            {/* General Error Message */}
            {errors.submit && <ErrorMessage>{errors.submit}</ErrorMessage>}

            {/* Submit Button */}
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

            {/* Login Link */}
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
      
      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </GradientPageContainer>
  );
};

export default Registration;