import React, { useState } from 'react';
import { 
  Home, Settings, Package, Users, 
  ShoppingCart, BarChart3, Receipt, 
  ChevronLeft, ChevronRight, Menu, LayoutDashboard,FileText
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoImage from '../assets/Images/sds logo.png';
import { motion, AnimatePresence } from 'framer-motion';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: <Home className="w-5 h-5" />, path: '/Dashboard' },
    { name: 'InvoiceDashboard', icon: <Home className="w-5 h-5" />, path: '/InvoiceDashboard' },
    { name: 'Inventory', icon: <Package className="w-5 h-5" />, path: '/Product' },
    { name: 'Add Product', icon: <ShoppingCart className="w-5 h-5" />, path: '/AddProduct' },
    { name: 'Customers', icon: <Users className="w-5 h-5" />, path: '/Customers' },
    { name: 'TaxInvoices', icon: <Receipt className="w-5 h-5" />, path: '/Invoice' },
    { name: 'InvoiceDetails', icon: <LayoutDashboard className="w-5 h-5" />, path: '/InvoiceDetails' },
    { name: 'Reports', icon: <BarChart3 className="w-5 h-5" />, path: '/Reports' },
    { name: 'EstimateInvoice', icon: <FileText className="w-5 h-5" />, path: '/Estimate' },
    { name: 'EstimateDetails', icon: <LayoutDashboard className="w-5 h-5" />, path: '/EstimateDetails' },
    { name: 'LabourInvoice', icon: <FileText className="w-5 h-5" />, path: '/Labour' },
    { name: 'LabourDetails', icon: <LayoutDashboard className="w-5 h-5" />, path: '/LabourDetails' },
    { name: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/Settings' }
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Persistent Toggle Button (always visible) */}
      <button 
        onClick={isMobileOpen ? toggleMobileSidebar : toggleSidebar}
        className={`hidden md:flex fixed z-50 p-2 rounded-lg bg-[#1C2434] text-white transition-all duration-300
          ${isCollapsed ? 'left-4 top-4' : 'left-[17rem] top-4'}`}
      >
        {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>

      {/* Mobile Toggle Button */}
      <button 
        onClick={toggleMobileSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#1C2434] text-white"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {(isMobileOpen || !isCollapsed) && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed md:relative z-40 w-64 bg-[#1C2434] text-white h-screen flex flex-col border-r border-gray-700 ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}
          >
            {/* Logo Section */}
            <div className="p-4 flex flex-col items-center relative">
              {(!isCollapsed || isMobileOpen) && (
                <img src={logoImage} alt="Logo" className="w-16 h-16 rounded-full object-cover" />
              )}
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 p-2 overflow-y-auto">
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all
                      ${location.pathname === item.path 
                        ? 'bg-[#3C4A68] text-white' 
                        : 'text-gray-300 hover:bg-[#2C3A58] hover:text-white'
                      }`}
                  >
                    <span className="flex-shrink-0">
                      {React.cloneElement(item.icon, { className: 'w-5 h-5' })}
                    </span>
                    {(!isCollapsed || isMobileOpen) && (
                      <motion.span 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="ml-3 whitespace-nowrap"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </button>
                ))}
              </div>
            </nav>

            {/* Collapse Button for Mobile */}
            {isMobileOpen && (
              <div className="p-4 md:hidden">
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-[#3C4A68] text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="ml-2">Close Menu</span>
                </button>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;