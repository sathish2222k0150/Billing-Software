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

  const handleSaveEstimate = async () => {
    const estimateData = {
      customerDetails,
      selectedParts: Array.isArray(selectedParts) ? selectedParts : [],
      totalDue: grandTotal,
    };

    console.log("Sending Estimate Data:", estimateData);

    try {
      const response = await fetch("http://localhost:5000/service-estimate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(estimateData),
      });

      if (response.ok) {
        console.log("Estimate saved successfully!");
        await saveEstimateSummary(estimateData);
        setTimeout(() => {
          handleGeneratePDF();
        }, 1000);
      } else {
        alert("Failed to save estimate!");
      }
    } catch (error) {
      console.error("Error saving estimate:", error);
      alert("Error saving estimate!");
    }
  };

  const saveEstimateSummary = async (estimateData) => {
    try {
      const response = await fetch("http://localhost:5000/estimate-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: estimateData.customerDetails.name,
          estimateDate: estimateData.customerDetails.estimateDate,
          totalDue: estimateData.totalDue,
        }),
      });

      if (!response.ok) {
        console.error("Failed to save estimate summary!");
      }
    } catch (error) {
      console.error("Error saving estimate summary:", error);
    }
  };

  const handleGeneratePDF = () => {
    const input = document.getElementById("estimate-preview");

    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Estimate_${customerDetails.name}.pdf`);

      setTimeout(() => {
        navigate("/Dashboard");
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
                <p className="text-sm text-gray-600">www.jsdmotors.com</p>
                <p className="text-sm text-gray-600">hello@sdmotors.com</p>
                <p className="text-sm text-gray-600">+1 (912) 123-4567</p>
              </div>
            </div>

            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-700">ESTIMATE</h2>
              <p className="text-gray-600">#{estimateId || "Loading..."}</p>
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
              <p className="text-gray-600">Estimate Date: {customerDetails.estimateDate}</p>
            </div>
            <div className="text-right">
              <h3 className="font-semibold mb-2">Business Address</h3>
              <p className="text-gray-600">Karpagam COLLEGE RD, Othakalmandapam</p>
              <p className="text-gray-600">Main Road, COIMBATORE, PIN 605</p>
              <p className="text-gray-600">GST No: 00XXXXX123AXXX</p>
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
              <p className="text-gray-600 text-xs">This is an estimate only. Prices may vary.</p>
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
            onClick={handleSaveEstimate}
            className="bg-green-500 text-white py-2 px-6 rounded shadow-md hover:bg-green-600 text-sm"
          >
            Save Estimate
          </button>
        </div>
      </div>
    </div>
  );
}

export default EstimatePreview;