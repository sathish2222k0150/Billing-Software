import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar";
import logoImage from "../../assets/Images/sds logo.png";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useEffect, useState } from "react";

function InvoicePreview() {
  const { state } = useLocation();
  const selectedParts = state?.selectedParts || [];
  const customerDetails = state?.customerDetails || {};
  const navigate = useNavigate();
  const [invoiceId, setInvoiceId] = useState(null);

  useEffect(() => {
    const fetchInvoiceId = async () => {
      try {
        const response = await fetch("http://localhost:5000/latest-invoice-id");
        const data = await response.json();
        setInvoiceId(data.invoiceId);
      } catch (error) {
        console.error("Error fetching invoice ID:", error);
      }
    };

    fetchInvoiceId();
  }, []);

  const calculateTotals = () => {
    let subtotal = 0;
    let totalCGST = 0;
    let totalSGST = 0;

    selectedParts.forEach((part) => {
      const value = Number(part.rate) * Number(part.quantity || 1);
      const cgstAmount = (value * Number(part.cgst || 0)) / 100;
      const sgstAmount = (value * Number(part.sgst || 0)) / 100;
      
      subtotal += value;  // Only the product value (rate × quantity)
      totalCGST += cgstAmount;
      totalSGST += sgstAmount;
    });

    const grandTotal = subtotal + totalCGST + totalSGST;
    return { subtotal, totalCGST, totalSGST, grandTotal };
  };

  const { subtotal, totalCGST, totalSGST, grandTotal } = calculateTotals();

  const handleSaveInvoice = async () => {
    const invoiceData = {
      customerDetails,
      selectedParts: Array.isArray(selectedParts) ? selectedParts : [],
      subtotal,
      cgst: totalCGST,
      sgst: totalSGST,
      totalDue: grandTotal,
    };

    console.log("Sending Invoice Data:", invoiceData);

    try {
      const response = await fetch("http://localhost:5000/service-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      });

      if (response.ok) {
        console.log("Invoice saved successfully!");
        await saveInvoiceSummary(invoiceData);
        setTimeout(() => {
          handleGeneratePDF();
        }, 1000);
      } else {
        alert("Failed to save invoice!");
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert("Error saving invoice!");
    }
  };

  const saveInvoiceSummary = async (invoiceData) => {
    try {
      const response = await fetch("http://localhost:5000/invoice-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: invoiceData.customerDetails.name,
          invoiceDate: invoiceData.customerDetails.invoiceDate,
          subtotal: invoiceData.subtotal,
          cgst: invoiceData.cgst,
          sgst: invoiceData.sgst,
          totalDue: invoiceData.totalDue,
        }),
      });

      if (!response.ok) {
        console.error("Failed to save invoice summary!");
      }
    } catch (error) {
      console.error("Error saving invoice summary:", error);
    }
  };

  const handleGeneratePDF = () => {
    const input = document.getElementById("invoice-preview");

    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Invoice_${customerDetails.name}.pdf`);

      setTimeout(() => {
        navigate("/Dashboard");
      }, 1500);
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage="Invoice Preview" />
  
      <div className="flex-1 flex flex-col p-6 overflow-auto">
        <div id="invoice-preview" className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <img src={logoImage} alt="SDS Motors" className="w-16 h-16" />
              <div>
                <h1 className="text-red-600 font-bold text-xl">SDS MOTORS</h1>
                <p className="text-sm text-gray-600">www.jsdmotors.com</p>
                <p className="text-sm text-gray-600">hello@sdmotors.com</p>
                <p className="text-sm text-gray-600">+1 (912) 123-4567</p>
              </div>
            </div>
  
            <div>
              <h2 className="text-2xl font-bold text-gray-700">INVOICE</h2>
              <p className="text-gray-600">#{invoiceId || "Loading..."}</p>
            </div>
          </div>
  
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-2">Billed To</h3>
              <p className="font-semibold">{customerDetails.name}</p>
              <p className="text-gray-600">{customerDetails.address}</p>
              <p className="text-gray-600">{customerDetails.contact}</p>
              <p className="text-gray-600">{customerDetails.email}</p>
              <p className="text-gray-600">Model: {customerDetails.model}</p>
              <p className="text-gray-600">Reg No: {customerDetails.regNo}</p>
              <p className="text-gray-600">Invoice Date: {customerDetails.invoiceDate}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Business Address</h3>
              <p className="text-gray-600">Karpagam COLLEGE RD, Othakalmandapam</p>
              <p className="text-gray-600">Main Road, COIMBATORE, PIN 605</p>
              <p className="text-gray-600">GST No: 00XXXXX123AXXX</p>
            </div>
          </div>
  
          <table className="w-full mb-8 border">
            <thead>
              <tr className="bg-gray-200">
                <th className="text-left py-2 px-2">SNO</th>
                <th className="text-left py-2 px-2">PART NO</th>
                <th className="text-left py-2 px-2">PART NAME</th>
                <th className="text-left py-2 px-2">QTY</th>
                <th className="text-right py-2 px-2">RATE</th>
                <th className="text-right py-2 px-2">COST</th>
                <th className="text-right py-2 px-2">SGST</th>
                <th className="text-right py-2 px-2">CGST</th>
                <th className="text-right py-2 px-2">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
          {selectedParts.map((part, index) => {
            const quantity = part.quantity || 1;
            const value = Number(part.rate) * quantity;
            const cgstAmount = (value * Number(part.cgst || 0)) / 100;
            const sgstAmount = (value * Number(part.sgst || 0)) / 100;
            
            return (
              <tr key={index} className="border-b">
                <td className="py-2 px-2">{index + 1}</td>
                <td className="px-2">{part.part_no}</td>
                <td className="px-2">{part.part_description}</td>
                <td className="px-2">{quantity}</td>
                <td className="text-right px-2">{Number(part.rate).toFixed(2)}</td>
                <td className="text-right px-2">{value.toFixed(2)}</td>
                <td className="text-right px-2">
                  {sgstAmount.toFixed(2)} ({part.sgst || 0}%)
                </td>
                <td className="text-right px-2">
                  {cgstAmount.toFixed(2)} ({part.cgst || 0}%)
                </td>
                <td className="text-right px-2">{value.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
          </table>
          
          <div className="grid grid-cols-2 gap-8">
            <div>
            <h3 className="font-semibold mb-2">Note</h3>
          {selectedParts.map((part, index) => {
            const quantity = part.quantity || 1;
            const value = Number(part.rate) * quantity;
            const cgstAmount = (value * Number(part.cgst || 0)) / 100;
            const sgstAmount = (value * Number(part.sgst || 0)) / 100;
            return (
              <React.Fragment key={index}>
                <p className="text-gray-600">
                  CGST @{part.cgst || 0}% On {value.toFixed(2)} = {cgstAmount.toFixed(2)}
                </p>
                <p className="text-gray-600">
                  SGST @{part.sgst || 0}% On {value.toFixed(2)} = {sgstAmount.toFixed(2)}
                </p>
              </React.Fragment>
            );
          })}
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Sub Total</span>
            <span>{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-semibold">CGST Total</span>
            <span>{totalCGST.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-semibold">SGST Total</span>
            <span>{totalSGST.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold bg-orange-500 text-white p-2">
            <span>Grand Total</span>
            <span>{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
  
          <div className="grid grid-cols-2 gap-8 mt-8 pt-8 border-t">
            <div>
              <p className="font-semibold mb-2">REMARK:</p>
              <div className="border-b border-gray-400 mt-16"></div>
              <p className="mt-2">Signature of Customer</p>
            </div>
            <div>
              <p className="font-semibold mb-2">For SDS MOTORS</p>
              <p className="mt-16">(Authorised signatory)</p>
            </div>
          </div>
        </div>
  
        <div className="flex justify-between mt-8">
          <button
            onClick={handleSaveInvoice}
            className="bg-green-500 text-white py-2 px-6 rounded shadow-md hover:bg-green-600"
          >
            Save Invoice
          </button>
        </div>
      </div>
    </div>
  );
}  

export default InvoicePreview;