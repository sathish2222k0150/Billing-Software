import React, { useEffect, useState } from "react";

const CustomerDetails = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [editedStatus, setEditedStatus] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all invoices with their total amounts
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch("http://localhost:5000/customers");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        console.log("Fetched Customers:", data);

        if (Array.isArray(data)) {
          // Ensure all required fields exist
          const validatedData = data.map(item => ({
            ...item,
            invoice_id: item.invoice_id || 'N/A',
            name: item.name || item.customer_name || 'N/A',
            address: item.address || 'N/A',
            contact: item.contact || 'N/A',
            email: item.email || 'N/A',
            model: item.model || 'N/A',
            reg_no: item.reg_no || 'N/A',
            invoice_date: item.invoice_date || new Date().toISOString(),
            status: item.status || 'Pending',
            total_due: item.total_due || 0
          }));

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
  }, []);

  // Sort invoices (Pending first, then Paid)
  const sortAndSetCustomers = (data) => {
    if (!Array.isArray(data)) return;
    const sortedData = [...data].sort((a, b) => (a.status === "Pending" ? -1 : 1));
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

    try {
      const response = await fetch(`http://localhost:5000/update-status/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
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

    try {
      const response = await fetch(`http://localhost:5000/delete-invoice/${id}`, { 
        method: "DELETE" 
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
        (customer.contact && customer.contact.includes(searchTerm))
      );
    });

    sortAndSetCustomers(filtered);
  }, [searchTerm, customers]);

  // Debug output
  console.log("Current filtered customers:", filteredCustomers);

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Customer Details</h2>
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by Name, Invoice ID, Email, or Contact..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
      />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="p-3">Invoice ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Address</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Email</th>
                <th className="p-3">Model</th>
                <th className="p-3">Reg No</th>
                <th className="p-3">Invoice Date</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr 
                    key={`${customer.invoice_id}-${customer.invoice_date}`}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-3">{customer.invoice_id}</td>
                    <td className="p-3">{customer.name}</td>
                    <td className="p-3">{customer.address}</td>
                    <td className="p-3">{customer.contact}</td>
                    <td className="p-3">{customer.email}</td>
                    <td className="p-3">{customer.model}</td>
                    <td className="p-3">{customer.reg_no}</td>
                    <td className="p-3">
                      {new Date(customer.invoice_date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="p-3 font-mono">
                        {customer.total_due ? Number(customer.total_due).toLocaleString('en-IN', {
                          style: 'currency',
                          currency: 'INR'
                        }) : "N/A"}
                      </td>
                      <td className="p-3">
                      {editingInvoiceId === customer.invoice_id ? (
                        <select
                          value={editedStatus[customer.invoice_id] || customer.status}
                          onChange={(e) =>
                            setEditedStatus({ ...editedStatus, [customer.invoice_id]: e.target.value })
                          }
                          className="border p-1 rounded"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                        </select>
                      ) : (
                        <span
                          className={`font-bold ${customer.status === "Paid" ? "text-green-500" : "text-red-500"}`}
                        >
                          {customer.status}
                        </span>
                      )}
                    </td>
                    <td className="p-3 space-x-2">
                      {editingInvoiceId === customer.invoice_id ? (
                        <button 
                          onClick={() => handleSaveClick(customer.invoice_id)} 
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEditClick(customer.invoice_id, customer.status)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteClick(customer.invoice_id)} 
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="text-center p-4 text-gray-500">
                    {customers.length === 0 ? 'No customer records found' : 'No matching records'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomerDetails;