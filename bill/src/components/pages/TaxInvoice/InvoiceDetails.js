import React, { useState } from "react";
import Sidebar from "../Sidebar";
import logoImage from "../../assets/Images/sds logo.png";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useNavigate } from "react-router-dom";

function InvoiceSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:5000/search-invoices?name=${searchTerm}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const formattedData = data.map(invoice => ({
        ...invoice,
        total_amount: Number(invoice.total_amount) || 0,
        subtotal: Number(invoice.subtotal) || 0,
        cgst: Number(invoice.cgst) || 0,
        sgst: Number(invoice.sgst) || 0,
        parts: invoice.parts?.map(part => ({
          ...part,
          rate: Number(part.rate) || 0,
          quantity: Number(part.quantity) || 1,
          cgst: Number(part.cgst) || 0,
          sgst: Number(part.sgst) || 0
        })) || []
      }));
      setSearchResults(formattedData);
    } catch (error) {
      console.error("Error searching invoices:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleBackToSearch = () => {
    setSelectedInvoice(null);
  };

  const handleGeneratePDF = () => {
    const input = document.getElementById("invoice-preview");

    html2canvas(input, { 
      scale: 2,
      logging: true,
      useCORS: true,
      allowTaint: true
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Invoice_${selectedInvoice.invoice_id}.pdf`);

      setTimeout(() => {
        navigate("/InvoiceDetails");
      }, 1500);
    });
  };

  if (selectedInvoice) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar currentPage="Invoice Search" />
        <div className="flex-1 flex flex-col p-6 overflow-auto">
          <div className="flex gap-4 mb-4">
            <button
              onClick={handleBackToSearch}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Back to Search
            </button>
            <button
              onClick={handleGeneratePDF}
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            >
              Download PDF
            </button>
          </div>
          <InvoiceDetails invoice={selectedInvoice} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage="Invoice Search" />
      <div className="flex-1 flex flex-col p-6 overflow-auto">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">Search Invoices</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter customer name"
              className="flex-1 border border-gray-300 rounded px-4 py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {error && (
            <div className="mt-2 text-red-500 text-sm">{error}</div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Search Results</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="py-2 px-4 border text-left">Invoice ID</th>
                    <th className="py-2 px-4 border text-left">Customer Name</th>
                    <th className="py-2 px-4 border text-left">Date</th>
                    <th className="py-2 px-4 border text-left">Total Amount</th>
                    <th className="py-2 px-4 border text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((invoice) => (
                    <tr key={invoice.invoice_id} className="border-b">
                      <td className="py-2 px-4 border">{invoice.invoice_id}</td>
                      <td className="py-2 px-4 border">{invoice.name}</td>
                      <td className="py-2 px-4 border">
                        {new Date(invoice.invoice_date).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4 border">
                        ₹{(Number(invoice.total_amount) || 0).toFixed(2)}
                      </td>
                      <td className="py-2 px-4 border">
                        <button
                          onClick={() => handleViewInvoice(invoice)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          searchTerm && !isLoading && (
            <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
              No invoices found for "{searchTerm}"
            </div>
          )
        )}
      </div>
    </div>
  );
}

function InvoiceDetails({ invoice }) {
  const calculateTotals = () => {
    if (invoice.subtotal && invoice.cgst && invoice.sgst && invoice.total_amount) {
      return {
        subtotal: Number(invoice.subtotal) || 0,
        totalCGST: Number(invoice.cgst) || 0,
        totalSGST: Number(invoice.sgst) || 0,
        grandTotal: Number(invoice.total_amount) || 0
      };
    }

    let subtotal = 0;
    let totalCGST = 0;
    let totalSGST = 0;

    invoice.parts?.forEach((part) => {
      const quantity = Number(part.quantity) || 1;
      const value = Number(part.rate) * quantity;
      const cgstAmount = (value * Number(part.cgst || 0)) / 100;
      const sgstAmount = (value * Number(part.sgst || 0)) / 100;
      
      subtotal += value;
      totalCGST += cgstAmount;
      totalSGST += sgstAmount;
    });

    const grandTotal = subtotal + totalCGST + totalSGST;
    return { subtotal, totalCGST, totalSGST, grandTotal };
  };

  const { subtotal, totalCGST, totalSGST, grandTotal } = calculateTotals();

  return (
    <div id="invoice-preview" className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <img src={logoImage} alt="SDS Motors" className="w-16 h-16" />
          <div>
          <h1 className="text-red-600 font-bold text-xl">SDS MOTORS</h1>
          <p className="text-sm text-gray-600">9842365406</p>
          <p className="text-sm text-gray-600">9952513032</p>
          <p className="text-sm text-gray-600">sdsmotors2019@gmail.com</p>
          </div>
        </div>

        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-700">INVOICE</h2>
          <p className="text-gray-600">#{invoice.invoice_id}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-semibold mb-2">Billed To</h3>
          <p className="font-semibold">{invoice.name}</p>
          <p className="text-gray-600">{invoice.address}</p>
          <p className="text-gray-600">{invoice.contact}</p>
          <p className="text-gray-600">{invoice.email}</p>
          <p className="text-gray-600">Model: {invoice.model}</p>
          <p className="text-gray-600">Reg No: {invoice.reg_no}</p>
          <p className="text-gray-600">
            Invoice Date: {new Date(invoice.invoice_date).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <h3 className="font-semibold mb-2">Business Address</h3>
          <p className="text-gray-600">KARAIKADU, SIPCOT POST</p>
          <p className="text-gray-600">CUDDALORE TO VIRUDHACHALAM MAIN ROAD,<br/> CUDDALORE-607005</p>
          <p className="text-gray-600">GST No: 33KNYPS2440P1ZW</p>
        </div>
      </div>

      <table className="w-full mb-8 border text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="text-left py-2 px-2 text-xs">SNO</th>
            <th className="text-left py-2 px-2 text-xs">PART NO</th>
            <th className="text-left py-2 px-2 text-xs">PART NAME</th>
            <th className="text-left py-2 px-2 text-xs">QTY</th>
            <th className="text-right py-2 px-2 text-xs">RATE</th>
            <th className="text-right py-2 px-2 text-xs">COST</th>
            <th className="text-right py-2 px-2 text-xs">CGST</th>
            <th className="text-right py-2 px-2 text-xs">SGST</th>
            <th className="text-right py-2 px-2 text-xs">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {invoice.parts?.map((part, index) => {
            const quantity = Number(part.quantity) || 1;
            const rate = Number(part.rate) || 0;
            const value = rate * quantity;
            const cgstRate = Number(part.cgst) || 0;
            const sgstRate = Number(part.sgst) || 0;
            const cgstAmount = (value * cgstRate) / 100;
            const sgstAmount = (value * sgstRate) / 100;
            
            return (
              <tr key={index} className="border-b">
                <td className="py-2 px-2 text-xs">{index + 1}</td>
                <td className="px-2 text-xs">{part.part_no}</td>
                <td className="px-2 text-xs">{part.part_description}</td>
                <td className="px-2 text-xs">{quantity}</td>
                <td className="text-right px-2 text-xs">{rate.toFixed(2)}</td>
                <td className="text-right px-2 text-xs">{value.toFixed(2)}</td>
                <td className="text-right px-2 text-xs">
                  (%{cgstRate}) {cgstAmount.toFixed(2)}
                </td>
                <td className="text-right px-2 text-xs">
                  (%{sgstRate}) {sgstAmount.toFixed(2)}
                </td>
                <td className="text-right px-2 text-xs">{value.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold mb-2 text-sm">Note</h3>
          {(() => {
            const cgstGroups = {};
            const sgstGroups = {};
            
            invoice.parts?.forEach(part => {
              const quantity = Number(part.quantity) || 1;
              const value = Number(part.rate) * quantity;
              const cgstRate = Number(part.cgst) || 0;
              const sgstRate = Number(part.sgst) || 0;
              
              if (cgstRate > 0) {
                if (!cgstGroups[cgstRate]) {
                  cgstGroups[cgstRate] = {
                    amount: 0,
                    quantity: 0,
                    rate: cgstRate
                  };
                }
                cgstGroups[cgstRate].amount += value;
                cgstGroups[cgstRate].quantity += quantity;
              }
              
              if (sgstRate > 0) {
                if (!sgstGroups[sgstRate]) {
                  sgstGroups[sgstRate] = {
                    amount: 0,
                    quantity: 0,
                    rate: sgstRate
                  };
                }
                sgstGroups[sgstRate].amount += value;
                sgstGroups[sgstRate].quantity += quantity;
              }
            });
            
            return (
              <>
                {Object.values(cgstGroups).map((group, index) => (
                  <p key={`cgst-${index}`} className="text-gray-600 text-xs">
                    CGST @{group.rate}% On {group.amount.toFixed(2)} (Qty: {group.quantity}) = {(group.amount * group.rate / 100).toFixed(2)}
                  </p>
                ))}
                
                {Object.values(sgstGroups).map((group, index) => (
                  <p key={`sgst-${index}`} className="text-gray-600 text-xs">
                    SGST @{group.rate}% On {group.amount.toFixed(2)} (Qty: {group.quantity}) = {(group.amount * group.rate / 100).toFixed(2)}
                  </p>
                ))}
              </>
            );
          })()}
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="font-semibold text-sm">Sub Total</span>
            <span className="text-sm">{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-semibold text-sm">CGST Total</span>
            <span className="text-sm">{totalCGST.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-semibold text-sm">SGST Total</span>
            <span className="text-sm">{totalSGST.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold bg-orange-500 text-white p-2">
            <span className="text-sm">Grand Total</span>
            <span className="text-sm">{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mt-8 pt-8 border-t">
        <div>
          <p className="font-semibold mb-2 text-sm">REMARK:</p>
          <div className="border-b border-gray-400 mt-16"></div>
          <p className="mt-2 text-sm">Signature of Customer</p>
        </div>
        <div>
          <p className="font-semibold mb-2 text-sm">For SDS MOTORS</p>
          <p className="mt-16 text-sm">(Authorised signatory)</p>
        </div>
      </div>
    </div>
  );
}

export default InvoiceSearch;