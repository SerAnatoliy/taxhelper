import { useState, useEffect } from 'react';
import { AnyIcon } from '../Shared/AnyIcon/AnyIcon';
import { FormInput } from '../Shared/FormComponents/FormComponents';
import CloseIcon from '../../assets/icons/CloseIcon.svg?react';
import { createInvoice, downloadInvoicePdf, getProfile } from '../../services/api';

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
    if (!formData.clientName.trim()) newErrors.clientName = 'Client name is required';
    if (!formData.invoiceNumber.trim()) newErrors.invoiceNumber = 'Invoice number is required';
    if (!formData.invoiceDate) newErrors.invoiceDate = 'Invoice date is required';
    if (formData.items.every((item) => !item.description.trim())) {
      newErrors.items = 'At least one line item is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = () => {
    if (!validate()) return;
    setShowPreview(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const invoiceData = {
        ...formData,
        cityRegion: `${formData.city}${formData.city && formData.region ? ', ' : ''}${formData.region}`,
        paymentTerms: DEFAULT_PAYMENT_TERMS,
      };
      
      const createdInvoice = await createInvoice(invoiceData);
      await downloadInvoicePdf(createdInvoice.id);
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
      referenceNumber: '',
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

  return (
    <ModalOverlay $isOpen={isOpen} onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={handleClose}>
          <AnyIcon icon={CloseIcon} size="28px" />
        </CloseButton>

        <ModalTitle>{showPreview ? 'Invoice Preview' : 'Generate Invoice'}</ModalTitle>

        {!showPreview ? (
          <>
            <FormGrid>
              <FormSection>
                <SectionTitle>Business Details</SectionTitle>
                <FormGroup>
                  <Label htmlFor="businessName">Business Name *</Label>
                  <FormInput
                    id="businessName"
                    name="businessName"
                    placeholder="Your Full Name"
                    value={formData.businessName}
                    onChange={handleChange}
                    error={errors.businessName}
                    disabled={isLoadingProfile}
                    {...inputProps}
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="registrationNumber">NIF/CIF Number</Label>
                  <FormInput
                    id="registrationNumber"
                    name="registrationNumber"
                    placeholder="12345678A"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    {...inputProps}
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="businessAddress">Business Address</Label>
                  <FormInput
                    id="businessAddress"
                    name="businessAddress"
                    placeholder="123 Business Street"
                    value={formData.businessAddress}
                    onChange={handleChange}
                    disabled={isLoadingProfile}
                    {...inputProps}
                  />
                </FormGroup>
                <FormRow>
                  <FormGroup>
                    <Label htmlFor="city">City</Label>
                    <FormInput
                      id="city"
                      name="city"
                      placeholder="Madrid"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={isLoadingProfile}
                      {...inputProps}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="region">Region</Label>
                    <FormInput
                      id="region"
                      name="region"
                      placeholder="Madrid"
                      value={formData.region}
                      onChange={handleChange}
                      disabled={isLoadingProfile}
                      {...inputProps}
                    />
                  </FormGroup>
                </FormRow>
              </FormSection>

              <FormSection>
                <SectionTitle>Client & Invoice Details</SectionTitle>
                <FormGroup>
                  <Label htmlFor="clientName">Client Name *</Label>
                  <FormInput
                    id="clientName"
                    name="clientName"
                    placeholder="Client Company Ltd."
                    value={formData.clientName}
                    onChange={handleChange}
                    error={errors.clientName}
                    {...inputProps}
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="clientAddress">Client Address</Label>
                  <FormInput
                    id="clientAddress"
                    name="clientAddress"
                    placeholder="456 Client Avenue"
                    value={formData.clientAddress}
                    onChange={handleChange}
                    {...inputProps}
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="clientContact">Contact Information</Label>
                  <FormInput
                    id="clientContact"
                    name="clientContact"
                    placeholder="client@email.com"
                    value={formData.clientContact}
                    onChange={handleChange}
                    {...inputProps}
                  />
                </FormGroup>
                <FormRow>
                  <FormGroup>
                    <Label htmlFor="invoiceNumber">Invoice Number *</Label>
                    <FormInput
                      id="invoiceNumber"
                      name="invoiceNumber"
                      placeholder="2001321"
                      value={formData.invoiceNumber}
                      onChange={handleChange}
                      error={errors.invoiceNumber}
                      {...inputProps}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="invoiceDate">Invoice Date *</Label>
                    <FormInput
                      id="invoiceDate"
                      name="invoiceDate"
                      type="date"
                      value={formData.invoiceDate}
                      onChange={handleChange}
                      error={errors.invoiceDate}
                      {...inputProps}
                    />
                  </FormGroup>
                </FormRow>
              </FormSection>

              <ItemsSection>
                <SectionTitle>Line Items</SectionTitle>
                <ItemsTable>
                  <thead>
                    <tr>
                      <TableHeader>Description</TableHeader>
                      <TableHeader style={{ width: '100px' }}>Quantity</TableHeader>
                      <TableHeader style={{ width: '120px' }}>Unit Price (€)</TableHeader>
                      <TableHeader style={{ width: '120px', textAlign: 'right' }}>Amount</TableHeader>
                      <TableHeader style={{ width: '80px' }}></TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item) => (
                      <tr key={item.id}>
                        <TableCell>
                          <TableInput
                            value={item.description}
                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                            placeholder="Product/Service name"
                          />
                        </TableCell>
                        <TableCell>
                          <TableInput
                            type="number"
                            min="1"
                            step="0.01"
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
                        <AmountCell>{formatCurrency(item.quantity * item.unitPrice)}</AmountCell>
                        <TableCell>
                          <RemoveItemButton onClick={() => removeItem(item.id)}>Remove</RemoveItemButton>
                        </TableCell>
                      </tr>
                    ))}
                  </tbody>
                </ItemsTable>
                {errors.items && <ErrorText>{errors.items}</ErrorText>}
                <AddItemButton onClick={addItem}>+ Add Item</AddItemButton>
                <TotalSection>
                  <TotalAmount>
                    Total: <span>{formatCurrency(calculateTotal())}</span>
                  </TotalAmount>
                </TotalSection>
              </ItemsSection>

              <FormSection>
                <SectionTitle>Service Description</SectionTitle>
                <FormGroup>
                  <Label htmlFor="serviceDescription">Description (Optional)</Label>
                  <TextArea
                    id="serviceDescription"
                    name="serviceDescription"
                    placeholder="Brief description of services provided"
                    value={formData.serviceDescription}
                    onChange={handleChange}
                  />
                </FormGroup>
              </FormSection>
            </FormGrid>

            {errors.submit && <ErrorText>{errors.submit}</ErrorText>}

            <ButtonRow>
              <CancelButton type="button" onClick={handleClose}>
                Cancel
              </CancelButton>
              <GenerateButton type="button" onClick={handleGenerate}>
                Preview Invoice
              </GenerateButton>
            </ButtonRow>
          </>
        ) : (
          <>
            <PreviewContainer>
              <PreviewInvoice>
                <PreviewHeader>
                  <PreviewBusiness>
                    <h1>{formData.businessName || 'Business Name'}</h1>
                    <p>{formData.registrationNumber}</p>
                    <p>{formData.businessAddress}</p>
                    <p>
                      {formData.city}
                      {formData.city && formData.region && ', '}
                      {formData.region}
                    </p>
                  </PreviewBusiness>
                  <PreviewMeta>
                    <h2>INVOICE</h2>
                    <p>#{formData.invoiceNumber}</p>
                    <p>Date: {formData.invoiceDate}</p>
                  </PreviewMeta>
                </PreviewHeader>

                <PreviewClient>
                  <h3>Bill To</h3>
                  <p>{formData.clientName || 'Client Name'}</p>
                  <p>{formData.clientAddress}</p>
                  <p>{formData.clientContact}</p>
                </PreviewClient>

                <PreviewTable>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th style={{ textAlign: 'center' }}>Qty</th>
                      <th style={{ textAlign: 'right' }}>Unit Price</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.description || '-'}</td>
                        <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(item.quantity * item.unitPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </PreviewTable>

                <PreviewTotalRow>
                  <PreviewTotalBox>
                    <p>
                      Total: <span>{formatCurrency(calculateTotal())}</span>
                    </p>
                  </PreviewTotalBox>
                </PreviewTotalRow>

                <PreviewFooter>
                  {formData.serviceDescription && (
                    <p>
                      <strong>Service:</strong> {formData.serviceDescription}
                    </p>
                  )}
                  <p>
                    <strong>Payment Terms:</strong> {DEFAULT_PAYMENT_TERMS}
                  </p>
                  <p>Please reference invoice #{formData.invoiceNumber} with your payment.</p>
                </PreviewFooter>
              </PreviewInvoice>
            </PreviewContainer>

            <ButtonRow>
              <CancelButton type="button" onClick={handleBackToEdit}>
                ← Back to Edit
              </CancelButton>
              <GenerateButton type="button" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Generating...' : 'Download PDF'}
              </GenerateButton>
            </ButtonRow>
          </>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default GenerateInvoiceModal;