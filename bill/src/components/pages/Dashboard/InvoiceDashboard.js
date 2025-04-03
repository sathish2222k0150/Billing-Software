import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import { FaFileInvoice, FaFileAlt, FaTools, FaRupeeSign } from 'react-icons/fa';

function InvoiceDashboard() {
  const [stats, setStats] = useState({
    taxInvoices: { count: 0, revenue: 0 },
    estimateInvoices: { count: 0, revenue: 0 },
    labourInvoices: { count: 0, revenue: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/invoice-stats');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching invoice stats:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage="Invoice Dashboard" />
      <div className="flex-1 flex flex-col p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-6">Invoice Dashboard</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error loading invoice stats: {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tax Invoices Card */}
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Tax Invoices</h3>
                  <p className="text-3xl font-bold mt-2">{stats.taxInvoices.count}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <FaFileInvoice className="text-blue-500 text-2xl" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <FaRupeeSign className="text-gray-500 mr-1" />
                <p className="text-lg font-semibold">
                  {stats.taxInvoices.revenue.toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                  })}
                </p>
              </div>
              <p className="text-sm text-gray-500 mt-1">Total revenue from tax invoices</p>
            </div>

            {/* Estimate Invoices Card */}
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Estimates</h3>
                  <p className="text-3xl font-bold mt-2">{stats.estimateInvoices.count}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <FaFileAlt className="text-green-500 text-2xl" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <FaRupeeSign className="text-gray-500 mr-1" />
                <p className="text-lg font-semibold">
                  {stats.estimateInvoices.revenue.toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                  })}
                </p>
              </div>
              <p className="text-sm text-gray-500 mt-1">Total revenue from estimates</p>
            </div>

            {/* Labour Invoices Card */}
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Labour Invoices</h3>
                  <p className="text-3xl font-bold mt-2">{stats.labourInvoices.count}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <FaTools className="text-orange-500 text-2xl" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <FaRupeeSign className="text-gray-500 mr-1" />
                <p className="text-lg font-semibold">
                  {stats.labourInvoices.revenue.toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                  })}
                </p>
              </div>
              <p className="text-sm text-gray-500 mt-1">Total revenue from labour</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InvoiceDashboard;