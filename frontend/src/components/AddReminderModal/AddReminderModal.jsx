import { useState } from 'react';
import { AnyIcon } from '../Shared/AnyIcon/AnyIcon';
import CloseIcon from '../../assets/icons/CloseIcon.svg?react';

import {
  ModalOverlay,
  ModalContent,
  CloseButton,
  ModalTitle,
  FormGroup,
  Label,
  Input,
  TextArea,
  Select,
  ButtonRow,
  CancelButton,
  SubmitButtonStyled,
  ErrorText,
} from './AddReminderModal.styles';

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
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
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
        <CloseButton onClick={handleClose}>
          <AnyIcon icon={CloseIcon} size="28px" />
        </CloseButton>
        
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
            <SubmitButtonStyled type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Reminder'}
            </SubmitButtonStyled>
          </ButtonRow>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AddReminderModal;