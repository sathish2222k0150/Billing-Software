import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar";
import logoImage from "../../assets/Images/sds logo.png";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useState } from "react";

const formatDisplayDate = (dateString) => {
  if (!dateString) return '';
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) return dateString;
  if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatBackendDate = (dateString) => {
  if (!dateString) return new Date().toISOString().split('T')[0];
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split('-');
    return `${year}-${month}-${day}`;
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return new Date().toISOString().split('T')[0];
  return date.toISOString().split('T')[0];
};

function LabourPreview() {
  const { state } = useLocation();
  const labourItems = state?.labourItems || [];
  const customerDetails = state?.customerDetails || {};
  const invoiceId = state?.invoiceId || null; // Keep the invoiceId from state
  const navigate = useNavigate();
  const [referenceNumber, setReferenceNumber] = useState(null); // For the new summary reference

  const calculateTotals = () => {
    let subtotal = 0;
    let totalCGST = 0;
    let totalSGST = 0;

    labourItems.forEach((item) => {
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

  const handleSaveInvoice = async () => {
    try {
      const response = await fetch("http://localhost:5000/labour-invoice-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: customerDetails.name,
          invoiceDate: formatBackendDate(customerDetails.invoiceDate),
          subtotal,
          cgst: totalCGST,
          sgst: totalSGST,
          totalDue: grandTotal,
          labourItems,
          invoiceId: invoiceId // Include the invoiceId from state
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        setReferenceNumber(data.referenceNumber);
        // invoiceId is already available from state
        setTimeout(() => {
          handleGeneratePDF();
        }, 1000);
      } else {
        alert("Failed to save labour invoice summary!");
      }
    } catch (error) {
      console.error("Error saving labour invoice summary:", error);
      alert("Error saving labour invoice summary!");
    }
  };
  const handleGeneratePDF = () => {
    const input = document.getElementById("labour-invoice-preview");
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Labour_Summary_${customerDetails.name}.pdf`);
      setTimeout(() => {
        navigate("/Labour");
      }, 1500);
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage="Labour Invoice Preview" />
      <div className="flex-1 flex flex-col p-6 overflow-auto">
        <div id="labour-invoice-preview" className="bg-white p-6 rounded-lg shadow-md">
          {/* Header Section */}
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
            {invoiceId && <p className="text-gray-600">Invoice: #{invoiceId}</p>}
            {referenceNumber && <p className="text-gray-600">Ref: #{referenceNumber}</p>}
            {!invoiceId && !referenceNumber && <p className="text-gray-600">Loading reference...</p>}
          </div>
          </div>

          {/* Customer and Business Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-2">Billed To</h3>
              <p className="font-semibold">{customerDetails.name}</p>
              <p className="text-gray-600">{customerDetails.address}</p>
              <p className="text-gray-600">{customerDetails.contact}</p>
              <p className="text-gray-600">{customerDetails.email}</p>
              <p className="text-gray-600">Model: {customerDetails.model}</p>
              <p className="text-gray-600">Reg No: {customerDetails.regNo}</p>
              <p className="text-gray-600">Date: {formatDisplayDate(customerDetails.invoiceDate)}</p>
            </div>
            <div className="text-right">
              <h3 className="font-semibold mb-2">Business Address</h3>
              <p className="text-gray-600">KARAIKADU, SIPCOT POST</p>
              <p className="text-gray-600">CUDDALORE TO VIRUDHACHALAM MAIN ROAD,<br/> CUDDALORE-607005</p>
              <p className="text-gray-600">GST No: 33KNYPS2440P1ZW</p>
            </div>
          </div>

          {/* Labour Items Table */}
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
              {labourItems.map((item, index) => {
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
          
          {/* Totals Section */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2 text-sm">Note</h3>
              {(() => {
                const cgstGroups = {};
                const sgstGroups = {};
                
                labourItems.forEach(item => {
                  const value = (Number(item.tinkering) || 0) + (Number(item.painting) || 0) + 
                               (Number(item.electrician) || 0) + (Number(item.mechanical) || 0);
                  const cgstRate = item.cgst || 0;
                  const sgstRate = item.sgst || 0;
                  
                  if (cgstRate > 0) cgstGroups[cgstRate] = (cgstGroups[cgstRate] || 0) + value;
                  if (sgstRate > 0) sgstGroups[sgstRate] = (sgstGroups[sgstRate] || 0) + value;
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

          {/* Footer Section */}
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

        <div className="flex justify-between mt-8">
          <button
            onClick={handleSaveInvoice}
            className="bg-green-500 text-white py-2 px-6 rounded shadow-md hover:bg-green-600 text-sm"
          >
            Save Labour Summary
          </button>
        </div>
      </div>
    </div>
  );
}

export default LabourPreview;