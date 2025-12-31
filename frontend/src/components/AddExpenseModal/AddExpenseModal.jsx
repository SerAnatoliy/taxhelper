import { useState, useEffect } from 'react';
import { AnyIcon } from '../Shared/AnyIcon/AnyIcon';
import CloseIcon from '../../assets/icons/CloseIcon.svg?react';
import { createExpense, updateExpense } from '../../services/api';

import {
  ModalOverlay,
  ModalContent,
  CloseButton,
  ModalTitle,
  FormGroup,
  Label,
  Input,
  Select,
  TextArea,
  FormRow,
  ErrorText,
  ButtonRow,
  CancelButton,
  SubmitButton,
} from './AddExpenseModal.styles';

const EXPENSE_TYPES = [
  { value: 'invoice', label: 'Invoice' },
  { value: 'receipt', label: 'Receipt' },
];

const CATEGORIES = [
  { value: 'deductible', label: 'Deductible' },
  { value: 'non-deductible', label: 'Non-Deductible' },
  { value: 'partial', label: 'Partially Deductible' },
];

const initialFormData = {
  date: new Date().toISOString().split('T')[0],
  amount: '',
  type: 'invoice',
  category: 'deductible',
  description: '',
  vendor: '',
  invoiceNumber: '',
};

const AddExpenseModal = ({ isOpen, onClose, onSubmit, expense = null }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!expense;

  useEffect(() => {
    if (expense) {
      setFormData({
        date: expense.date?.split('T')[0] || initialFormData.date,
        amount: expense.amount?.toString() || '',
        type: expense.type || 'invoice',
        category: expense.category || 'deductible',
        description: expense.description || '',
        vendor: expense.vendor || '',
        invoiceNumber: expense.invoice_number || expense.invoiceNumber || '',
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [expense, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!formData.type) {
      newErrors.type = 'Type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        date: formData.date,
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        description: formData.description,
        vendor: formData.vendor,
        invoice_number: formData.invoiceNumber,
      };

      if (isEditMode) {
        await updateExpense(expense.id, payload);
      } else {
        await createExpense(payload);
      }

      if (onSubmit) await onSubmit();
      handleClose();
    } catch (error) {
      console.error('Failed to save expense:', error);
      setErrors({ 
        submit: error.response?.data?.detail || 'Failed to save expense. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setErrors({});
    onClose();
  };

  return (
    <ModalOverlay $isOpen={isOpen} onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={handleClose}>
          <AnyIcon icon={CloseIcon} size="28px" />
        </CloseButton>

        <ModalTitle>{isEditMode ? 'Edit Expense' : 'Add New Expense'}</ModalTitle>

        <form onSubmit={handleSubmit}>
          <FormRow>
            <FormGroup>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                $hasError={!!errors.date}
              />
              {errors.date && <ErrorText>{errors.date}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="amount">Amount (€) *</Label>
              <Input
                id="amount"
                name="amount"
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) => {
                  const value = e.target.value.replace(',', '.');
                  if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                    handleChange({ target: { name: 'amount', value } });
                  }
                }}
                $hasError={!!errors.amount}
              />
              {errors.amount && <ErrorText>{errors.amount}</ErrorText>}
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label htmlFor="type">Type *</Label>
              <Select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                $hasError={!!errors.type}
              >
                {EXPENSE_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
              {errors.type && <ErrorText>{errors.type}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="category">Category</Label>
              <Select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {CATEGORIES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label htmlFor="vendor">Vendor / Supplier</Label>
            <Input
              id="vendor"
              name="vendor"
              type="text"
              placeholder="Company name"
              value={formData.vendor}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="invoiceNumber">Invoice / Receipt Number</Label>
            <Input
              id="invoiceNumber"
              name="invoiceNumber"
              type="text"
              placeholder="INV-001"
              value={formData.invoiceNumber}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">Description</Label>
            <TextArea
              id="description"
              name="description"
              placeholder="Brief description of the expense..."
              value={formData.description}
              onChange={handleChange}
            />
          </FormGroup>

          {errors.submit && <ErrorText>{errors.submit}</ErrorText>}

          <ButtonRow>
            <CancelButton type="button" onClick={handleClose}>
              Cancel
            </CancelButton>
            <SubmitButton type="submit" disabled={isSubmitting}>
              {isSubmitting 
                ? 'Saving...' 
                : isEditMode 
                  ? 'Update Expense' 
                  : 'Add Expense'
              }
            </SubmitButton>
          </ButtonRow>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AddExpenseModal;