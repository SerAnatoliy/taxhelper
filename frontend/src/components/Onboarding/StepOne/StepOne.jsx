import { useState } from 'react';
import { updateProfile } from '../../../services/api';
import {
  PageTitle,
  PageSubtitle,
} from '../../Shared/FormComponents/FormComponents.styles';
import {
  FormSection,
  FieldLabel,
  FieldGroup,
  FieldRow,
  StyledSelect,
  ButtonContainer,
  PrimaryButton,
  SkipButton,
  ErrorText,
} from '../Onboarding.styles';
import { FormCheckbox, FormInput } from '../../Shared/FormComponents/FormComponents.jsx';


const FAMILY_STATUS_OPTIONS = [
  { value: '', label: 'Select your status' },
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
];

const CHILDREN_OPTIONS = [
  { value: '', label: 'Please select' },
  { value: '0', label: '0' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5+', label: '5+' },
];

const REGION_OPTIONS = [
  { value: '', label: 'Select your region' },
  { value: 'Madrid', label: 'Madrid' },
  { value: 'Barcelona', label: 'Barcelona' },
  { value: 'Valencia', label: 'Valencia' },
  { value: 'Andalusia', label: 'Andalusia' },
  { value: 'Catalonia', label: 'Catalonia' },
  { value: 'Basque Country', label: 'Basque Country' },
  { value: 'Galicia', label: 'Galicia' },
  { value: 'Canary Islands', label: 'Canary Islands' },
  { value: 'Balearic Islands', label: 'Balearic Islands' },
  { value: 'Castile and León', label: 'Castile and León' },
  { value: 'Castile-La Mancha', label: 'Castile-La Mancha' },
  { value: 'Extremadura', label: 'Extremadura' },
  { value: 'Navarre', label: 'Navarre' },
  { value: 'La Rioja', label: 'La Rioja' },
  { value: 'Aragon', label: 'Aragon' },
  { value: 'Asturias', label: 'Asturias' },
  { value: 'Cantabria', label: 'Cantabria' },
  { value: 'Murcia', label: 'Murcia' },
];

const StepOne = ({ data, updateData, onNext, onSkip }) => {
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'taxPersonalization') {
      updateData({
        consents: { ...data.consents, taxPersonalization: checked },
      });
    } else {
      updateData({ [name]: value });
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!data.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!data.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!data.familyStatus) newErrors.familyStatus = 'Please select family status';
    if (!data.numChildren) newErrors.numChildren = 'Please select number of children';
    if (!data.region) newErrors.region = 'Please select your region';
    if (!data.consents.taxPersonalization) {
      newErrors.taxPersonalization = 'You must consent to continue';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const numChildren = data.numChildren === '5+' ? 5 : parseInt(data.numChildren, 10);
      
      await updateProfile({
        family_status: data.familyStatus,
        num_children: numChildren,
        region: data.region,
      });

      onNext();
    } catch (error) {
      console.error('Failed to update profile:', error);
      setErrors({ submit: 'Failed to save. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const consentLabel = 'I consent to using this info for tax personalization*';

  return (
    <>
      <PageTitle>Tell Us About yourself</PageTitle>
      <PageSubtitle $maxWidth="600px">
        Help us tailor your tax calculations. This takes 1 minute. Your info is
        secure and used only for accurate IRPF/IVA reports.
      </PageSubtitle>

      <FormSection>
        <FieldRow>
          <FieldGroup>
            <FieldLabel>First name:*</FieldLabel>
            <FormInput
              name="firstName"
              placeholder="John"
              value={data.firstName}
              onChange={handleChange}
              error={errors.firstName}
            />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel>Last name:*</FieldLabel>
            <FormInput
              name="lastName"
              placeholder="Doe"
              value={data.lastName}
              onChange={handleChange}
              error={errors.lastName}
            />
          </FieldGroup>
        </FieldRow>

        <FieldGroup>
          <FieldLabel>Family status:*</FieldLabel>
          <StyledSelect
            name="familyStatus"
            value={data.familyStatus}
            onChange={handleChange}
            $hasError={!!errors.familyStatus}
          >
            {FAMILY_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </StyledSelect>
          {errors.familyStatus && <ErrorText>{errors.familyStatus}</ErrorText>}
        </FieldGroup>

        <FieldGroup>
          <FieldLabel>Number of Children*</FieldLabel>
          <StyledSelect
            name="numChildren"
            value={data.numChildren}
            onChange={handleChange}
            $hasError={!!errors.numChildren}
          >
            {CHILDREN_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </StyledSelect>
          {errors.numChildren && <ErrorText>{errors.numChildren}</ErrorText>}
        </FieldGroup>

        <FieldGroup>
          <FieldLabel>Region:*</FieldLabel>
          <StyledSelect
            name="region"
            value={data.region}
            onChange={handleChange}
            $hasError={!!errors.region}
          >
            {REGION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </StyledSelect>
          {errors.region && <ErrorText>{errors.region}</ErrorText>}
        </FieldGroup>

        <FormCheckbox
          id="taxPersonalization"
          name="taxPersonalization"
          checked={data.consents.taxPersonalization}
          onChange={handleChange}
          label={consentLabel}
          error={errors.taxPersonalization}
        />

        {errors.submit && <ErrorText>{errors.submit}</ErrorText>}
      </FormSection>

      <ButtonContainer>
        <SkipButton type="button" onClick={onSkip}>
          Skip
        </SkipButton>
        <PrimaryButton onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Next'}
        </PrimaryButton>
      </ButtonContainer>
    </>
  );
};

export default StepOne;