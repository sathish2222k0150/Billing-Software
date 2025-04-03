import React from "react";
import Sidebar from "../Sidebar";
import { useState } from "react";
import logoImage from "../../assets/Images/sds logo.png";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useNavigate } from "react-router-dom";


function EstimateSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedEstimate, setSelectedEstimate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:5000/search-estimates?name=${searchTerm}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const formattedData = data.map(estimate => ({
        ...estimate,
        total_amount: Number(estimate.total_amount) || 0,
        parts: estimate.parts?.map(part => ({
          ...part,
          rate: Number(part.rate) || 0,
          quantity: Number(part.quantity) || 1
        })) || []
      }));
      setSearchResults(formattedData);
    } catch (error) {
      console.error("Error searching estimates:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewEstimate = (estimate) => {
    setSelectedEstimate(estimate);
  };

  const handleBackToSearch = () => {
    setSelectedEstimate(null);
  };

  const handleGeneratePDF = () => {
    const input = document.getElementById("estimate-preview");

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

      pdf.save(`Estimate_${selectedEstimate.estimate_id}.pdf`);

      setTimeout(() => {
        navigate("/EstimateDetails");
      }, 1500);
    });
  };

  if (selectedEstimate) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar currentPage="Estimate Search" />
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
          <EstimateDetails estimate={selectedEstimate} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage="Estimate Search" />
      <div className="flex-1 flex flex-col p-6 overflow-auto">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">Search Estimates</h2>
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
                    <th className="py-2 px-4 border text-left">Estimate ID</th>
                    <th className="py-2 px-4 border text-left">Customer Name</th>
                    <th className="py-2 px-4 border text-left">Date</th>
                    <th className="py-2 px-4 border text-left">Total Amount</th>
                    <th className="py-2 px-4 border text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((estimate) => (
                    <tr key={estimate.estimate_id} className="border-b">
                      <td className="py-2 px-4 border">{estimate.estimate_id}</td>
                      <td className="py-2 px-4 border">{estimate.name}</td>
                      <td className="py-2 px-4 border">
                        {new Date(estimate.estimate_date).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4 border">
                        ₹{(Number(estimate.total_amount) || 0).toFixed(2)}
                      </td>
                      <td className="py-2 px-4 border">
                        <button
                          onClick={() => handleViewEstimate(estimate)}
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
              No estimates found for "{searchTerm}"
            </div>
          )
        )}
      </div>
    </div>
  );
}

function EstimateDetails({ estimate }) {
    // Calculate total from parts if not available in estimate object
    const documentType = estimate.document_type || 'estimate';
    const grandTotal = estimate.parts && estimate.parts.length > 0 
    ? estimate.parts.reduce((sum, part) => sum + (Number(part.rate || 0) * (Number(part.quantity) || 1)), 0)
    : Number(estimate.total_amount) || 0;
  

  return (
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
            {documentType === 'estimate' ? 'Estimate' : 'Invoice'} {estimate.estimate_id}
          </h2>
          <p className="text-gray-600">#{estimate.estimate_id}</p>
          {documentType === 'invoice' && (
            <p className="text-sm text-gray-600">Payment Due: Upon Receipt</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-semibold mb-2">Billed To</h3>
          <p className="font-semibold">{estimate.name}</p>
          <p className="text-gray-600">{estimate.address}</p>
          <p className="text-gray-600">{estimate.contact}</p>
          <p className="text-gray-600">{estimate.email}</p>
          <p className="text-gray-600">Model: {estimate.model}</p> {/* Changed from vehicle_model */}
          <p className="text-gray-600">Reg No: {estimate.reg_no}</p> {/* Changed from vehicle_reg_no */}
          <p className="text-gray-600">
            {documentType === 'estimate' ? 'Estimate' : 'Invoice'} Date: {new Date(estimate.estimate_date).toLocaleDateString()}
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
          {estimate.parts && estimate.parts.length > 0 ? (
            estimate.parts.map((part, index) => {
              const quantity = Number(part.quantity) || 1;
              const rate = Number(part.rate) || 0;
              const value = rate * quantity;
              
              return (
                <tr key={index} className="border-b">
                  <td className="py-2 px-2 text-xs">{index + 1}</td>
                  <td className="px-2 text-xs">{part.part_no || 'N/A'}</td>
                  <td className="px-2 text-xs">{part.part_description || 'N/A'}</td>
                  <td className="px-2 text-xs">{quantity}</td>
                  <td className="text-right px-2 text-xs">{rate.toFixed(2)}</td>
                  <td className="text-right px-2 text-xs">{value.toFixed(2)}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" className="py-4 text-center text-gray-500">
                {estimate.total_amount ? (
                  <>No parts details available. Total amount: ₹{Number(estimate.total_amount).toFixed(2)}</>
                ) : (
                  'No parts information available'
                )}
              </td>
            </tr>
          )}
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
  );
}

export default EstimateSearch;