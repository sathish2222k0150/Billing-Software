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
        navigate("/InvoiceDetails");
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
          <p className="text-sm text-gray-600">9842365406</p>
          <p className="text-sm text-gray-600">9952513032</p>
          <p className="text-sm text-gray-600">sdsmotors2019@gmail.com</p>
          </div>
        </div>

        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-700">TaxInvoice</h2>
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
            <th className="text-right py-2 px-2 text-xs">SGST</th>
            <th className="text-right py-2 px-2 text-xs">CGST</th>
            <th className="text-right py-2 px-2 text-xs">AMOUNT</th>
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
                <td className="py-2 px-2 text-xs">{index + 1}</td>
                <td className="px-2 text-xs">{part.part_no}</td>
                <td className="px-2 text-xs">{part.part_description}</td>
                <td className="px-2 text-xs">{quantity}</td>
                <td className="text-right px-2 text-xs">{Number(part.rate).toFixed(2)}</td>
                <td className="text-right px-2 text-xs">{value.toFixed(2)}</td>
                <td className="text-right px-2 text-xs">
                  (%{part.sgst || 0}) {sgstAmount.toFixed(2)}
                </td>
                <td className="text-right px-2 text-xs">
                  (%{part.cgst || 0}) {cgstAmount.toFixed(2)} 
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
            // Group tax rates with their base amounts and quantities
            const cgstGroups = {};
            const sgstGroups = {};
            
            selectedParts.forEach(part => {
              const quantity = part.quantity || 1;
              const value = Number(part.rate) * quantity;
              const cgstRate = part.cgst || 0;
              const sgstRate = part.sgst || 0;
              
              // Group CGST
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
              
              // Group SGST
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
                {/* Display CGST notes */}
                {Object.values(cgstGroups).map((group, index) => (
                  <p key={`cgst-${index}`} className="text-gray-600 text-xs">
                    CGST @{group.rate}% On {group.amount.toFixed(2)} (Qty: {group.quantity}) = {(group.amount * group.rate / 100).toFixed(2)}
                  </p>
                ))}
                
                {/* Display SGST notes */}
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

    <div className="flex justify-between mt-8">
      <button
        onClick={handleSaveInvoice}
        className="bg-green-500 text-white py-2 px-6 rounded shadow-md hover:bg-green-600 text-sm"
      >
        Save Invoice
      </button>
    </div>
  </div>
</div>
 );
}  

export default InvoicePreview;