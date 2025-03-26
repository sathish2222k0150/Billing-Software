import React from 'react';
import { Home, Settings, Package, Users, ShoppingCart, BarChart3, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoImage from '../assets/Images/sds logo.png'
function Sidebar() {
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: <Home className="w-5 h-5 mr-3" />, path: '/Dashboard' },
    { name: 'Inventory', icon: <Package className="w-5 h-5 mr-3" />, path: '/Product' },
    { name: 'Add Product',    icon: <ShoppingCart className="w-5 h-5 mr-3" />, path: '/AddProduct' },
    { name: 'Customers', icon: <Users className="w-5 h-5 mr-3" />, path: '/Customers' },
    { name: 'Invoices',  icon: <Receipt className="w-5 h-5 mr-3" />, path: '/Invoice' },
    { name: 'Reports',   icon: <BarChart3 className="w-5 h-5 mr-3" />, path: '/Reports' },
    { name: 'Settings',  icon: <Settings className="w-5 h-5 mr-3" />, path: '/Settings' }
  ];

  return (
    <aside className="w-64 bg-[#1C2434] text-white h-screen flex flex-col">
    {/* Logo Section */}
    <div className="p-6 flex flex-col items-center">
      <img src={logoImage} alt="Logo" className="w-20 h-20 rounded-full object-cover" />
      <span className="text-xl font-bold whitespace-nowrap mt-2"></span>
    </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-gray-400 hover:bg-gray-800"
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;
