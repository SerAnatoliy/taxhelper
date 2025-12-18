import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: ${theme.colors.white};
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 450px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: ${theme.colors.mainFont};
  margin: 0 0 1.5rem;
  text-align: center;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.mainFont};
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  height: 48px;
  padding: 0 1rem;
  font-size: 16px;
  color: ${theme.colors.mainFont};
  background: #f5f5f5;
  border: 2px solid transparent;
  border-radius: 12px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${theme.colors.logoBlue};
  }

  &::placeholder {
    color: ${theme.colors.mainFont};
    opacity: 0.5;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 0.75rem 1rem;
  font-size: 16px;
  font-family: inherit;
  color: ${theme.colors.mainFont};
  background: #f5f5f5;
  border: 2px solid transparent;
  border-radius: 12px;
  box-sizing: border-box;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${theme.colors.logoBlue};
  }

  &::placeholder {
    color: ${theme.colors.mainFont};
    opacity: 0.5;
  }
`;

const Select = styled.select`
  width: 100%;
  height: 48px;
  padding: 0 1rem;
  font-size: 16px;
  color: ${theme.colors.mainFont};
  background: #f5f5f5;
  border: 2px solid transparent;
  border-radius: 12px;
  box-sizing: border-box;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${theme.colors.logoBlue};
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const Button = styled.button`
  flex: 1;
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const CancelButton = styled(Button)`
  background: transparent;
  border: 2px solid ${theme.colors.mainFont};
  color: ${theme.colors.mainFont};

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const SubmitButton = styled(Button)`
  background: ${theme.colors.mainButton};
  border: 2px solid transparent;
  color: ${theme.colors.mainFont};

  &:hover {
    border-color: ${theme.colors.logoBlue};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: ${theme.colors.error};
  margin-top: 4px;
  display: block;
`;

const NOTIFY_OPTIONS = [
  { value: 1, label: '1 day before' },
  { value: 3, label: '3 days before' },
  { value: 7, label: '1 week before' },
  { value: 14, label: '2 weeks before' },
  { value: 30, label: '1 month before' },
];

const AddReminderModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    notify_days_before: 7,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required';
    } else {
      const selectedDate = new Date(formData.due_date);
      if (selectedDate < new Date()) {
        newErrors.due_date = 'Due date must be in the future';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        due_date: new Date(formData.due_date).toISOString(),
        reminder_type: 'custom',
        notify_days_before: parseInt(formData.notify_days_before, 10),
      });
      // Reset form
      setFormData({
        title: '',
        description: '',
        due_date: '',
        notify_days_before: 7,
      });
    } catch (error) {
      setErrors({ submit: 'Failed to create reminder. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      due_date: '',
      notify_days_before: 7,
    });
    setErrors({});
    onClose();
  };

  // Get min date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <ModalOverlay $isOpen={isOpen} onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>Add Reminder</ModalTitle>
        
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="e.g., Submit Modelo 347"
              value={formData.title}
              onChange={handleChange}
            />
            {errors.title && <ErrorText>{errors.title}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">Description (optional)</Label>
            <TextArea
              id="description"
              name="description"
              placeholder="Add any notes or details..."
              value={formData.description}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="due_date">Due Date *</Label>
            <Input
              id="due_date"
              name="due_date"
              type="date"
              min={today}
              value={formData.due_date}
              onChange={handleChange}
            />
            {errors.due_date && <ErrorText>{errors.due_date}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="notify_days_before">Remind me</Label>
            <Select
              id="notify_days_before"
              name="notify_days_before"
              value={formData.notify_days_before}
              onChange={handleChange}
            >
              {NOTIFY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </FormGroup>

          {errors.submit && <ErrorText>{errors.submit}</ErrorText>}

          <ButtonRow>
            <CancelButton type="button" onClick={handleClose}>
              Cancel
            </CancelButton>
            <SubmitButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Reminder'}
            </SubmitButton>
          </ButtonRow>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AddReminderModal;