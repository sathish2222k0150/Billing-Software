import React from "react";
import Sidebar from "../Sidebar";
import { useState } from "react";
import logoImage from "../../assets/Images/sds logo.png";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useNavigate } from "react-router-dom";

function LabourInvoiceSearch() {
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
        `http://localhost:5000/search-labour-invoices?name=${searchTerm}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const formattedData = data.map(invoice => ({
        ...invoice,
        total_due: Number(invoice.total_due) || 0,
        subtotal: Number(invoice.subtotal) || 0,
        cgst: Number(invoice.cgst) || 0,
        sgst: Number(invoice.sgst) || 0,
        items: invoice.items?.map(item => ({
          ...item,
          tinkering: Number(item.tinkering) || 0,
          painting: Number(item.painting) || 0,
          electrician: Number(item.electrician) || 0,
          mechanical: Number(item.mechanical) || 0,
          cgst: Number(item.cgst) || 0,
          sgst: Number(item.sgst) || 0
        })) || []
      }));
      setSearchResults(formattedData);
    } catch (error) {
      console.error("Error searching labour invoices:", error);
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
    const input = document.getElementById("labour-invoice-preview"); // Changed from "invoice-preview" to "labour-invoice-preview"

    if (!input) {
      console.error("Could not find element with ID 'labour-invoice-preview'");
      return;
    }

    html2canvas(input, { 
      scale: 2,
      logging: true,
      useCORS: true,
      allowTaint: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: input.scrollWidth,
      windowHeight: input.scrollHeight
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

      pdf.save(`Labour_Invoice_${selectedInvoice.invoice_number}.pdf`);

      setTimeout(() => {
        navigate("/LabourDetails");
      }, 1500);
    }).catch(error => {
      console.error("Error generating PDF:", error);
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
          <LabourInvoiceDetails invoice={selectedInvoice} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage="Labour Invoice Search" />
      <div className="flex-1 flex flex-col p-6 overflow-auto">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">Search Labour Invoices</h2>
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
                    <th className="py-2 px-4 border text-left">Invoice No</th>
                    <th className="py-2 px-4 border text-left">Customer Name</th>
                    <th className="py-2 px-4 border text-left">Date</th>
                    <th className="py-2 px-4 border text-left">Total Amount</th>
                    <th className="py-2 px-4 border text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((invoice) => (
                    <tr key={invoice.id} className="border-b">
                      <td className="py-2 px-4 border">{invoice.invoice_number}</td>
                      <td className="py-2 px-4 border">{invoice.customer_name}</td>
                      <td className="py-2 px-4 border">
                        {new Date(invoice.invoice_date).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4 border">
                        ₹{(Number(invoice.total_due) || 0).toFixed(2)}
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
              No labour invoices found for "{searchTerm}"
            </div>
          )
        )}
      </div>
    </div>
  );
}

function LabourInvoiceDetails({ invoice }) {
  // Calculate totals from items if not available in invoice object
  const calculateTotals = () => {
    if (invoice.subtotal && invoice.cgst && invoice.sgst && invoice.total_due) {
      return {
        subtotal: Number(invoice.subtotal) || 0,
        totalCGST: Number(invoice.cgst) || 0,
        totalSGST: Number(invoice.sgst) || 0,
        grandTotal: Number(invoice.total_due) || 0
      };
    }

    let subtotal = 0;
    let totalCGST = 0;
    let totalSGST = 0;

    invoice.items?.forEach((item) => {
      const tinkering = Number(item.tinkering) || 0;
      const painting = Number(item.painting) || 0;
      const electrician = Number(item.electrician) || 0;
      const mechanical = Number(item.mechanical) || 0;
      
      const value = tinkering + painting + electrician + mechanical;
      const cgstAmount = (value * Number(item.cgst || 0)) / 100;
      const sgstAmount = (value * Number(item.sgst || 0)) / 100;
      
      subtotal += value;
      totalCGST += cgstAmount;
      totalSGST += sgstAmount;
    });

    const grandTotal = subtotal + totalCGST + totalSGST;
    return { subtotal, totalCGST, totalSGST, grandTotal };
  };

  const { subtotal, totalCGST, totalSGST, grandTotal } = calculateTotals();

  return (
    <div id="labour-invoice-preview" className="bg-white p-6 rounded-lg shadow-md">
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
          <h2 className="text-2xl font-bold text-gray-700">LABOUR INVOICE</h2>
          <p className="text-gray-600">#{invoice.invoice_number}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-semibold mb-2">Billed To</h3>
          <p className="font-semibold">{invoice.customer_name}</p>
          <p className="text-gray-600">{invoice.customer_address}</p>
          <p className="text-gray-600">{invoice.customer_contact}</p>
          <p className="text-gray-600">{invoice.customer_email}</p>
          <p className="text-gray-600">Model: {invoice.vehicle_model}</p>
          <p className="text-gray-600">Reg No: {invoice.vehicle_reg_no}</p>
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
            <th className="text-left py-2 px-2 text-xs">S.No</th>
            <th className="text-left py-2 px-2 text-xs">Description</th>
            <th className="text-right py-2 px-2 text-xs">Tinkering (₹)</th>
            <th className="text-right py-2 px-2 text-xs">Painting (₹)</th>
            <th className="text-right py-2 px-2 text-xs">Electrician (₹)</th>
            <th className="text-right py-2 px-2 text-xs">Mechanical (₹)</th>
            <th className="text-right py-2 px-2 text-xs">CGST (%)</th>
            <th className="text-right py-2 px-2 text-xs">SGST (%)</th>
            <th className="text-right py-2 px-2 text-xs">Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items?.map((item, index) => {
            const tinkering = Number(item.tinkering) || 0;
            const painting = Number(item.painting) || 0;
            const electrician = Number(item.electrician) || 0;
            const mechanical = Number(item.mechanical) || 0;
            
            const subtotal = tinkering + painting + electrician + mechanical;
            const cgstAmount = (subtotal * Number(item.cgst || 0)) / 100;
            const sgstAmount = (subtotal * Number(item.sgst || 0)) / 100;
            const total = subtotal + cgstAmount + sgstAmount;
            
            return (
              <tr key={index} className="border-b">
                <td className="py-2 px-2 text-xs">{index + 1}</td>
                <td className="px-2 text-xs">{item.description}</td>
                <td className="text-right px-2 text-xs">{tinkering.toFixed(2)}</td>
                <td className="text-right px-2 text-xs">{painting.toFixed(2)}</td>
                <td className="text-right px-2 text-xs">{electrician.toFixed(2)}</td>
                <td className="text-right px-2 text-xs">{mechanical.toFixed(2)}</td>
                <td className="text-right px-2 text-xs">
                  {item.cgst ? `${item.cgst}%` : "0%"} {cgstAmount.toFixed(2)}
                </td>
                <td className="text-right px-2 text-xs">
                  {item.sgst ? `${item.sgst}%` : "0%"} {sgstAmount.toFixed(2)}
                </td>
                <td className="text-right px-2 text-xs font-medium">{total.toFixed(2)}</td>
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
            
            invoice.items?.forEach(item => {
              const tinkering = Number(item.tinkering) || 0;
              const painting = Number(item.painting) || 0;
              const electrician = Number(item.electrician) || 0;
              const mechanical = Number(item.mechanical) || 0;
              const value = tinkering + painting + electrician + mechanical;
              const cgstRate = item.cgst || 0;
              const sgstRate = item.sgst || 0;
              
              if (cgstRate > 0) {
                if (!cgstGroups[cgstRate]) {
                  cgstGroups[cgstRate] = 0;
                }
                cgstGroups[cgstRate] += value;
              }
              
              if (sgstRate > 0) {
                if (!sgstGroups[sgstRate]) {
                  sgstGroups[sgstRate] = 0;
                }
                sgstGroups[sgstRate] += value;
              }
            });
            
            return (
              <>
                {Object.entries(cgstGroups).map(([rate, amount]) => (
                  <p key={`cgst-${rate}`} className="text-gray-600 text-xs">
                    CGST @{rate}% On {amount.toFixed(2)} = {(amount * rate / 100).toFixed(2)}
                  </p>
                ))}
                
                {Object.entries(sgstGroups).map(([rate, amount]) => (
                  <p key={`sgst-${rate}`} className="text-gray-600 text-xs">
                    SGST @{rate}% On {amount.toFixed(2)} = {(amount * rate / 100).toFixed(2)}
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

export default LabourInvoiceSearch;