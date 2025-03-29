import React, { useEffect, useState } from "react";
import Sidebar from "../Sidebar";
import { motion } from "framer-motion";
import { FaFileInvoice, FaFileAlt, FaTools } from "react-icons/fa";

const CustomerDetails = () => {
  const [currentPage] = useState("Dashboard");
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [editedStatus, setEditedStatus] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState("tax"); // 'tax' or 'labour'

  // Fetch all invoices with their total amounts
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(`http://localhost:5000/customers?type=${invoiceTypeFilter}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        console.log("Fetched Customers:", data);

        if (Array.isArray(data)) {
          // Format data based on invoice type
          const validatedData = data.map(item => {
            if (invoiceTypeFilter === 'tax') {
              return {
                ...item,
                invoice_id: item.invoice_id || 'N/A',
                name: item.name || item.customer_name || 'N/A',
                address: item.address || item.customer_address || 'N/A',
                contact: item.contact || item.customer_contact || 'N/A',
                email: item.email || item.customer_email || 'N/A',
                model: item.model || item.vehicle_model || 'N/A',
                reg_no: item.reg_no || item.vehicle_reg_no || 'N/A',
                invoice_date: item.invoice_date || item.estimate_date || new Date().toISOString(),
                status: item.status || 'Pending',
                total_due: item.total_due || item.total_amount || 0,
                invoice_type: 'tax'
              };
            } else {
              // For labour invoices
              return {
                ...item,
                invoice_id: item.invoice_id || 'N/A',
                name: item.name || item.customer_name || 'N/A',
                address: item.address || item.customer_address || 'N/A',
                contact: item.contact || item.customer_contact || 'N/A',
                email: item.email || item.customer_email || 'N/A',
                invoice_date: item.invoice_date || new Date().toISOString(),
                status: item.status || 'Pending',
                total_due: item.total_due || item.total_amount || 0,
                invoice_type: 'labour'
              };
            }
          });

          setCustomers(validatedData);
          sortAndSetCustomers(validatedData);
        } else {
          console.error("Unexpected response format:", data);
          setCustomers([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [invoiceTypeFilter]);

  // Sort invoices (Pending first, then Paid/Completed)
  const sortAndSetCustomers = (data) => {
    if (!Array.isArray(data)) return;
    const sortedData = [...data].sort((a, b) => {
      if (a.status === "Pending") return -1;
      if (b.status === "Pending") return 1;
      return 0;
    });
    setFilteredCustomers(sortedData);
  };

  // Handle Edit Click
  const handleEditClick = (id, currentStatus) => {
    setEditingInvoiceId(id);
    setEditedStatus({ ...editedStatus, [id]: currentStatus });
  };

  // Handle Save Click (Update Status)
  const handleSaveClick = async (id) => {
    const newStatus = editedStatus[id];
    const invoiceType = customers.find(c => c.invoice_id === id)?.invoice_type || 'tax';

    try {
      const response = await fetch(`http://localhost:5000/update-status/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          status: newStatus,
          invoice_type: invoiceType 
        }),
      });

      if (response.ok) {
        const updatedCustomers = customers.map((customer) =>
          customer.invoice_id === id ? { ...customer, status: newStatus } : customer
        );
        setCustomers(updatedCustomers);
        sortAndSetCustomers(updatedCustomers);
        setEditingInvoiceId(null);
      } else {
        console.error("Failed to update status");
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status");
    }
  };

  // Handle Delete Click
  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    
    const invoiceType = customers.find(c => c.invoice_id === id)?.invoice_type || 'tax';

    try {
      const response = await fetch(`http://localhost:5000/delete-invoice/${id}`, { 
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invoice_type: invoiceType })
      });

      if (response.ok) {
        const updatedCustomers = customers.filter((customer) => customer.invoice_id !== id);
        setCustomers(updatedCustomers);
        sortAndSetCustomers(updatedCustomers);
      } else {
        console.error("Failed to delete invoice");
        alert("Failed to delete invoice");
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
      alert("Error deleting invoice");
    }
  };

  // Handle Search
  useEffect(() => {
    if (!Array.isArray(customers)) return;

    const filtered = customers.filter((customer) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (customer.name && customer.name.toLowerCase().includes(searchLower)) ||
        (customer.invoice_id && customer.invoice_id.toString().includes(searchTerm)) ||
        (customer.email && customer.email.toLowerCase().includes(searchLower)) ||
        (customer.contact && customer.contact.includes(searchTerm)) ||
        (customer.invoice_type && customer.invoice_type.toLowerCase().includes(searchLower))
      );
    });

    sortAndSetCustomers(filtered);
  }, [searchTerm, customers]);

  // Get icon for invoice type
  const getInvoiceIcon = (type) => {
    switch(type) {
      case 'tax':
        return <FaFileInvoice className="text-blue-500" />;
      case 'estimate':
        return <FaFileAlt className="text-green-500" />;
      case 'labour':
        return <FaTools className="text-orange-500" />;
      default:
        return <FaFileInvoice />;
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 fixed h-full">
        <Sidebar currentPage={currentPage} />
      </div>
    
      {/* Main Content */}
      <div className="flex-1 ml-64 p-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold ml-16 mb-6">Customer Details</h2>
        
          {/* Invoice Type Filter */}
          <div className="flex items-center mb-6">
            <div className="mr-4">
              <label className="mr-2">Invoice Type:</label>
              <select
                value={invoiceTypeFilter}
                onChange={(e) => setInvoiceTypeFilter(e.target.value)}
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="tax">Tax Invoices</option>
                <option value="labour">Labour Invoices</option>
              </select>
            </div>
            
            {/* Search Bar */}
            <input
              type="text"
              placeholder={`Search by ${invoiceTypeFilter === 'tax' ? 'Name, Invoice ID, Email, Contact' : 'Customer Name, Contact'}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
          </div>
        </motion.div>

        {/* Loading Indicator */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl shadow-lg border border-gray-200 bg-white">
            <div className="overflow-x-auto max-h-[calc(100vh-200px)]">
              <table className="min-w-full divide-y divide-gray-200">
                {/* Table Head */}
                <thead className="bg-gray-800 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Invoice ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
                    {invoiceTypeFilter === 'tax' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Vehicle</th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
        
                {/* Table Body */}
                <motion.tbody 
                  className="bg-white divide-y divide-gray-200 overflow-y-auto"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <motion.tr
                        key={`${customer.invoice_type}-${customer.invoice_id}`}
                        className="hover:bg-gray-50"
                        variants={rowVariants}
                        whileHover={{ scale: 1.005, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getInvoiceIcon(customer.invoice_type)}
                            <span className="ml-2 capitalize">{customer.invoice_type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {customer.invoice_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                          {customer.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.contact}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.email}
                        </td>
                        {invoiceTypeFilter === 'tax' && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              <div>{customer.model}</div>
                              <div className="text-xs text-gray-500">{customer.reg_no}</div>
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(customer.invoice_date).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          ₹{Number(customer.total_due).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {editingInvoiceId === customer.invoice_id ? (
                            <select
                              value={editedStatus[customer.invoice_id] || customer.status}
                              onChange={(e) =>
                                setEditedStatus({
                                  ...editedStatus,
                                  [customer.invoice_id]: e.target.value,
                                })
                              }
                              className="border p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Paid">Paid</option>
                              {customer.invoice_type === 'labour' && (
                                <option value="Completed">Completed</option>
                              )}
                            </select>
                          ) : (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                customer.status === "Paid" 
                                  ? "bg-green-100 text-green-800"
                                  : customer.status === "Completed"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {customer.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          {editingInvoiceId === customer.invoice_id ? (
                            <motion.button
                              onClick={() => handleSaveClick(customer.invoice_id)}
                              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Save
                            </motion.button>
                          ) : (
                            <motion.button
                              onClick={() => handleEditClick(customer.invoice_id, customer.status)}
                              className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Edit
                            </motion.button>
                          )}
                          <motion.button
                            onClick={() => handleDeleteClick(customer.invoice_id)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Delete
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <motion.tr
                      variants={rowVariants}
                    >
                      <td colSpan={invoiceTypeFilter === 'tax' ? "10" : "9"} className="text-center p-4 text-gray-500">
                        {customers.length === 0 ? "No customer records found" : "No matching records"}
                      </td>
                    </motion.tr>
                  )}
                </motion.tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetails;