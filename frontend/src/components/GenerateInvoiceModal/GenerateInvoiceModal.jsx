import { useState, useEffect } from 'react';
import { AnyIcon } from '../Shared/AnyIcon/AnyIcon';
import { FormInput } from '../Shared/FormComponents/FormComponents';
import CloseIcon from '../../assets/icons/CloseIcon.svg?react';
import { createInvoice, getProfile } from '../../services/api';

import {
  ModalOverlay,
  ModalContent,
  CloseButton,
  ModalTitle,
  FormGrid,
  FormSection,
  SectionTitle,
  FormGroup,
  FormRow,
  Label,
  TextArea,
  ItemsSection,
  ItemsTable,
  TableHeader,
  TableCell,
  TableInput,
  AmountCell,
  RemoveItemButton,
  AddItemButton,
  TotalSection,
  TotalAmount,
  ButtonRow,
  CancelButton,
  GenerateButton,
  ErrorText,
  PreviewContainer,
  PreviewInvoice,
  PreviewHeader,
  PreviewBusiness,
  PreviewMeta,
  PreviewClient,
  PreviewTable,
  PreviewTotalRow,
  PreviewTotalBox,
  PreviewFooter,
} from './GenerateInvoiceModal.styles';

const DEFAULT_PAYMENT_TERMS = 'Should be paid within 15 banking days once received.';

const GenerateInvoiceModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    businessName: '',
    registrationNumber: '',
    businessAddress: '',
    city: '',
    region: '',
    clientName: '',
    clientAddress: '',
    clientContact: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    serviceDescription: '',
    items: [{ id: 1, description: '', quantity: 1, unitPrice: 0 }],
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      loadUserProfile();
    }
  }, [isOpen]);

  const loadUserProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const profile = await getProfile();
      setFormData((prev) => ({
        ...prev,
        businessName: profile.full_name || '',
        businessAddress: profile.business_address || '',
        city: profile.city || '',
        region: profile.region || '',
      }));
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleItemChange = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: field === 'quantity' || field === 'unitPrice' 
                ? parseFloat(value) || 0 
                : value,
            }
          : item
      ),
    }));
  };

  const addItem = () => {
    const newId = Math.max(...formData.items.map((i) => i.id), 0) + 1;
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { id: newId, description: '', quantity: 1, unitPrice: 0 }],
    }));
  };

  const removeItem = (id) => {
    if (formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== id),
      }));
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
    if (!formData.clientName.trim()) newErrors.clientName = 'Client name is required';
    if (!formData.invoiceNumber.trim()) newErrors.invoiceNumber = 'Invoice number is required';
    if (!formData.invoiceDate) newErrors.invoiceDate = 'Invoice date is required';
    
    const hasValidItems = formData.items.some(
      (item) => item.description.trim() && item.quantity > 0 && item.unitPrice > 0
    );
    if (!hasValidItems) newErrors.items = 'At least one valid item is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreview = (e) => {
    e.preventDefault();
    if (validate()) {
      setShowPreview(true);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const invoiceData = {
        businessName: formData.businessName,
        registrationNumber: formData.registrationNumber,
        businessAddress: formData.businessAddress,
        cityRegion: `${formData.city}${formData.city && formData.region ? ', ' : ''}${formData.region}`,
        clientName: formData.clientName,
        clientAddress: formData.clientAddress,
        clientContact: formData.clientContact,
        invoiceNumber: formData.invoiceNumber,
        invoiceDate: formData.invoiceDate,
        serviceDescription: formData.serviceDescription,
        items: formData.items.filter(item => item.description.trim()),
        paymentTerms: DEFAULT_PAYMENT_TERMS,
      };
      
      const createdInvoice = await createInvoice(invoiceData);
      
      if (onSubmit) await onSubmit(createdInvoice);
      
      handleClose();
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to generate invoice. Please try again.';
      setErrors({ submit: errorMessage });
      if (errorMessage.includes('already exists')) setShowPreview(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      businessName: '',
      registrationNumber: '',
      businessAddress: '',
      city: '',
      region: '',
      clientName: '',
      clientAddress: '',
      clientContact: '',
      invoiceNumber: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      serviceDescription: '',
      items: [{ id: 1, description: '', quantity: 1, unitPrice: 0 }],
    });
    setErrors({});
    setShowPreview(false);
    onClose();
  };

  const handleBackToEdit = () => setShowPreview(false);

  const inputProps = { height: '48px', borderRadius: '12px', bg: '#f5f5f5' };

  if (!isOpen) return null;

  return (
    <ModalOverlay $isOpen={isOpen} onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={handleClose}>
          <AnyIcon icon={CloseIcon} size="28px" />
        </CloseButton>

        <ModalTitle>{showPreview ? 'Invoice Preview' : 'Generate Invoice'}</ModalTitle>

        {!showPreview ? (
          <form onSubmit={handlePreview}>
            <FormGrid>
              <FormSection>
                <SectionTitle>Your Business</SectionTitle>
                <FormGroup>
                  <Label>Business Name *</Label>
                  <FormInput
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="Your business name"
                    {...inputProps}
                  />
                  {errors.businessName && <ErrorText>{errors.businessName}</ErrorText>}
                </FormGroup>
                <FormGroup>
                  <Label>Registration Number</Label>
                  <FormInput
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    placeholder="NIF/CIF"
                    {...inputProps}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Address</Label>
                  <FormInput
                    name="businessAddress"
                    value={formData.businessAddress}
                    onChange={handleChange}
                    placeholder="Street address"
                    {...inputProps}
                  />
                </FormGroup>
                <FormRow>
                  <FormGroup>
                    <Label>City</Label>
                    <FormInput
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City"
                      {...inputProps}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Region</Label>
                    <FormInput
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      placeholder="Region"
                      {...inputProps}
                    />
                  </FormGroup>
                </FormRow>
              </FormSection>

              <FormSection>
                <SectionTitle>Client Details</SectionTitle>
                <FormGroup>
                  <Label>Client Name *</Label>
                  <FormInput
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    placeholder="Client or company name"
                    {...inputProps}
                  />
                  {errors.clientName && <ErrorText>{errors.clientName}</ErrorText>}
                </FormGroup>
                <FormGroup>
                  <Label>Client Address</Label>
                  <FormInput
                    name="clientAddress"
                    value={formData.clientAddress}
                    onChange={handleChange}
                    placeholder="Client address"
                    {...inputProps}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Contact Info</Label>
                  <FormInput
                    name="clientContact"
                    value={formData.clientContact}
                    onChange={handleChange}
                    placeholder="Email or phone"
                    {...inputProps}
                  />
                </FormGroup>
                <FormRow>
                  <FormGroup>
                    <Label>Invoice Number *</Label>
                    <FormInput
                      name="invoiceNumber"
                      value={formData.invoiceNumber}
                      onChange={handleChange}
                      placeholder="INV-001"
                      {...inputProps}
                    />
                    {errors.invoiceNumber && <ErrorText>{errors.invoiceNumber}</ErrorText>}
                  </FormGroup>
                  <FormGroup>
                    <Label>Invoice Date *</Label>
                    <FormInput
                      type="date"
                      name="invoiceDate"
                      value={formData.invoiceDate}
                      onChange={handleChange}
                      {...inputProps}
                    />
                    {errors.invoiceDate && <ErrorText>{errors.invoiceDate}</ErrorText>}
                  </FormGroup>
                </FormRow>
              </FormSection>

              <ItemsSection>
                <SectionTitle>Invoice Items</SectionTitle>
                <ItemsTable>
                  <thead>
                    <tr>
                      <TableHeader>Description</TableHeader>
                      <TableHeader style={{ width: '100px' }}>Qty</TableHeader>
                      <TableHeader style={{ width: '120px' }}>Unit Price</TableHeader>
                      <TableHeader style={{ width: '100px' }}>Amount</TableHeader>
                      <TableHeader style={{ width: '60px' }}></TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item) => (
                      <tr key={item.id}>
                        <TableCell>
                          <TableInput
                            value={item.description}
                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                            placeholder="Service or product"
                          />
                        </TableCell>
                        <TableCell>
                          <TableInput
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <TableInput
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                          />
                        </TableCell>
                        <AmountCell>€{(item.quantity * item.unitPrice).toFixed(2)}</AmountCell>
                        <TableCell>
                          {formData.items.length > 1 && (
                            <RemoveItemButton type="button" onClick={() => removeItem(item.id)}>
                              ✕
                            </RemoveItemButton>
                          )}
                        </TableCell>
                      </tr>
                    ))}
                  </tbody>
                </ItemsTable>
                {errors.items && <ErrorText>{errors.items}</ErrorText>}
                <AddItemButton type="button" onClick={addItem}>
                  + Add Item
                </AddItemButton>
                <TotalSection>
                  <TotalAmount>
                    Total: <span>€{calculateTotal().toFixed(2)}</span>
                  </TotalAmount>
                </TotalSection>
              </ItemsSection>

              <FormSection style={{ gridColumn: '1 / -1' }}>
                <SectionTitle>Additional Details</SectionTitle>
                <FormGroup>
                  <Label>Service Description</Label>
                  <TextArea
                    name="serviceDescription"
                    value={formData.serviceDescription}
                    onChange={handleChange}
                    placeholder="Brief description of services provided..."
                  />
                </FormGroup>
              </FormSection>
            </FormGrid>

            {errors.submit && <ErrorText style={{ textAlign: 'center', marginTop: '1rem' }}>{errors.submit}</ErrorText>}

            <ButtonRow>
              <CancelButton type="button" onClick={handleClose}>
                Cancel
              </CancelButton>
              <GenerateButton type="submit">
                Preview Invoice
              </GenerateButton>
            </ButtonRow>
          </form>
        ) : (
          <>
            <PreviewContainer>
              <PreviewInvoice>
                <PreviewHeader>
                  <PreviewBusiness>
                    <h1>{formData.businessName}</h1>
                    {formData.registrationNumber && <p>{formData.registrationNumber}</p>}
                    {formData.businessAddress && <p>{formData.businessAddress}</p>}
                    {(formData.city || formData.region) && (
                      <p>{formData.city}{formData.city && formData.region ? ', ' : ''}{formData.region}</p>
                    )}
                  </PreviewBusiness>
                  <PreviewMeta>
                    <h2>INVOICE</h2>
                    <p><strong>#{formData.invoiceNumber}</strong></p>
                    <p>Date: {new Date(formData.invoiceDate).toLocaleDateString('es-ES')}</p>
                  </PreviewMeta>
                </PreviewHeader>

                <PreviewClient>
                  <h3>Bill To:</h3>
                  <p><strong>{formData.clientName}</strong></p>
                  {formData.clientAddress && <p>{formData.clientAddress}</p>}
                  {formData.clientContact && <p>{formData.clientContact}</p>}
                </PreviewClient>

                <PreviewTable>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items
                      .filter(item => item.description.trim())
                      .map((item) => (
                        <tr key={item.id}>
                          <td>{item.description}</td>
                          <td>{item.quantity}</td>
                          <td>€{item.unitPrice.toFixed(2)}</td>
                          <td>€{(item.quantity * item.unitPrice).toFixed(2)}</td>
                        </tr>
                      ))}
                  </tbody>
                </PreviewTable>

                <PreviewTotalRow>
                  <PreviewTotalBox>
                    <span>Total Amount</span>
                    <strong>€{calculateTotal().toFixed(2)}</strong>
                  </PreviewTotalBox>
                </PreviewTotalRow>

                <PreviewFooter>
                  <p>{DEFAULT_PAYMENT_TERMS}</p>
                </PreviewFooter>
              </PreviewInvoice>
            </PreviewContainer>

            {errors.submit && <ErrorText style={{ textAlign: 'center', marginTop: '1rem' }}>{errors.submit}</ErrorText>}

            <ButtonRow>
              <CancelButton type="button" onClick={handleBackToEdit}>
                Back to Edit
              </CancelButton>
              <GenerateButton onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Generate Invoice'}
              </GenerateButton>
            </ButtonRow>
          </>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default GenerateInvoiceModal;