import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar";
import logoImage from "../../assets/Images/sds logo.png";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useEffect, useState } from "react";

function EstimatePreview() {
  const { state } = useLocation();
  const selectedParts = state?.selectedParts || [];
  const customerDetails = state?.customerDetails || {};
  const navigate = useNavigate();
  const [estimateId, setEstimateId] = useState(null);
  const documentType = state?.documentType || 'estimate';

  useEffect(() => {
    const fetchEstimateId = async () => {
      try {
        const response = await fetch("http://localhost:5000/latest-estimate-id");
        const data = await response.json();
        setEstimateId(data.estimateId);
      } catch (error) {
        console.error("Error fetching estimate ID:", error);
      }
    };

    fetchEstimateId();
  }, []);

  const calculateTotal = () => {
    return selectedParts.reduce((sum, part) => {
      return sum + (Number(part.rate) * Number(part.quantity || 1));
    }, 0);
  };

  const grandTotal = calculateTotal();

  const handleGeneratePDF = () => {
    const input = document.getElementById("estimate-preview");

    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`${documentType === 'estimate' ? 'Estimate' : 'Invoice'}_${customerDetails.name}.pdf`);

      setTimeout(() => {
        navigate("/EstimateDetails");
      }, 1500);
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage="Estimate Preview" />

      <div className="flex-1 flex flex-col p-6 overflow-auto">
        <div id="estimate-preview" className="bg-white p-6 rounded-lg shadow-md">
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
              <h2 className="text-2xl font-bold text-gray-700">
                {documentType === 'estimate' ? 'Estimate' : 'Invoice'} {estimateId}
              </h2>
              <p className="text-gray-600">#{estimateId || "Loading..."}</p>
              {documentType === 'invoice' && (
                <p className="text-sm text-gray-600">Payment Due: Upon Receipt</p>
              )}
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
              <p className="text-gray-600">
                {documentType === 'estimate' ? 'Estimate' : 'Invoice'} Date: {customerDetails.estimateDate}
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
                <th className="text-right py-2 px-2 text-xs">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {selectedParts.map((part, index) => {
                const quantity = part.quantity || 1;
                const value = Number(part.rate) * quantity;
                
                return (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-2 text-xs">{index + 1}</td>
                    <td className="px-2 text-xs">{part.part_no}</td>
                    <td className="px-2 text-xs">{part.part_description}</td>
                    <td className="px-2 text-xs">{quantity}</td>
                    <td className="text-right px-2 text-xs">{Number(part.rate).toFixed(2)}</td>
                    <td className="text-right px-2 text-xs">{value.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2 text-sm">Note</h3>
              <p className="text-gray-600 text-xs">
                {documentType === 'estimate' 
                  ? "This is an estimate only. Prices may vary." 
                  : "Please make payment within 15 days of invoice date."}
              </p>
            </div>

            <div>
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
            onClick={handleGeneratePDF}
            className="bg-green-500 text-white py-2 px-6 rounded shadow-md hover:bg-green-600 text-sm"
          >
            Download {documentType === 'estimate' ? 'Estimate' : 'Invoice'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EstimatePreview;