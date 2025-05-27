import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// TypeScript interfaces
interface Product {
  product: string;
  sku: string;
  quantity: string;
  pricePerUnit: string;
  totalValue: string;
}

interface FormData {
  customerDetails: string;
  loadingOrderNo: string;
  vehicleNumber: string;
  driverName: string;
  loadingOrderDate: string;
  purchaseOrderRef: string;
  purchaseOrderDate: string;
  products: Product[];
  authorizedBy: string;
  preparedBy: string;
  approvedBy: string;
  additionalInfo?: string;
  invoiceNumber?: string; // New field for invoice number
  issueDate?: string; // New field for issue date
  dueDate?: string; // New field for due date
}

const DispatchReceipt: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    customerDetails: '',
    loadingOrderNo: '',
    vehicleNumber: '',
    driverName: '',
    loadingOrderDate: '',
    purchaseOrderRef: '',
    purchaseOrderDate: '',
    products: [{ product: '', sku: '', quantity: '', pricePerUnit: '', totalValue: '' }],
    authorizedBy: '',
    preparedBy: '',
    approvedBy: '',
    additionalInfo: '',
    invoiceNumber: '',
    issueDate: '',
    dueDate: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | string, string>>>({});

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData | string, string>> = {};
    if (!formData.customerDetails) newErrors.customerDetails = 'Customer details are required';
    if (!formData.loadingOrderNo) newErrors.loadingOrderNo = 'Loading order number is required';
    if (!formData.vehicleNumber) newErrors.vehicleNumber = 'Vehicle number is required';
    if (!formData.driverName) newErrors.driverName = 'Driver name is required';
    if (!formData.loadingOrderDate) newErrors.loadingOrderDate = 'Loading order date is required';
    formData.products.forEach((prod, index) => {
      if (!prod.product) newErrors[`product_${index}`] = 'Product is required';
      if (!prod.quantity || isNaN(Number(prod.quantity)) || Number(prod.quantity) <= 0)
        newErrors[`quantity_${index}`] = 'Valid quantity is required';
      if (!prod.pricePerUnit || isNaN(Number(prod.pricePerUnit)) || Number(prod.pricePerUnit) <= 0)
        newErrors[`pricePerUnit_${index}`] = 'Valid price is required';
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index?: number,
    field?: keyof Product
  ) => {
    const { name, value } = e.target;
    if (typeof index === 'number' && field) {
      const updatedProducts = [...formData.products];
      updatedProducts[index] = { ...updatedProducts[index], [field]: value };
      if (field === 'quantity' || field === 'pricePerUnit') {
        const qty = Number(updatedProducts[index].quantity) || 0;
        const price = Number(updatedProducts[index].pricePerUnit) || 0;
        updatedProducts[index].totalValue = (qty * price).toFixed(2);
      }
      setFormData({ ...formData, products: updatedProducts });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setErrors((prev) => ({ ...prev, [name]: undefined, [`${field}_${index}`]: undefined }));
  };

  // Add new product row
  const addProductRow = () => {
    setFormData({
      ...formData,
      products: [...formData.products, { product: '', sku: '', quantity: '', pricePerUnit: '', totalValue: '' }],
    });
  };

  // Remove product row
  const removeProductRow = (index: number) => {
    if (formData.products.length > 1) {
      const updatedProducts = formData.products.filter((_, i) => i !== index);
      setFormData({ ...formData, products: updatedProducts });
      setErrors((prev) => {
        const newErrors = { ...prev };
        ['product', 'sku', 'quantity', 'pricePerUnit', 'totalValue'].forEach((field) => {
          delete newErrors[`${field}_${index}`];
        });
        return newErrors;
      });
    }
  };

  // Handle print
  const handlePrint = () => {
    if (validateForm()) {
      window.print();
    } else {
      alert('Please fix the errors in the form before printing.');
    }
  };

  // Generate PDF and return as Blob
  const generatePDF = (): Blob => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);

    // Header
    doc.text('DISPATCH RECEIPT', 105, 15, { align: 'center' });
    doc.text('Meru Sales Ltd.', 20, 25);
    doc.text('123 Business Avenue, Nairobi, Kenya', 20, 35);
    doc.text('Phone: +254 700 123 456 | Email: info@merusales.co.ke', 20, 45);
    doc.text(`Invoice Number: ${formData.invoiceNumber || 'N/A'}`, 20, 55);
    doc.text(`Issue Date: ${formData.issueDate || 'N/A'}`, 20, 65);
    doc.text(`Due Date: ${formData.dueDate || 'N/A'}`, 20, 75);
    doc.text(`Customer: ${formData.customerDetails}`, 20, 85);
    doc.text(`Loading Order No: ${formData.loadingOrderNo}`, 20, 95);
    doc.text(`Vehicle Number: ${formData.vehicleNumber}`, 20, 105);
    doc.text(`Driver Name: ${formData.driverName}`, 20, 115);
    doc.text(`Loading Order Date: ${formData.loadingOrderDate}`, 20, 125);
    doc.text(`Purchase Order Ref: ${formData.purchaseOrderRef}`, 20, 135);
    doc.text(`Purchase Order Date: ${formData.purchaseOrderDate}`, 20, 145);
    if (formData.additionalInfo) {
      doc.text(`Additional Info: ${formData.additionalInfo}`, 20, 155);
    }

    // Products Table
    doc.autoTable({
      startY: formData.additionalInfo ? 165 : 155,
      head: [['Product', 'SKU', 'Quantity', 'Price/Unit', 'Total Value']],
      body: formData.products.map((prod) => [
        prod.product,
        prod.sku,
        prod.quantity,
        prod.pricePerUnit,
        prod.totalValue,
      ]),
      theme: 'grid',
      headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255] },
      styles: { fontSize: 10 },
    });

    // Authorization
    let finalY = (doc as any).lastAutoTable.finalY || 165;
    doc.text(
      'WE HEREBY AUTHORIZE YOU TO LOAD THE AFOREMENTIONED GOOD IN THE ABOVE STATED VEHICLE NUMBER VIDE LOADING ORDER NO AS MENTIONED ABOVE EVEN DATE. WE HEREBY FURTHER MANDATE YOU TO DEDUCT THE QUANTITY AS LOADED HEREIN ABOVE FROM THE QUANTITY IN OUR PURCHASE ORDER AND YOUR CORRESPONDING SALES ORDER FOR GOOD ORDER.',
      20,
      finalY + 10,
      { maxWidth: 170 }
    );
    doc.text(`Authorized By: ${formData.authorizedBy}`, 20, finalY + 50);
    doc.text(`Prepared By: ${formData.preparedBy}`, 80, finalY + 50);
    doc.text(`Approved By: ${formData.approvedBy}`, 140, finalY + 50);

    return doc.output('blob');
  };

  // Handle PDF download
  const handleDownloadPDF = () => {
    if (!validateForm()) {
      alert('Please fix the errors in the form before downloading.');
      return;
    }
    const doc = new jsPDF();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);

    // Same PDF content as generatePDF
    doc.text('DISPATCH RECEIPT', 105, 15, { align: 'center' });
    doc.text('Meru Sales Ltd.', 20, 25);
    doc.text('123 Business Avenue, Nairobi, Kenya', 20, 35);
    doc.text('Phone: +254 700 123 456 | Email: info@merusales.co.ke', 20, 45);
    doc.text(`Invoice Number: ${formData.invoiceNumber || 'N/A'}`, 20, 55);
    doc.text(`Issue Date: ${formData.issueDate || 'N/A'}`, 20, 65);
    doc.text(`Due Date: ${formData.dueDate || 'N/A'}`, 20, 75);
    doc.text(`Customer: ${formData.customerDetails}`, 20, 85);
    doc.text(`Loading Order No: ${formData.loadingOrderNo}`, 20, 95);
    doc.text(`Vehicle Number: ${formData.vehicleNumber}`, 20, 105);
    doc.text(`Driver Name: ${formData.driverName}`, 20, 115);
    doc.text(`Loading Order Date: ${formData.loadingOrderDate}`, 20, 125);
    doc.text(`Purchase Order Ref: ${formData.purchaseOrderRef}`, 20, 135);
    doc.text(`Purchase Order Date: ${formData.purchaseOrderDate}`, 20, 145);
    if (formData.additionalInfo) {
      doc.text(`Additional Info: ${formData.additionalInfo}`, 20, 155);
    }

    doc.autoTable({
      startY: formData.additionalInfo ? 165 : 155,
      head: [['Product', 'SKU', 'Quantity', 'Price/Unit', 'Total Value']],
      body: formData.products.map((prod) => [
        prod.product,
        prod.sku,
        prod.quantity,
        prod.pricePerUnit,
        prod.totalValue,
      ]),
      theme: 'grid',
      headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255] },
      styles: { fontSize: 10 },
    });

    let finalY = (doc as any).lastAutoTable.finalY || 165;
    doc.text(
      'WE HEREBY AUTHORIZE YOU TO LOAD THE AFOREMENTIONED GOOD IN THE ABOVE STATED VEHICLE NUMBER VIDE LOADING ORDER NO AS MENTIONED ABOVE EVEN DATE. WE HEREBY FURTHER MANDATE YOU TO DEDUCT THE QUANTITY AS LOADED HEREIN ABOVE FROM THE QUANTITY IN OUR PURCHASE ORDER AND YOUR CORRESPONDING SALES ORDER FOR GOOD ORDER.',
      20,
      finalY + 10,
      { maxWidth: 170 }
    );
    doc.text(`Authorized By: ${formData.authorizedBy}`, 20, finalY + 50);
    doc.text(`Prepared By: ${formData.preparedBy}`, 80, finalY + 50);
    doc.text(`Approved By: ${formData.approvedBy}`, 140, finalY + 50);

    doc.save('DispatchReceipt.pdf');
  };

  // Handle sharing
  const handleShare = async () => {
    if (!validateForm()) {
      alert('Please fix the errors in the form before sharing.');
      return;
    }

    const pdfBlob = generatePDF();
    const pdfFile = new File([pdfBlob], 'DispatchReceipt.pdf', { type: 'application/pdf' });

    // Simulated shareable link (requires backend for persistence)
    const shareableLink = `https://merusales.co.ke/receipt/${formData.invoiceNumber || 'temp'}`;

    const shareData = {
      title: 'Dispatch Receipt',
      text: `Dispatch Receipt for Loading Order No: ${formData.loadingOrderNo}`,
      url: shareableLink,
      files: [pdfFile],
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: Show manual share options
      alert('Native sharing not supported. Use the buttons below to share via Email, WhatsApp, or copy the link.');
    }
  };

  // Handle email share
  const handleEmailShare = () => {
    if (!validateForm()) {
      alert('Please fix the errors in the form before sharing.');
      return;
    }
    const subject = `Dispatch Receipt - Loading Order No: ${formData.loadingOrderNo}`;
    const body = `Dear Recipient,\n\nAttached is the dispatch receipt for Loading Order No: ${formData.loadingOrderNo}.\n\nDetails:\nCustomer: ${formData.customerDetails}\nInvoice Number: ${formData.invoiceNumber || 'N/A'}\nIssue Date: ${formData.issueDate || 'N/A'}\n\nBest regards,\nMeru Sales Ltd.`;
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  // Handle WhatsApp share
  const handleWhatsAppShare = () => {
    if (!validateForm()) {
      alert('Please fix the errors in the form before sharing.');
      return;
    }
    const message = `Dispatch Receipt for Loading Order No: ${formData.loadingOrderNo}\nCustomer: ${formData.customerDetails}\nInvoice Number: ${formData.invoiceNumber || 'N/A'}\nView receipt: https://merusales.co.ke/receipt/${formData.invoiceNumber || 'temp'}`;
    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');
  };

  // Handle copy link
  const handleCopyLink = () => {
    if (!validateForm()) {
      alert('Please fix the errors in the form before sharing.');
      return;
    }
    const shareableLink = `https://merusales.co.ke/receipt/${formData.invoiceNumber || 'temp'}`;
    navigator.clipboard.writeText(shareableLink).then(() => {
      alert('Link copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy link. Please try again.');
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 font-sans print:bg-white">
      {/* Header Section */}
      <header className="max-w-5xl mx-auto mb-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg shadow-xl p-6 print:bg-white print:text-black print:shadow-none">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {/* Logo Placeholder */}
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 print:bg-transparent">
            <span className="text-sm">Logo</span>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold">Meru Sales Ltd.</h1>
            <p className="text-sm sm:text-base mt-2">
              123 Business Avenue, Nairobi, Kenya<br />
              Phone: +254 700 123 456 | Email: info@merusales.co.ke<br />
              Website: www.merusales.co.ke
            </p>
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold mt-4 text-center print:text-black">
          Dispatch Receipt
        </h2>
      </header>

      <div className="max-w-5xl mx-auto bg-white border border-gray-300 p-4 sm:p-6 rounded-lg shadow-lg print:shadow-none print:border-black">
        {/* Invoice Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 border-b border-gray-300 pb-4 print:border-black">
          <div>
            <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
            <input
              type="text"
              name="invoiceNumber"
              placeholder="INV-001"
              value={formData.invoiceNumber}
              onChange={handleInputChange}
              className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 print:border-0"
              aria-label="Invoice Number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Issue Date</label>
            <input
              type="date"
              name="issueDate"
              value={formData.issueDate}
              onChange={handleInputChange}
              className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 print:border-0"
              aria-label="Issue Date"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 print:border-0"
              aria-label="Due Date"
            />
          </div>
        </div>

        {/* Header Section */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 border-b border-gray-300 pb-4 mb-4 print:border-black print:gap-0">
          <div className="sm:col-span-3 border border-gray-300 p-2 rounded print:border-black">
            <input
              type="text"
              name="customerDetails"
              placeholder="Logo or Customer Name"
              value={formData.customerDetails}
              onChange={handleInputChange}
              className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 print:border-0"
              aria-label="Customer Name or Logo"
              required
            />
            {errors.customerDetails && (
              <p className="text-red-500 text-xs mt-1">{errors.customerDetails}</p>
            )}
          </div>
          <div className="sm:col-span-9 border border-gray-300 p-2 rounded print:border-black">
            <textarea
              name="customerDetails"
              placeholder="Customer Details (e.g., Name, Address)"
              value={formData.customerDetails}
              onChange={handleInputChange}
              className="w-full p-2 text-sm border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 print:border-0"
              rows={3}
              aria-label="Customer Details"
            />
          </div>
        </div>

        {/* Document Name */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 border-b border-gray-300 py-2 mb-4 print:border-black print:gap-0">
          <div className="sm:col-span-3 border border-gray-300 flex items-center justify-center font-bold text-sm bg-gray-100 rounded print:border-black">
            DOCUMENT NAME
          </div>
          <div className="sm:col-span-9 border border-gray-300 flex items-center justify-center font-bold text-sm bg-blue-100 rounded print:border-black">
            LOADING ORDER
          </div>
        </div>

        {/* Loading Order Info */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 border-b border-gray-300 py-2 mb-4 print:border-black print:gap-0">
          <div className="sm:col-span-4 border border-gray-300 p-2 rounded print:border-black">
            <input
              type="text"
              name="loadingOrderNo"
              placeholder="Loading Order No *"
              value={formData.loadingOrderNo}
              onChange={handleInputChange}
              className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 print:border-0"
              aria-label="Loading Order Number"
              required
            />
            {errors.loadingOrderNo && (
              <p className="text-red-500 text-xs mt-1">{errors.loadingOrderNo}</p>
            )}
          </div>
          <div className="sm:col-span-4 border border-gray-300 p-2 rounded print:border-black">
            <input
              type="text"
              name="vehicleNumber"
              placeholder="Vehicle Number *"
              value={formData.vehicleNumber}
              onChange={handleInputChange}
              className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 print:border-0"
              aria-label="Vehicle Number"
              required
            />
            {errors.vehicleNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.vehicleNumber}</p>
            )}
          </div>
          <div className="sm:col-span-4 border border-gray-300 p-2 rounded print:border-black">
            <input
              type="text"
              name="driverName"
              placeholder="Driver Name *"
              value={formData.driverName}
              onChange={handleInputChange}
              className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 print:border-0"
              aria-label="Driver Name"
              required
            />
            {errors.driverName && (
              <p className="text-red-500 text-xs mt-1">{errors.driverName}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 border-b border-gray-300 py-2 mb-4 print:border-black print:gap-0">
          <div className="sm:col-span-6 border border-gray-300 p-2 rounded print:border-black">
            <input
              type="date"
              name="loadingOrderDate"
              value={formData.loadingOrderDate}
              onChange={handleInputChange}
              className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 print:border-0"
              aria-label="Loading Order Date"
              required
            />
            {errors.loadingOrderDate && (
              <p className="text-red-500 text-xs mt-1">{errors.loadingOrderDate}</p>
            )}
          </div>
          <div className="sm:col-span-6 border border-gray-300 p-2 rounded print:border-black">
            <input
              type="text"
              name="additionalInfo"
              placeholder="Additional Info (Optional)"
              value={formData.additionalInfo || ''}
              onChange={handleInputChange}
              className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 print:border-0"
              aria-label="Additional Information"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 border-b border-gray-300 py-2 mb-4 print:border-black print:gap-0">
          <div className="sm:col-span-6 border border-gray-300 p-2 rounded print:border-black">
            <input
              type="text"
              name="purchaseOrderRef"
              placeholder="Purchase Order Ref"
              value={formData.purchaseOrderRef}
              onChange={handleInputChange}
              className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 print:border-0"
              aria-label="Purchase Order Reference"
            />
          </div>
          <div className="sm:col-span-6 border border-gray-300 p-2 rounded print:border-black">
            <input
              type="date"
              name="purchaseOrderDate"
              value={formData.purchaseOrderDate}
              onChange={handleInputChange}
              className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 print:border-0"
              aria-label="Purchase Order Date"
            />
          </div>
        </div>

        {/* Loading Details Table */}
        <div className="mt-4 border border-gray-300 rounded print:border-black overflow-x-auto">
          <table className="w-full border-collapse text-xs sm:text-sm print:text-sm">
            <thead>
              <tr className="bg-blue-600 text-white print:bg-gray-100 print:text-black">
                <th className="border border-gray-300 px-1 py-0.5 sm:px-2 sm:py-1 font-bold print:border-black min-w-[100px] sm:min-w-[120px]">
                  PRODUCT
                </th>
                <th className="border border-gray-300 px-1 py-0.5 sm:px-2 sm:py-1 font-bold print:border-black min-w-[80px] sm:min-w-[100px]">
                  SKU
                </th>
                <th className="border border-gray-300 px-1 py-0.5 sm:px-2 sm:py-1 font-bold print:border-black min-w-[80px] sm:min-w-[100px]">
                  QUANTITY
                </th>
                <th className="border border-gray-300 px-1 py-0.5 sm:px-2 sm:py-1 font-bold print:border-black min-w-[80px] sm:min-w-[100px]">
                  PRICE/UNIT
                </th>
                <th className="border border-gray-300 px-1 py-0.5 sm:px-2 sm:py-1 font-bold print:border-black min-w-[80px] sm:min-w-[100px]">
                  TOTAL VALUE
                </th>
                <th className="border border-gray-300 px-1 py-0.5 sm:px-2 sm:py-1 font-bold print:hidden min-w-[60px]">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {formData.products.map((prod, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-1 py-0.5 sm:px-2 sm:py-1 print:border-black">
                    <input
                      type="text"
                      value={prod.product}
                      placeholder="Product *"
                      onChange={(e) => handleInputChange(e, index, 'product')}
                      className="w-full p-1 text-xs sm:text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 print:border-0"
                      aria-label={`Product ${index + 1}`}
                      required
                    />
                    {errors[`product_${index}`] && (
                      <p className="text-red-500 text-xs mt-1 max-w-[100px] sm:max-w-[120px] truncate">
                        {errors[`product_${index}`]}
                      </p>
                    )}
                  </td>
                  <td className="border border-gray-300 px-1 py-0.5 sm:px-2 sm:py-1 print:border-black">
                    <input
                      type="text"
                      value={prod.sku}
                      placeholder="SKU"
                      onChange={(e) => handleInputChange(e, index, 'sku')}
                      className="w-full p-1 text-xs sm:text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 print:border-0"
                      aria-label={`SKU ${index + 1}`}
                    />
                  </td>
                  <td className="border border-gray-300 px-1 py-0.5 sm:px-2 sm:py-1 print:border-black">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={prod.quantity}
                      placeholder="Quantity *"
                      onChange={(e) => handleInputChange(e, index, 'quantity')}
                      className="w-full p-1 text-xs sm:text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 print:border-0"
                      aria-label={`Quantity ${index + 1}`}
                      required
                    />
                    {errors[`quantity_${index}`] && (
                      <p className="text-red-500 text-xs mt-1 max-w-[80px] sm:max-w-[100px] truncate">
                        {errors[`quantity_${index}`]}
                      </p>
                    )}
                  </td>
                  <td className="border border-gray-300 px-1 py-0.5 sm:px-2 sm:py-1 print:border-black">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={prod.pricePerUnit}
                      placeholder="Price/Unit *"
                      onChange={(e) => handleInputChange(e, index, 'pricePerUnit')}
                      className="w-full p-1 text-xs sm:text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 print:border-0"
                      aria-label={`Price Per Unit ${index + 1}`}
                      required
                    />
                    {errors[`pricePerUnit_${index}`] && (
                      <p className="text-red-500 text-xs mt-1 max-w-[80px] sm:max-w-[100px] truncate">
                        {errors[`pricePerUnit_${index}`]}
                      </p>
                    )}
                  </td>
                  <td className="border border-gray-300 px-1 py-0.5 sm:px-2 sm:py-1 print:border-black">
                    <input
                      type="text"
                      value={prod.totalValue}
                      placeholder="Total Value"
                      readOnly
                      className="w-full p-1 text-xs sm:text-sm border border-gray-300 rounded bg-gray-100 print:border-0"
                      aria-label={`Total Value ${index + 1}`}
                    />
                  </td>
                  <td className="border border-gray-300 px-1 py-0.5 sm:px-2 sm:py-1 print:hidden">
                    <button
                      type="button"
                      onClick={() => removeProductRow(index)}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50 text-xs sm:text-sm"
                      disabled={formData.products.length === 1}
                      aria-label={`Remove Product ${index + 1}`}
                    >
                      <span className="sm:hidden">✕</span>
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            type="button"
            onClick={addProductRow}
            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm print:hidden"
            aria-label="Add Product Row"
          >
            Add Product
          </button>
        </div>

        {/* Authorization Section */}
        <div className="mt-6 border border-gray-300 p-4 bg-gray-100 rounded print:border-black print:bg-gray-300">
          <textarea
            readOnly
            className="w-full p-2 text-sm font-semibold resize-none bg-gray-100 border-0 print:bg-gray-300 print:p-0"
            rows={4}
            value="WE HEREBY AUTHORIZE YOU TO LOAD THE AFOREMENTIONED GOOD IN THE ABOVE STATED VEHICLE NUMBER VIDE LOADING ORDER NO AS MENTIONED ABOVE EVEN DATE. WE HEREBY FURTHER MANDATE YOU TO DEDUCT THE QUANTITY AS LOADED HEREIN ABOVE FROM THE QUANTITY IN OUR PURCHASE ORDER AND YOUR CORRESPONDING SALES ORDER FOR GOOD ORDER."
            aria-label="Authorization Text"
          />
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 mt-4 print:gap-0">
            <div className="sm:col-span-6 border border-gray-300 p-2 rounded print:border-black">
              <input
                        type="text"
                        name="authorizedBy"
                        placeholder="For & On Behalf Of"
                        value={formData.authorizedBy}
                        onChange={handleInputChange}
                        className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 print:border-0"
                        aria-label="Authorized By"
              />
            </div>
            <div className DudeClassName="sm:col-span-3 border border-gray-300 p-2 rounded print:border-black">
              <input
                        type="text"
                        name="preparedBy"
                        placeholder="Order Prepared By"
                        value={formData.preparedBy}
                        onChange={handleInputChange}
                        className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-blue-500 print:border-0"
                        aria-label="Prepared By"
                      />
            </div>
            <div className="sm:col-span-3 border border-gray-300 p-2 rounded print:border-black">
              <input
                        type="text"
                        name="approvedBy"
                        placeholder="Order Approved By"
                        value={formData.approvedBy}
                        onChange={handleInputChange}
                        className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-center print:border-0"
                        aria-label="Approved By"
                      />
            </div>
          </div>
        </div>

        {/* Action Buttons and Share Options */}
        <div className="mt-6 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-end print:hidden">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              aria-label="Print Receipt"
            >
              Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              aria-label="Download PDF"
            >
              Download PDF
            </button>
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
              aria-label="Share Receipt"
            >
              Share
            </button>
            <button
              onClick={handleEmailShare}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
              aria-label="Share via Email"
            >
              Email
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
              aria-label="Share via WhatsApp"
            >
              WhatsApp
            </button>
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
              aria-label="Copy Share Link"
            >
              Copy Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DispatchReceipt;