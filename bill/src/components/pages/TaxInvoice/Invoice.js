import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";

function Invoice() {
  const [partNo, setPartNo] = useState("");
  const [parts, setParts] = useState([]);
  const [selectedParts, setSelectedParts] = useState([]);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [manualPart, setManualPart] = useState({
    part_no: "",
    part_description: "",
    mrp: "",
    rate: "",
    cgst: "",
    sgst: "",
    hsn_sac: "",
    vehicle: "",
    qty: 1
  });

  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    address: "",
    contact: "",
    email: "",
    model: "",
    regNo: "",
    invoiceDate: new Date().toISOString().split("T")[0],
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (partNo) {
      axios.get(`http://localhost:5000/parts?part_no=${partNo}`)
        .then((res) => {
          setParts(res.data);
          setErrorMessage(""); // Clear error when new results load
        })
        .catch(error => {
          console.error("Error fetching parts:", error);
          setErrorMessage("Error loading parts. Please try again.");
        });
    } else {
      setParts([]);
    }
  }, [partNo]);

  const handleSelect = (part) => {
    // Check if part is already in stock
    if (part.qty <= 0) {
      setErrorMessage(`Part ${part.part_no} is out of stock!`);
      return;
    }
    
    // Check if part is already selected
    if (selectedParts.some(p => p.part_no === part.part_no)) {
      setSelectedParts(prev => prev.filter(p => p.part_no !== part.part_no));
    } else {
      setSelectedParts(prev => [
        ...prev, 
        { 
          ...part, 
          quantity: 1, 
          amount: part.rate,
          availableStock: part.qty // Track available stock
        }
      ]);
    }
    setErrorMessage(""); // Clear any previous error
  };

  const handleQuantityChange = (partNo, quantity) => {
    const part = selectedParts.find(p => p.part_no === partNo);
    const availableStock = part?.availableStock || 0;
    
    if (quantity > availableStock) {
      setErrorMessage(`Only ${availableStock} available in stock for part ${partNo}`);
      return;
    }

    setSelectedParts((prev) =>
      prev.map((part) =>
        part.part_no === partNo
          ? {
              ...part,
              quantity: Math.max(1, quantity),
              amount: part.rate * Math.max(1, quantity),
            }
          : part
      )
    );
    setErrorMessage(""); // Clear error if quantity is valid
  };

  const handleManualPartChange = (e) => {
    setManualPart({ ...manualPart, [e.target.name]: e.target.value });
  };

  const handleAddManualPart = async () => {
    try {
      setErrorMessage("");
      const response = await axios.post("http://localhost:5000/parts", manualPart);
      
      if (response.status === 200) {
        const newPart = {
          ...manualPart,
          quantity: 1,
          amount: manualPart.rate,
          part_id: response.data._id,
          availableStock: manualPart.qty
        };
        
        setSelectedParts([...selectedParts, newPart]);
        setShowManualEntry(false);
        setManualPart({
          part_no: "",
          part_description: "",
          mrp: "",
          rate: "",
          cgst: "",
          sgst: "",
          hsn_sac: "",
          vehicle: "",
          qty: 1
        });
      }
    } catch (error) {
      console.error("Error adding manual part:", error);
      setErrorMessage("Failed to add part. Please try again.");
    }
  };

  const handleChange = (e) => {
    setCustomerDetails({ ...customerDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setErrorMessage("");

      const partsWithDefaults = selectedParts.map(part => ({
        ...part,
        part_id: part.part_id || part._id,
        rate: Number(part.rate) || 0,
        quantity: Number(part.quantity) || 1,
        cgst: Number(part.cgst) || 0,
        sgst: Number(part.sgst) || 0,
        amount: (Number(part.rate) || 0) * (Number(part.quantity) || 1)
      }));
  
      const response = await axios.post("http://localhost:5000/save-invoice", {
        customerDetails,
        selectedParts: partsWithDefaults,
      });
  
      if (response.status === 200) {
        alert("Invoice saved successfully!");
        navigate("/InvoicePreview", {
          state: {
            selectedParts: partsWithDefaults,
            customerDetails,
            invoiceId: response.data.invoiceId
          },
        });
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      
      if (error.response?.data?.message?.includes("Insufficient stock")) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage(error.response?.data?.message || "Failed to save invoice. Try again!");
      }
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Dashboard
        </button>
        <h1 className="text-2xl font-bold">Invoice Generation</h1>
        <div></div>
      </div>

      {/* Error Message Display */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errorMessage}
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4">Customer Details</h2>

      {/* Customer Form */}
      <div className="grid grid-cols-2 gap-4 bg-white p-6 rounded shadow-md mb-6">
        <input
          type="text"
          name="name"
          placeholder="Customer Name"
          value={customerDetails.name}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={customerDetails.address}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
        <input
          type="text"
          name="contact"
          placeholder="Contact Number"
          value={customerDetails.contact}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
        <input
          type="text"
          name="email"
          placeholder="GST"
          value={customerDetails.email}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        <input
          type="text"
          name="model"
          placeholder="Car Model"
          value={customerDetails.model}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        <input
          type="text"
          name="regNo"
          placeholder="Registration Number"
          value={customerDetails.regNo}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        <input
          type="date"
          name="invoiceDate"
          value={customerDetails.invoiceDate}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
      </div>

      {/* Part Selection */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Select Parts</h2>
        <button
          onClick={() => setShowManualEntry(!showManualEntry)}
          className="flex items-center bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
        >
          <FaPlus className="mr-2" /> Add Part Manually
        </button>
      </div>

      {showManualEntry && (
        <div className="bg-white p-4 rounded shadow-md mb-6">
          <h3 className="font-bold mb-3">Add New Part</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="part_no"
              placeholder="Part Number"
              value={manualPart.part_no}
              onChange={handleManualPartChange}
              className="border p-2 w-full"
              required
            />
            <input
              type="text"
              name="part_description"
              placeholder="Description"
              value={manualPart.part_description}
              onChange={handleManualPartChange}
              className="border p-2 w-full"
              required
            />
            <input
              type="text"
              name="hsn_sac"
              placeholder="HSN/SAC Code"
              value={manualPart.hsn_sac}
              onChange={handleManualPartChange}
              className="border p-2 w-full"
            />
            <input
              type="text"
              name="vehicle"
              placeholder="Vehicle Model"
              value={manualPart.vehicle}
              onChange={handleManualPartChange}
              className="border p-2 w-full"
            />
            <input
              type="number"
              name="mrp"
              placeholder="MRP"
              value={manualPart.mrp}
              onChange={handleManualPartChange}
              className="border p-2 w-full"
              required
            />
            <input
              type="number"
              name="rate"
              placeholder="Rate"
              value={manualPart.rate}
              onChange={handleManualPartChange}
              className="border p-2 w-full"
              required
            />
            <input
              type="number"
              name="cgst"
              placeholder="CGST %"
              value={manualPart.cgst}
              onChange={handleManualPartChange}
              className="border p-2 w-full"
            />
            <input
              type="number"
              name="sgst"
              placeholder="SGST %"
              value={manualPart.sgst}
              onChange={handleManualPartChange}
              className="border p-2 w-full"
            />
          </div>
          <div className="flex justify-end mt-4 space-x-2">
            <button
              onClick={() => setShowManualEntry(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleAddManualPart}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save Part
            </button>
          </div>
        </div>
      )}

      <input
        type="text"
        placeholder="Search by Part Number"
        value={partNo}
        onChange={(e) => setPartNo(e.target.value)}
        className="border p-2 w-full mb-4"
      />

      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Select</th>
              <th className="p-2">Part No</th>
              <th className="p-2">Description</th>
              <th className="p-2">HSN/SAC</th>
              <th className="p-2">Stock</th>
              <th className="p-2">MRP</th>
              <th className="p-2">Rate</th>
              <th className="p-2">CGST%</th>
              <th className="p-2">SGST%</th>
              <th className="p-2">Quantity</th>
              <th className="p-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {parts.map((part) => (
              <tr 
                key={part.part_no} 
                className={`border hover:bg-gray-50 ${part.qty <= 0 ? 'bg-red-50' : ''}`}
              >
                <td className="p-2 text-center">
                  <input
                    type="checkbox"
                    onChange={() => handleSelect(part)}
                    checked={selectedParts.some((p) => p.part_no === part.part_no)}
                    disabled={part.qty <= 0}
                  />
                </td>
                <td className="p-2">{part.part_no}</td>
                <td className="p-2">{part.part_description}</td>
                <td className="p-2">{part.hsn_sac}</td>
                <td className="p-2">
                  {part.qty <= 0 ? (
                    <span className="text-red-600">Out of stock</span>
                  ) : (
                    part.qty
                  )}
                </td>
                <td className="p-2">{part.mrp}</td>
                <td className="p-2">{part.rate}</td>
                <td className="p-2">{part.cgst}</td>
                <td className="p-2">{part.sgst}</td>
                <td className="p-2">
                  {selectedParts.some((p) => p.part_no === part.part_no) && (
                    <input
                      type="number"
                      min="1"
                      max={part.qty}
                      value={
                        selectedParts.find((p) => p.part_no === part.part_no)
                          ?.quantity || 1
                      }
                      onChange={(e) =>
                        handleQuantityChange(
                          part.part_no,
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="border p-1 w-16"
                    />
                  )}
                </td>
                <td className="p-2">
                  {selectedParts.some((p) => p.part_no === part.part_no)
                    ? selectedParts.find((p) => p.part_no === part.part_no).amount
                    : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedParts.length > 0 && (
        <div className="mt-6 bg-gray-100 p-4 rounded shadow-md">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold">Selected Parts Summary</h3>
            <span className="text-sm text-gray-600">
              {selectedParts.length} item{selectedParts.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 text-left">Part No</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-right">Rate (₹)</th>
                  <th className="p-2 text-center">Qty</th>
                  <th className="p-2 text-right">CGST (%)</th>
                  <th className="p-2 text-right">SGST (%)</th>
                  <th className="p-2 text-right">Amount (₹)</th>
                  <th className="p-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {selectedParts.map((part) => {
                  const rate = Number(part.rate) || 0;
                  const quantity = Number(part.quantity) || 1;
                  const cgst = Number(part.cgst) || 0;
                  const sgst = Number(part.sgst) || 0;
                  const amount = rate * quantity;

                  return (
                    <tr key={`${part.part_no}-${rate}`} className="border hover:bg-gray-50">
                      <td className="p-2">{part.part_no}</td>
                      <td className="p-2">{part.part_description}</td>
                      <td className="p-2 text-right">{rate.toFixed(2)}</td>
                      <td className="p-2 text-center">{quantity}</td>
                      <td className="p-2 text-right">{cgst ? cgst.toFixed(2) : "N/A"}</td>
                      <td className="p-2 text-right">{sgst ? sgst.toFixed(2) : "N/A"}</td>
                      <td className="p-2 text-right font-medium">{amount.toFixed(2)}</td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => {
                            setSelectedParts(selectedParts.filter(p => 
                              p.part_no !== part.part_no
                            ));
                          }}
                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                          title="Remove part"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-5 w-5" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
                <tr className="font-bold bg-gray-50">
                  <td colSpan="6" className="p-2 text-right">
                    Grand Total:
                  </td>
                  <td className="p-2 text-right text-blue-600">
                    ₹{selectedParts
                      .reduce((sum, part) => sum + (Number(part.rate || 0) * (Number(part.quantity) || 1)), 0)
                      .toFixed(2)}
                  </td>
                  <td className="p-2"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-end mt-6 items-center">
        {errorMessage && (
          <div className="mr-4 text-red-600 bg-red-100 px-4 py-2 rounded">
            {errorMessage}
          </div>
        )}
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          onClick={handleSubmit}
          disabled={selectedParts.length === 0}
        >
          Generate Invoice
        </button>
      </div>
    </div>
  );
}

export default Invoice;