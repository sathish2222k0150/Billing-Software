import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import Sidebar from "../Sidebar";

function Dashboard() {
  const [currentPage] = useState("Dashboard");
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState([
    { title: "Total Invoices", value: "+0%", count: "0" },
    { title: "Parts Inventory", value: "+0%", count: "0" },
    { title: "Pending Orders", value: "+0%", count: "0" },
    { title: "Revenue", value: "+0%", count: "$0.00" },
  ]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount).replace('₹', '₹ ');
  };

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/dashboard-stats");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        setStats([
          { 
            title: "Total Invoices", 
            value: "+0%",
            count: formatNumber(data.totalInvoices)
          },
          { 
            title: "Parts Inventory", 
            value: "+0%", 
            count: formatNumber(data.totalParts)
          },
          { 
            title: "Pending Orders", 
            value: "+0%", 
            count: formatNumber(data.pendingOrders)
          },
          { 
            title: "Revenue", 
            value: "+0%", 
            count: formatCurrency(data.totalRevenue)
          },
        ]);
      } catch (error) {
        console.error("Error fetching stats:", error);
        // You might want to set some error state here
      } finally {
        setStatsLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  // Fetch invoices from backend
  useEffect(() => {
    fetch("http://localhost:5000/invoice-summary")
      .then((response) => response.json())
      .then((data) => {
        setInvoices(data);
        setFilteredInvoices(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching invoices:", error);
        setError("Failed to load data. Please try again later.");
        setLoading(false);
      });
  }, []);

  // Handle search filter
  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredInvoices(
      invoices.filter(
        (invoice) =>
          invoice.customer_name.toLowerCase().includes(query) ||
          invoice.invoice_number.toString().includes(query) ||
          invoice.status.toLowerCase().includes(query)
      )
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} />
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-8 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">{currentPage}</h1>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>
          </div>
        </div>
        {/* Stats Section */}
        <div className="p-8">
          {statsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                    <span
                      className={`text-sm ${
                        stat.value.startsWith("+") ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Table Section */}
        <div className="p-8">
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="relative w-64">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>
            
            {/* Table Content */}
            {loading ? (
              <p className="p-6 text-gray-500">Loading invoices...</p>
            ) : error ? (
              <p className="p-6 text-red-500">{error}</p>
            ) : filteredInvoices.length === 0 ? (
              <p className="p-6 text-gray-500">No invoices found</p>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Due</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-100">
                      <td className="px-6 py-4">{invoice.customer_name || "N/A"}</td>
                      <td className="px-6 py-4">
                        {invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4">₹{Number(invoice.subtotal || invoice.summary_subtotal || 0).toFixed(2)}</td>
                      <td className="px-6 py-4">₹{Number(invoice.total_due || 0).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        {invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;