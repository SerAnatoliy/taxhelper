import { useState } from 'react';
import { AnyIcon } from '../Shared/AnyIcon/AnyIcon';
import { FormInput } from '../Shared/FormComponents/FormComponents';
import CloseIcon from '../../assets/icons/CloseIcon.svg?react';
import { createInvoice, downloadInvoicePdf } from '../../services/api';

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
  TermsSection,
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

const initialFormData = {
  businessName: '',
  registrationNumber: '',
  businessAddress: '',
  cityRegion: '',
  representative: '',
  department: '',
  clientName: '',
  clientAddress: '',
  clientContact: '',
  referenceNumber: '',
  invoiceNumber: '',
  invoiceDate: new Date().toISOString().split('T')[0],
  serviceDescription: '',
  paymentTerms: '',
  items: [{ id: 1, description: '', quantity: 1, unitPrice: 0 }],
};

const GenerateInvoiceModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

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
              [field]: field === 'quantity' || field === 'unitPrice' ? parseFloat(value) || 0 : value,
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
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
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
      const createdInvoice = await createInvoice(formData);
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
    setFormData(initialFormData);
    setErrors({});
    setShowPreview(false);
    onClose();
  };

  const handleBackToEdit = () => setShowPreview(false);

  // Common input props for modal styling
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
                    placeholder="Your Company Name"
                    value={formData.businessName}
                    onChange={handleChange}
                    error={errors.businessName}
                    {...inputProps}
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <FormInput
                    id="registrationNumber"
                    name="registrationNumber"
                    placeholder="REG-123456"
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
                    {...inputProps}
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="cityRegion">City, Region</Label>
                  <FormInput
                    id="cityRegion"
                    name="cityRegion"
                    placeholder="Madrid, Spain"
                    value={formData.cityRegion}
                    onChange={handleChange}
                    {...inputProps}
                  />
                </FormGroup>
                <FormRow>
                  <FormGroup>
                    <Label htmlFor="representative">Representative</Label>
                    <FormInput
                      id="representative"
                      name="representative"
                      placeholder="John Doe"
                      value={formData.representative}
                      onChange={handleChange}
                      {...inputProps}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="department">Department</Label>
                    <FormInput
                      id="department"
                      name="department"
                      placeholder="Sales"
                      value={formData.department}
                      onChange={handleChange}
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
                <FormGroup>
                  <Label htmlFor="referenceNumber">Reference Number</Label>
                  <FormInput
                    id="referenceNumber"
                    name="referenceNumber"
                    placeholder="REF-001"
                    value={formData.referenceNumber}
                    onChange={handleChange}
                    {...inputProps}
                  />
                </FormGroup>
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

              <TermsSection>
                <SectionTitle>Terms & Conditions</SectionTitle>
                <FormRow>
                  <FormGroup>
                    <Label htmlFor="serviceDescription">Service Description</Label>
                    <TextArea
                      id="serviceDescription"
                      name="serviceDescription"
                      placeholder="Brief description of services provided"
                      value={formData.serviceDescription}
                      onChange={handleChange}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                    <TextArea
                      id="paymentTerms"
                      name="paymentTerms"
                      placeholder="Net 30 days, Bank transfer preferred"
                      value={formData.paymentTerms}
                      onChange={handleChange}
                    />
                  </FormGroup>
                </FormRow>
              </TermsSection>
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
                    <p>{formData.cityRegion}</p>
                    {formData.representative && (
                      <p>
                        Rep: {formData.representative}
                        {formData.department && ` | ${formData.department}`}
                      </p>
                    )}
                  </PreviewBusiness>
                  <PreviewMeta>
                    <h2>INVOICE</h2>
                    <p>#{formData.invoiceNumber}</p>
                    <p>Date: {formData.invoiceDate}</p>
                    {formData.referenceNumber && <p>Ref: {formData.referenceNumber}</p>}
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
                        <td>{formatCurrency(item.quantity * item.unitPrice)}</td>
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
                  {formData.paymentTerms && (
                    <p>
                      <strong>Payment Terms:</strong> {formData.paymentTerms}
                    </p>
                  )}
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