import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { v4 as uuidv4 } from 'uuid';
import { Card } from '../components/ui/Card';
import { PrinterIcon, DownloadIcon, Share2Icon, MailIcon, MessageCircleIcon, CopyIcon, EyeIcon, InfoIcon } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

// Interfaces
interface Product {
  product: string;
  sku: string;
  quantity: string;
  pricePerUnit: string;
  totalValue: string;
}

interface FormData {
  receiptId: string;
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
  invoiceNumber?: string;
  issueDate?: string;
  dueDate?: string;
}

const DispatchReceipt: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(() => {
    const saved = localStorage.getItem('dispatchReceipt');
    return saved
      ? JSON.parse(saved)
      : {
          receiptId: uuidv4(),
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
        };
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | string, string>>>({});
  const [activeTab, setActiveTab] = useState<'Customer' | 'Order' | 'Products' | 'Authorization'>('Customer');
  const [showPreview, setShowPreview] = useState(false);
  const [showPrintOrPdfPrompt, setShowPrintOrPdfPrompt] = useState(false);
  const { addNotification } = useNotifications();

  // Persist form data
  useEffect(() => {
    localStorage.setItem('dispatchReceipt', JSON.stringify(formData));
  }, [formData]);

  // Automatically move to next tab when current tab's required fields are filled
  useEffect(() => {
    if (activeTab === 'Customer' && formData.customerDetails.trim() !== '') {
      setActiveTab('Order');
    } else if (
      activeTab === 'Order' &&
      formData.loadingOrderNo.trim() !== '' &&
      formData.vehicleNumber.trim() !== '' &&
      formData.driverName.trim() !== '' &&
      formData.loadingOrderDate.trim() !== ''
    ) {
      setActiveTab('Products');
    } else if (
      activeTab === 'Products' &&
      formData.products.length > 0 &&
      formData.products.every(
        (p) => p.product.trim() !== '' && p.quantity.trim() !== '' && p.pricePerUnit.trim() !== ''
      )
    ) {
      setActiveTab('Authorization');
    }
  }, [formData, activeTab]);

  // Calculate form completion
  const calculateProgress = (): number => {
    const fields = [
      formData.customerDetails,
      formData.loadingOrderNo,
      formData.vehicleNumber,
      formData.driverName,
      formData.loadingOrderDate,
      formData.products.some(p => p.product && p.quantity && p.pricePerUnit),
      formData.authorizedBy,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData | string, string>> = {};
    if (!formData.receiptId) newErrors.receiptId = 'Receipt ID is required';
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

  // Add product row
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

  // Generate PDF
  const generatePDF = (forDownload: boolean = false): Blob => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);

    // Watermark
    const watermarkText = 'Meru Soyco';
    doc.setFontSize(50);
    doc.setTextColor(200, 200, 200, 0.3);
    doc.text(watermarkText, 105, 150, { angle: 45, align: 'center' });
    doc.setTextColor(0);
    doc.setFontSize(12);

    // Header
    doc.addImage('https://mountmerugroup.com/uploads/site-setting/frontend/logo.svg', 'SVG', 20, 10, 30, 30);
    doc.text('DISPATCH RECEIPT', 105, 15, { align: 'center' });
    doc.text('Meru Soyco', 20, 45);
    doc.text('Kayonza, Rwanda', 20, 55);
    doc.text('Phone: +254 700 123 456 | Email: info@merusales.co.ke', 20, 65);
    doc.text(`Receipt ID: ${formData.receiptId}`, 20, 75);
    doc.text(`Invoice Number: ${formData.invoiceNumber || 'N/A'}`, 20, 85);
    doc.text(`Issue Date: ${formData.issueDate || 'N/A'}`, 20, 95);
    doc.text(`Due Date: ${formData.dueDate || 'N/A'}`, 20, 105);
    doc.text(`Customer: ${formData.customerDetails}`, 20, 115);
    doc.text(`Loading Order No: ${formData.loadingOrderNo}`, 20, 125);
    doc.text(`Vehicle Number: ${formData.vehicleNumber}`, 20, 135);
    doc.text(`Driver Name: ${formData.driverName}`, 20, 145);
    doc.text(`Loading Order Date: ${formData.loadingOrderDate}`, 20, 155);
    doc.text(`Purchase Order Ref: ${formData.purchaseOrderRef}`, 20, 165);
    doc.text(`Purchase Order Date: ${formData.purchaseOrderDate}`, 20, 175);
    if (formData.additionalInfo) {
      doc.text(`Additional Info: ${formData.additionalInfo}`, 20, 185);
    }

    // Products Table
    (doc as any).autoTable(doc, {
      startY: formData.additionalInfo ? 195 : 185,
      head: [['Product', 'SKU', 'Quantity', 'Price/Unit', 'Total Value']],
      body: formData.products.map((prod) => [
        prod.product,
        prod.sku,
        prod.quantity,
        prod.pricePerUnit,
        prod.totalValue,
      ]),
      theme: 'grid',
      headStyles: { fillColor: [44, 91, 72], textColor: [255, 255, 255] },
      styles: { fontSize: 10 },
      didDrawPage: () => {
        if (!forDownload) {
          doc.setFontSize(50);
          doc.setTextColor(200, 200, 200, 0.3);
          doc.text(watermarkText, 105, 150, { angle: 45, align: 'center' });
          doc.setTextColor(0);
          doc.setFontSize(12);
        }
      },
    });

    // Authorization
    let finalY = (doc as any).lastAutoTable.finalY || 195;
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

  // Handle print
  const handlePrint = () => {
    if (validateForm()) {
      window.print();
      addNotification('Receipt printed successfully!', 'success');
    } else {
      addNotification('Please fix form errors before printing.', 'error');
    }
  };

  // Handle print or PDF prompt
  const handlePrintOrPdfPrompt = () => {
    if (!validateForm()) {
      addNotification('Please fix form errors before proceeding.', 'error');
      return;
    }
    const userChoice = window.confirm('Click OK to print the receipt or Cancel to download PDF.');
    if (userChoice) {
      handlePrint();
    } else {
      handleDownloadPDF();
    }
  };

  // Handle PDF download
  const handleDownloadPDF = () => {
    if (!validateForm()) {
      addNotification('Please fix form errors before downloading.', 'error');
      return;
    }
    const docBlob = generatePDF(true);
    const url = URL.createObjectURL(docBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DispatchReceipt_${formData.receiptId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addNotification('PDF downloaded successfully!', 'success');
  };

  // Handle sharing
  const handleShare = async () => {
    if (!validateForm()) {
      addNotification('Please fix form errors before sharing.', 'error');
      return;
    }

    const pdfBlob = generatePDF();
    const pdfFile = new File([pdfBlob], `DispatchReceipt_${formData.receiptId}.pdf`, { type: 'application/pdf' });
    const shareableLink = `https://merusales.co.ke/receipt/${formData.receiptId}`;

    const shareData = {
      title: 'Dispatch Receipt',
      text: `Dispatch Receipt ${formData.receiptId} for Loading Order No: ${formData.loadingOrderNo}`,
      url: shareableLink,
      files: [pdfFile],
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        addNotification('Receipt shared successfully!', 'success');
      } catch (err) {
        console.error('Error sharing:', err);
        addNotification('Error sharing receipt.', 'error');
      }
    } else {
      addNotification('Native sharing not supported. Use Email, WhatsApp, or copy link.', 'info');
    }
  };

  // Handle email share
  const handleEmailShare = () => {
    if (!validateForm()) {
      addNotification('Please fix form errors before sharing.', 'error');
      return;
    }
    const subject = `Dispatch Receipt ${formData.receiptId} - Loading Order No: ${formData.loadingOrderNo}`;
    const body = `Dear Recipient,\n\nAttached is the dispatch receipt ${formData.receiptId} for Loading Order No: ${formData.loadingOrderNo}.\n\nDetails:\nCustomer: ${formData.customerDetails}\nReceipt ID: ${formData.receiptId}\nInvoice Number: ${formData.invoiceNumber || 'N/A'}\nIssue Date: ${formData.issueDate || 'N/A'}\n\nBest regards,\nMeru Soyco`;
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    addNotification('Email share initiated!', 'success');
  };

  // Handle WhatsApp share
  const handleWhatsAppShare = () => {
    if (!validateForm()) {
      addNotification('Please fix form errors before sharing.', 'error');
      return;
    }
    const message = `Dispatch Receipt ${formData.receiptId} for Loading Order No: ${formData.loadingOrderNo}\nCustomer: ${formData.customerDetails}\nReceipt ID: ${formData.receiptId}\nInvoice Number: ${formData.invoiceNumber || 'N/A'}\nView receipt: https://merusales.co.ke/receipt/${formData.receiptId}`;
    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');
    addNotification('WhatsApp share initiated!', 'success');
  };

  // Handle copy link
  const handleCopyLink = () => {
    if (!validateForm()) {
      addNotification('Please fix form errors before sharing.', 'error');
      return;
    }
    const shareableLink = `https://merusales.co.ke/receipt/${formData.receiptId}`;
    navigator.clipboard.writeText(shareableLink).then(() => {
      addNotification('Link copied to clipboard!', 'success');
    }).catch(() => {
      addNotification('Failed to copy link.', 'error');
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 font-sans print:bg-white print:relative">
      {/* Watermark for Print */}
      <style>
        {`
          @media print {
            body::before {
              content: 'Meru Soyco';
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 80px;
              color: rgba(200, 200, 200, 0.3);
              z-index: -1;
            }
          }
        `}
      </style>

      {/* Header */}
      <header className="max-w-6xl mx-auto mb-6 animate-fade-in">
        <Card className="bg-gradient-to-r from-[#2C5B48] to-[#22c55e] text-white rounded-lg shadow-xl p-6 print:bg-white print:text-black">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <img
              src="https://mountmerugroup.com/uploads/site-setting/frontend/logo.svg"
              alt="Meru Soyco Logo"
              className="w-16 h-16 object-contain"
            />
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold">Meru Soyco</h1>
              <p className="text-sm mt-2">
                Kayonza, Rwanda<br />
                Phone: +254 700 123 456 | Email: info@merusales.co.ke<br />
                Website: www.merusales.co.ke
              </p>
            </div>
            <div className="text-sm text-right">
              <p>Receipt ID: {formData.receiptId.slice(0, 8)}...</p>
              <p>Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </Card>
      </header>

      <div className="max-w-6xl mx-auto space-y-6 print:space-y-2">
        {/* Progress Bar */}
        <div className="animate-slide-up">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-[#2C5B48]">Form Progress</h2>
            <span className="text-sm text-gray-600">{calculateProgress()}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-[#2C5B48] h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 mb-4 print:hidden animate-fade-in">
          {['Customer', 'Order', 'Products', 'Authorization'].map(tab => (
            <button
              key={tab}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-[#2C5B48] text-[#2C5B48]'
                  : 'text-gray-500 hover:text-[#2C5B48]'
              }`}
              onClick={() => setActiveTab(tab as 'Customer' | 'Order' | 'Products' | 'Authorization')}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Form Content */}
        {activeTab === 'Customer' && (
          <Card title="Customer Information" className="animate-slide-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Customer Details</label>
                <textarea
                  name="customerDetails"
                  placeholder="Name, Address, Contact"
                  value={formData.customerDetails}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#2C5B48] print:border-0"
                  rows={4}
                  aria-label="Customer Details"
                  required
                />
                <span title="Enter customer name and address" className="absolute top-8 right-2">
                  <InfoIcon size={16} className="text-gray-400" />
                </span>
                {errors.customerDetails && <p className="text-red-500 text-xs mt-1">{errors.customerDetails}</p>}
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'Order' && (
          <Card title="Order Details" className="animate-slide-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Receipt ID</label>
                <input
                  type="text"
                  name="receiptId"
                  value={formData.receiptId}
                  readOnly
                  className="w-full p-2 text-sm border border-gray-300 rounded bg-gray-100 print:border-0"
                  aria-label="Receipt ID"
                />
                <span title="Auto-generated unique ID" className="absolute top-8 right-2">
                  <InfoIcon size={16} className="text-gray-400" />
                </span>
                {errors.receiptId && <p className="text-red-500 text-xs mt-1">{errors.receiptId}</p>}
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  placeholder="INV-001"
                  value={formData.invoiceNumber}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#2C5B48] print:border-0"
                  aria-label="Invoice Number"
                />
                <span title="Optional invoice number" className="absolute top-8 right-2">
                  <InfoIcon size={16} className="text-gray-400" />
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Issue Date</label>
                <input
                  type="date"
                  name="issueDate"
                  value={formData.issueDate}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#2C5B48] print:border-0"
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
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#2C5B48] print:border-0"
                  aria-label="Due Date"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Loading Order No</label>
                <input
                  type="text"
                  name="loadingOrderNo"
                  placeholder="Loading Order No"
                  value={formData.loadingOrderNo}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#2C5B48] print:border-0"
                  aria-label="Loading Order Number"
                  required
                />
                {errors.loadingOrderNo && <p className="text-red-500 text-xs mt-1">{errors.loadingOrderNo}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Loading Order Date</label>
                <input
                  type="date"
                  name="loadingOrderDate"
                  value={formData.loadingOrderDate}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#2C5B48] print:border-0"
                  aria-label="Loading Order Date"
                  required
                />
                {errors.loadingOrderDate && <p className="text-red-500 text-xs mt-1">{errors.loadingOrderDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Vehicle Number</label>
                <input
                  type="text"
                  name="vehicleNumber"
                  placeholder="Vehicle Number"
                  value={formData.vehicleNumber}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#2C5B48] print:border-0"
                  aria-label="Vehicle Number"
                  required
                />
                {errors.vehicleNumber && <p className="text-red-500 text-xs mt-1">{errors.vehicleNumber}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Driver Name</label>
                <input
                  type="text"
                  name="driverName"
                  placeholder="Driver Name"
                  value={formData.driverName}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#2C5B48] print:border-0"
                  aria-label="Driver Name"
                  required
                />
                {errors.driverName && <p className="text-red-500 text-xs mt-1">{errors.driverName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Purchase Order Ref</label>
                <input
                  type="text"
                  name="purchaseOrderRef"
                  placeholder="Purchase Order Ref"
                  value={formData.purchaseOrderRef}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#2C5B48] print:border-0"
                  aria-label="Purchase Order Reference"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Purchase Order Date</label>
                <input
                  type="date"
                  name="purchaseOrderDate"
                  value={formData.purchaseOrderDate}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#2C5B48] print:border-0"
                  aria-label="Purchase Order Date"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Additional Info</label>
              <input
                type="text"
                name="additionalInfo"
                placeholder="Optional notes"
                value={formData.additionalInfo || ''}
                onChange={handleInputChange}
                className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#2C5B48] print:border-0"
                aria-label="Additional Information"
              />
            </div>
          </Card>
        )}

        {activeTab === 'Products' && (
          <Card title="Products" className="animate-slide-up">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#2C5B48] text-white print:bg-gray-100 print:text-black">
                    <th className="border border-gray-300 px-2 py-1 font-bold print:border-black">Product</th>
                    <th className="border border-gray-300 px-2 py-1 font-bold print:border-black">SKU</th>
                    <th className="border border-gray-300 px-2 py-1 font-bold print:border-black">Quantity</th>
                    <th className="border border-gray-300 px-2 py-1 font-bold print:border-black">Price/Unit</th>
                    <th className="border border-gray-300 px-2 py-1 font-bold print:border-black">Total Value</th>
                    <th className="border border-gray-300 px-2 py-1 font-bold print:hidden">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.products.map((prod, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition">
                      <td className="border border-gray-300 px-2 py-1 print:border-black">
                        <input
                          type="text"
                          value={prod.product}
                          placeholder="Product"
                          onChange={(e) => handleInputChange(e, index, 'product')}
                          className="w-full p-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#2C5B48] print:border-0"
                          aria-label={`Product ${index + 1}`}
                          required
                        />
                        {errors[`product_${index}`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`product_${index}`]}</p>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 print:border-black">
                        <input
                          type="text"
                          value={prod.sku}
                          placeholder="SKU"
                          onChange={(e) => handleInputChange(e, index, 'sku')}
                          className="w-full p-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#2C5B48] print:border-0"
                          aria-label={`SKU ${index + 1}`}
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 print:border-black">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={prod.quantity}
                          placeholder="Quantity"
                          onChange={(e) => handleInputChange(e, index, 'quantity')}
                          className="w-full p-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#2C5B48] print:border-0"
                          aria-label={`Quantity ${index + 1}`}
                          required
                        />
                        {errors[`quantity_${index}`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`quantity_${index}`]}</p>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 print:border-black">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={prod.pricePerUnit}
                          placeholder="Price/Unit"
                          onChange={(e) => handleInputChange(e, index, 'pricePerUnit')}
                          className="w-full p-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#2C5B48] print:border-0"
                          aria-label={`Price Per Unit ${index + 1}`}
                          required
                        />
                        {errors[`pricePerUnit_${index}`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`pricePerUnit_${index}`]}</p>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 print:border-black">
                        <input
                          type="text"
                          value={prod.totalValue}
                          readOnly
                          className="w-full p-1 text-sm border border-gray-300 rounded bg-gray-100 print:border-0"
                          aria-label={`Total Value ${index + 1}`}
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 print:hidden">
                        <button
                          type="button"
                          onClick={() => removeProductRow(index)}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50"
                          disabled={formData.products.length === 1}
                          aria-label={`Remove Product ${index + 1}`}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                type="button"
                onClick={addProductRow}
                className="mt-2 px-4 py-2 bg-[#2C5B48] text-white rounded hover:bg-[#224539] transition print:hidden"
                aria-label="Add Product"
              >
                Add Product
              </button>
            </div>
          </Card>
        )}

        {activeTab === 'Authorization' && (
          <Card title="Authorization" className="animate-slide-up">
            <textarea
              readOnly
              className="w-full p-2 text-sm font-semibold resize-none bg-gray-100 border-0 print:bg-white print:p-0"
              rows={4}
              value="WE HEREBY AUTHORIZE YOU TO LOAD THE AFOREMENTIONED GOOD IN THE ABOVE STATED VEHICLE NUMBER VIDE LOADING ORDER NO AS MENTIONED ABOVE EVEN DATE. WE HEREBY FURTHER MANDATE YOU TO DEDUCT THE QUANTITY AS LOADED HEREIN ABOVE FROM THE QUANTITY IN OUR PURCHASE ORDER AND YOUR CORRESPONDING SALES ORDER FOR GOOD ORDER."
              aria-label="Authorization Text"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Authorized By</label>
                <input
                  type="text"
                  name="authorizedBy"
                  placeholder="Authorized By"
                  value={formData.authorizedBy}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#2C5B48] print:border-0"
                  aria-label="Authorized By"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Prepared By</label>
                <input
                  type="text"
                  name="preparedBy"
                  placeholder="Prepared By"
                  value={formData.preparedBy}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#2C5B48] print:border-0"
                  aria-label="Prepared By"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Approved By</label>
                <input
                  type="text"
                  name="approvedBy"
                  placeholder="Approved By"
                  value={formData.approvedBy}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#2C5B48] print:border-0"
                  aria-label="Approved By"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-between items-center print:hidden animate-fade-in">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition hover:scale-105"
            aria-label="Preview Receipt"
          >
            <EyeIcon size={18} className="mr-2" />
            Preview
          </button>
          <div className="flex flex-wrap gap-3">
          <button
            onClick={handlePrintOrPdfPrompt}
            className="flex items-center px-4 py-2 bg-[#2C5B48] text-white rounded-md hover:bg-[#224539] transition hover:scale-105"
            aria-label="Print or Download Receipt"
          >
            <PrinterIcon size={18} className="mr-2" />
            Print / Download
          </button>
          {/* <button
            onClick={handleDownloadPDF}
            className="flex items-center px-4 py-2 bg-[#22c55e] text-white rounded-md hover:bg-[#16a34a] transition hover:scale-105"
            aria-label="Download PDF"
          >
            <DownloadIcon size={18} className="mr-2" />
            Download
          </button> */}
            <button
              onClick={handleShare}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition hover:scale-105"
              aria-label="Share Receipt"
            >
              <Share2Icon size={18} className="mr-2" />
              Share
            </button>
            <button
              onClick={handleEmailShare}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition hover:scale-105"
              aria-label="Share via Email"
            >
              <MailIcon size={18} className="mr-2" />
              Email
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition hover:scale-105"
              aria-label="Share via WhatsApp"
            >
              <MessageCircleIcon size={18} className="mr-2" />
              WhatsApp
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition hover:scale-105"
              aria-label="Copy Share Link"
            >
              <CopyIcon size={18} className="mr-2" />
              Copy Link
            </button>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in-fast">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 animate-slide-up">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
                onClick={() => setShowPreview(false)}
                aria-label="Close preview"
              >
                ×
              </button>
              <h4 className="text-xl font-bold mb-4 text-[#2C5B48]">Preview Dispatch Receipt</h4>
              <div className="overflow-y-auto max-h-96">
                <div className="mb-4">
                  <p><strong>Receipt ID:</strong> {formData.receiptId}</p>
                  <p><strong>Customer:</strong> {formData.customerDetails}</p>
                  <p><strong>Invoice Number:</strong> {formData.invoiceNumber || 'N/A'}</p>
                  <p><strong>Issue Date:</strong> {formData.issueDate || 'N/A'}</p>
                  <p><strong>Due Date:</strong> {formData.dueDate || 'N/A'}</p>
                </div>
                <h5 className="font-semibold text-[#2C5B48] mb-2">Order Details</h5>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <p><strong>Loading Order No:</strong> {formData.loadingOrderNo}</p>
                  <p><strong>Vehicle Number:</strong> {formData.vehicleNumber}</p>
                  <p><strong>Driver Name:</strong> {formData.driverName}</p>
                  <p><strong>Loading Order Date:</strong> {formData.loadingOrderDate}</p>
                  <p><strong>Purchase Order Ref:</strong> {formData.purchaseOrderRef}</p>
                  <p><strong>Purchase Order Date:</strong> {formData.purchaseOrderDate}</p>
                  {formData.additionalInfo && <p><strong>Additional Info:</strong> {formData.additionalInfo}</p>}
                </div>
                <h5 className="font-semibold text-[#2C5B48] mb-2">Products</h5>
                <table className="min-w-full border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">Product</th>
                      <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">SKU</th>
                      <th className="px-2 py-1 text-right text-xs font-semibold text-gray-700">Quantity</th>
                      <th className="px-2 py-1 text-right text-xs font-semibold text-gray-700">Price/Unit</th>
                      <th className="px-2 py-1 text-right text-xs font-semibold text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.products.map((prod, index) => (
                      <tr key={index}>
                        <td className="px-2 py-1 text-gray-600">{prod.product}</td>
                        <td className="px-2 py-1 text-gray-600">{prod.sku}</td>
                        <td className="px-2 py-1 text-gray-900 text-right">{prod.quantity}</td>
                        <td className="px-2 py-1 text-gray-900 text-right">{prod.pricePerUnit}</td>
                        <td className="px-2 py-1 text-gray-900 text-right">{prod.totalValue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <h5 className="font-semibold text-[#2C5B48] mt-4 mb-2">Authorization</h5>
                <p className="text-sm text-gray-600 mb-4">
                  WE HEREBY AUTHORIZE YOU TO LOAD THE AFOREMENTIONED GOOD IN THE ABOVE STATED VEHICLE NUMBER VIDE LOADING ORDER NO AS MENTIONED ABOVE EVEN DATE. WE HEREBY FURTHER MANDATE YOU TO DEDUCT THE QUANTITY AS LOADED HEREIN ABOVE FROM THE QUANTITY IN OUR PURCHASE ORDER AND YOUR CORRESPONDING SALES ORDER FOR GOOD ORDER.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <p><strong>Authorized By:</strong> {formData.authorizedBy}</p>
                  <p><strong>Prepared By:</strong> {formData.preparedBy}</p>
                  <p><strong>Approved By:</strong> {formData.approvedBy}</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="px-6 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition hover:scale-105"
                  onClick={() => setShowPreview(false)}
                >
                  Close
                </button>
                <button
                  className="px-6 py-2 rounded-lg font-semibold bg-[#2C5B48] text-white hover:bg-[#224539] transition hover:scale-105"
                  onClick={handleDownloadPDF}
                >
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DispatchReceipt;