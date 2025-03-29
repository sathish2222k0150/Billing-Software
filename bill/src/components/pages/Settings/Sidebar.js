import { 
    Building2,
    CreditCard,
    Truck,
    FileText,
    Palette,
    LifeBuoy,
    Users,
    Shield
  } from 'lucide-react';
  
  export const tabs = [
    { id: 'business', label: 'Business Profile', icon: Building2 },
    { id: 'billing', label: 'Billing & Invoicing', icon: CreditCard },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'legal', label: 'Legal', icon: FileText },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'help', label: 'Help & Support', icon: LifeBuoy },
    { id: 'team', label: 'Team Access', icon: Users },
    { id: 'security', label: 'Security', icon: Shield }
  ];
  
  export const defaultSettings = {
    businessName: 'Auto Parts India',
    phone: '+91 98765 43210',
    email: 'contact@autopartsindia.com',
    address: '123 Auto Street, Mumbai, Maharashtra 400001',
    website: 'www.autopartsindia.com',
    currency: 'INR',
    taxRate: 18, // Default GST rate
    invoicePrefix: 'INV-',
    paymentTerms: 'Net 30',
    shippingNotes: 'Standard shipping within 3-5 business days across India',
    invoiceNotes: 'Thank you for your business!',
    termsAndConditions: 'Standard terms and conditions apply as per Indian law',
    theme: 'light',
    language: 'en',
    fontSize: 'medium'
  };