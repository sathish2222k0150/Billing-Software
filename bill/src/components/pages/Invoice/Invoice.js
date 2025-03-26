import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Invoice() {
  const [partNo, setPartNo] = useState("");
  const [parts, setParts] = useState([]);
  const [selectedParts, setSelectedParts] = useState([]);
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
      axios.get(`http://localhost:5000/parts?part_no=${partNo}`).then((res) => {
        setParts(res.data);
      });
    } else {
      setParts([]);
    }
  }, [partNo]);

  const handleSelect = (part) => {
    setSelectedParts((prev) =>
      prev.some((p) => p.part_no === part.part_no)
        ? prev.filter((p) => p.part_no !== part.part_no)
        : [...prev, { ...part, quantity: 1, amount: part.rate }]
    );
  };

  const handleQuantityChange = (partNo, quantity) => {
    setSelectedParts((prev) =>
      prev.map((part) =>
        part.part_no === partNo
          ? {
              ...part,
              quantity: Math.max(1, quantity), // Ensure quantity is at least 1
              amount: part.rate * Math.max(1, quantity),
            }
          : part
      )
    );
  };

  const handleChange = (e) => {
    setCustomerDetails({ ...customerDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      // Send customer details and selected parts to the backend
      const response = await axios.post("http://localhost:5000/save-invoice", {
        customerDetails,
        selectedParts,
      });

      if (response.status === 200) {
        alert("Invoice saved successfully!");

        // Navigate to Invoice Preview with selected data
        navigate("/InvoicePreview", {
          state: {
            selectedParts,
            customerDetails,
          },
        });
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert("Failed to save invoice. Try again!");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
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
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={customerDetails.address}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        <input
          type="text"
          name="contact"
          placeholder="Contact Number"
          value={customerDetails.contact}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
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
        />
      </div>

      {/* Part Selection */}
      <h2 className="text-2xl font-bold mb-4">Select Parts</h2>
      <input
        type="text"
        placeholder="Enter Part Number"
        value={partNo}
        onChange={(e) => setPartNo(e.target.value)}
        className="border p-2 w-full mb-4"
      />

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th>Select</th>
            <th>Part No</th>
            <th>Description</th>
            <th>Rate</th>
            <th>Quantity</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {parts.map((part) => (
            <tr key={part.part_no} className="border">
              <td>
                <input
                  type="checkbox"
                  onChange={() => handleSelect(part)}
                  checked={selectedParts.some((p) => p.part_no === part.part_no)}
                />
              </td>
              <td>{part.part_no}</td>
              <td>{part.part_description}</td>
              <td>{part.rate}</td>
              <td>
                {selectedParts.some((p) => p.part_no === part.part_no) && (
                  <input
                    type="number"
                    min="1"
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
              <td>
                {selectedParts.some((p) => p.part_no === part.part_no)
                  ? selectedParts.find((p) => p.part_no === part.part_no).amount
                  : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Selected Parts Summary */}
      {selectedParts.length > 0 && (
        <div className="mt-6 bg-gray-100 p-4 rounded">
          <h3 className="font-bold mb-2">Selected Parts Summary</h3>
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-200">
                <th>Part No</th>
                <th>Description</th>
                <th>Rate</th>
                <th>Quantity</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {selectedParts.map((part) => (
                <tr key={part.part_no} className="border">
                  <td>{part.part_no}</td>
                  <td>{part.part_description}</td>
                  <td>{part.rate}</td>
                  <td>{part.quantity}</td>
                  <td>{part.amount}</td>
                </tr>
              ))}
              <tr className="font-bold">
                <td colSpan="4" className="text-right">
                  Total:
                </td>
                <td>
                  {selectedParts.reduce((sum, part) => sum + part.amount, 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <button
        className="mt-6 bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleSubmit}
        disabled={selectedParts.length === 0}
      >
        Generate Invoice
      </button>
    </div>
  );
}

export default Invoice;