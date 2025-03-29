import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiDownload, FiSearch, FiRefreshCw, FiHome } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Reports = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [invoiceType, setInvoiceType] = useState('All'); // 'All', 'tax', or 'labour'
    const navigate = useNavigate();

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = () => {
        setLoading(true);
        axios.get('http://localhost:5000/invoices-details')
            .then(response => {
                const validatedData = response.data.map(invoice => ({
                    ...invoice,
                    name: invoice.customer_name || 'N/A',
                    contact: invoice.customer_contact || 'N/A',
                    email: invoice.customer_email || 'N/A',
                    invoice_date: invoice.invoice_date || new Date().toISOString(),
                    status: invoice.status || 'Pending',
                    invoice_type: invoice.invoice_type || 'tax'
                }));
                setInvoices(validatedData);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setLoading(false);
            });
    };

    const downloadReport = () => {
        const doc = new jsPDF();
        doc.text(`${invoiceType === 'All' ? 'All' : invoiceType} Invoice Report`, 14, 10);
        
        const tableColumn = ["ID", "Name", "Contact", "Email", "Date", "Status", "Type"];
        const tableRows = filteredInvoices.map((invoice, index) => [
            index + 1,
            invoice.name,
            invoice.contact,
            invoice.email,
            new Date(invoice.invoice_date).toLocaleDateString(),
            invoice.status,
            invoice.invoice_type
        ]);
        
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });
        doc.save(`${invoiceType === 'All' ? 'All' : invoiceType}_Invoice_Report.pdf`);
    };

    const filteredInvoices = invoices.filter(invoice => {
        const name = invoice.name ? invoice.name.toLowerCase() : '';
        const email = invoice.email ? invoice.email.toLowerCase() : '';
        const contact = invoice.contact ? invoice.contact.toString() : '';
        const status = invoice.status ? invoice.status.toLowerCase() : '';
        const type = invoice.invoice_type ? invoice.invoice_type.toLowerCase() : '';
        
        const searchLower = searchTerm.toLowerCase();
        
        const matchesSearch = 
            name.includes(searchLower) ||
            email.includes(searchLower) ||
            contact.includes(searchTerm);
        
        const matchesStatus = 
            filterStatus === 'All' || 
            status === filterStatus.toLowerCase();
        
        const matchesType =
            invoiceType === 'All' ||
            type === invoiceType.toLowerCase();
        
        return matchesSearch && matchesStatus && matchesType;
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                when: "beforeChildren"
            }
        }
    };

    const rowVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 }
        }
    };

    const statusColors = {
        'Paid': 'bg-green-100 text-green-800',
        'Unpaid': 'bg-red-100 text-red-800',
        'Pending': 'bg-yellow-100 text-yellow-800',
        'Overdue': 'bg-orange-100 text-orange-800',
        'Completed': 'bg-blue-100 text-blue-800'
    };

    const typeColors = {
        'tax': 'bg-purple-100 text-purple-800',
        'labour': 'bg-indigo-100 text-indigo-800'
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container mx-auto p-4 max-w-6xl"
        >
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                >
                    <FiHome /> Dashboard
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                    <h2 className="text-3xl font-bold mb-2">
                        {invoiceType === 'All' ? 'All' : invoiceType === 'tax' ? 'Tax' : 'Labour'} Invoice Reports
                    </h2>
                    <p className="opacity-90">View and manage all invoice records</p>
                </div>

                <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div className="relative w-full md:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search invoices..."
                                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <select
                                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={invoiceType}
                                onChange={(e) => setInvoiceType(e.target.value)}
                            >
                                <option value="All">All Types</option>
                                <option value="tax">Tax Invoices</option>
                                <option value="labour">Labour Invoices</option>
                            </select>

                            <select
                                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Paid">Paid</option>
                                <option value="Unpaid">Unpaid</option>
                                <option value="Pending">Pending</option>
                                <option value="Overdue">Overdue</option>
                                <option value="Completed">Completed</option>
                            </select>

                            <button
                                onClick={downloadReport}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                disabled={filteredInvoices.length === 0}
                            >
                                <FiDownload /> Export
                            </button>

                            <button
                                onClick={fetchInvoices}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="overflow-x-auto"
                        >
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-left">
                                        <th className="px-6 py-3 font-medium text-gray-700 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 font-medium text-gray-700 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-3 font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell">Email</th>
                                        <th className="px-6 py-3 font-medium text-gray-700 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 font-medium text-gray-700 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 font-medium text-gray-700 uppercase tracking-wider">Type</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredInvoices.length > 0 ? (
                                        filteredInvoices.map((invoice, index) => (
                                            <motion.tr 
                                                key={index} 
                                                variants={rowVariants}
                                                whileHover={{ scale: 1.01, backgroundColor: 'rgba(249, 250, 251, 1)' }}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900">{invoice.name}</div>
                                                    <div className="text-sm text-gray-500 md:hidden">{invoice.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{invoice.contact}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-700 hidden md:table-cell">{invoice.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                                    {new Date(invoice.invoice_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[invoice.status] || 'bg-gray-100 text-gray-800'}`}>
                                                        {invoice.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${typeColors[invoice.invoice_type] || 'bg-gray-100 text-gray-800'}`}>
                                                        {invoice.invoice_type}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <motion.tr 
                                            variants={rowVariants}
                                            className="text-center"
                                        >
                                            <td colSpan="6" className="px-6 py-8 text-gray-500">
                                                No invoices found matching your criteria
                                            </td>
                                        </motion.tr>
                                    )}
                                </tbody>
                            </table>
                        </motion.div>
                    )}
                </div>

                {filteredInvoices.length > 0 && (
                    <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-medium">{filteredInvoices.length}</span> of <span className="font-medium">{invoices.length}</span> invoices
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Reports;