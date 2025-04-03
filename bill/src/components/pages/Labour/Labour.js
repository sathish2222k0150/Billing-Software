import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";

function LabourInvoice() {
  const [labourItems, setLabourItems] = useState([
    {
      sno: 1,
      description: "",
      tinkering: "",
      painting: "",
      electrician: "",
      mechanical: "",
      cgst: "",
      sgst: "",
      total: 0
    }
  ]);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    address: "",
    contact: "",
    email: "",
    model: "",
    regNo: "",
    invoiceDate: formatDate(new Date().toISOString().split("T")[0]),
  });

  const navigate = useNavigate();

  const handleCustomerChange = (e) => {
    setCustomerDetails({ ...customerDetails, [e.target.name]: e.target.value });
  };

  const handleLabourChange = (index, e) => {
    const { name, value } = e.target;
    const newLabourItems = [...labourItems];
    newLabourItems[index] = {
      ...newLabourItems[index],
      [name]: value
    };

    // Calculate total when any amount field changes
    if (['tinkering', 'painting', 'electrician', 'mechanical', 'cgst', 'sgst'].includes(name)) {
      const tinkering = parseFloat(newLabourItems[index].tinkering) || 0;
      const painting = parseFloat(newLabourItems[index].painting) || 0;
      const electrician = parseFloat(newLabourItems[index].electrician) || 0;
      const mechanical = parseFloat(newLabourItems[index].mechanical) || 0;
      const cgst = parseFloat(newLabourItems[index].cgst) || 0;
      const sgst = parseFloat(newLabourItems[index].sgst) || 0;
      
      const subtotal = tinkering + painting + electrician + mechanical;
      const total = subtotal + (subtotal * (cgst + sgst) / 100);
      
      newLabourItems[index].total = total.toFixed(2);
    }

    setLabourItems(newLabourItems);
  };

  const addLabourItem = () => {
    setLabourItems([
      ...labourItems,
      {
        sno: labourItems.length + 1,
        description: "",
        tinkering: 0,
        painting: 0,
        electrician: 0,
        mechanical: 0,
        cgst: 0,
        sgst: 0,
        total: 0
      }
    ]);
  };

  const removeLabourItem = (index) => {
    if (labourItems.length <= 1) return;
    const newLabourItems = labourItems.filter((_, i) => i !== index);
    // Update S.No after removal
    const updatedItems = newLabourItems.map((item, idx) => ({
      ...item,
      sno: idx + 1
    }));
    setLabourItems(updatedItems);
  };

  const handleSubmit = async () => {
    try {
      // Convert date back to ISO format for backend
      const [day, month, year] = customerDetails.invoiceDate.split('-');
      const isoDate = new Date(`${year}-${month}-${day}`).toISOString();
      
      // Calculate subtotal and grand total
      const invoiceData = {
        customerDetails: {
          ...customerDetails,
          invoiceDate: isoDate
        },
        labourItems: labourItems.map(item => {
          const tinkering = parseFloat(item.tinkering) || 0;
          const painting = parseFloat(item.painting) || 0;
          const electrician = parseFloat(item.electrician) || 0;
          const mechanical = parseFloat(item.mechanical) || 0;
          const cgst = parseFloat(item.cgst) || 0;
          const sgst = parseFloat(item.sgst) || 0;
          const subtotal = tinkering + painting + electrician + mechanical;
          const total = subtotal + (subtotal * (cgst + sgst) / 100);
          
          return {
            sno: item.sno,
            ...item,
            tinkering,
            painting,
            electrician,
            mechanical,
            cgst,
            sgst,
            subtotal,
            total
          }
        })
      };
  
      const response = await axios.post("http://localhost:5000/save-labour-invoice", invoiceData);
  
      if (response.status === 200) {
        alert("Labour invoice saved successfully!");
        navigate("/LabourPreview", {
          state: {
            labourItems: invoiceData.labourItems,
            customerDetails: {
              ...customerDetails,
              invoiceDate: customerDetails.invoiceDate
            },
            invoiceId: response.data.invoiceId
          },
        });
      }
    } catch (error) {
      console.error("Error saving labour invoice:", error);
      alert("Failed to save labour invoice. Try again!");
    }
  };

  const calculateGrandTotal = () => {
    return labourItems.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0).toFixed(2);
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
        <h1 className="text-2xl font-bold">Labour Invoice Generation</h1>
        <div></div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Customer Details</h2>

      {/* Customer Form */}
      <div className="grid grid-cols-2 gap-4 bg-white p-6 rounded shadow-md mb-6">
        <input
          type="text"
          name="name"
          placeholder="Customer Name"
          value={customerDetails.name}
          onChange={handleCustomerChange}
          className="border p-2 w-full"
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={customerDetails.address}
          onChange={handleCustomerChange}
          className="border p-2 w-full"
          required
        />
        <input
          type="text"
          name="contact"
          placeholder="Contact Number"
          value={customerDetails.contact}
          onChange={handleCustomerChange}
          className="border p-2 w-full"
          required
        />
        <input
          type="text"
          name="email"
          placeholder="GST"
          value={customerDetails.email}
          onChange={handleCustomerChange}
          className="border p-2 w-full"
        />
        <input
          type="text"
          name="model"
          placeholder="Car Model"
          value={customerDetails.model}
          onChange={handleCustomerChange}
          className="border p-2 w-full"
        />
        <input
          type="text"
          name="regNo"
          placeholder="Registration Number"
          value={customerDetails.regNo}
          onChange={handleCustomerChange}
          className="border p-2 w-full"
        />
        <input
          type="date"
          name="invoiceDate"
          value={customerDetails.invoiceDate.split('-').reverse().join('-')} // Convert back to yyyy-mm-dd for the input
          onChange={(e) => {
            const formattedDate = formatDate(e.target.value);
            setCustomerDetails({...customerDetails, invoiceDate: formattedDate});
          }}
          className="border p-2 w-full"
          required
        />
      </div>

      <h2 className="text-2xl font-bold mb-4">Labour Charges</h2>

      <div className="overflow-x-auto bg-white rounded shadow-md mb-6">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">S.No</th>
              <th className="p-2">Description</th>
              <th className="p-2">Tinkering (₹)</th>
              <th className="p-2">Painting (₹)</th>
              <th className="p-2">Electrician (₹)</th>
              <th className="p-2">Mechanical (₹)</th>
              <th className="p-2">CGST (%)</th>
              <th className="p-2">SGST (%)</th>
              <th className="p-2">Total (₹)</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {labourItems.map((item, index) => (
              <tr key={index} className="border hover:bg-gray-50">
                <td className="p-2 text-center">{item.sno}</td>
                <td className="p-2">
                  <input
                    type="text"
                    name="description"
                    value={item.description}
                    onChange={(e) => handleLabourChange(index, e)}
                    className="border p-1 w-full"
                    required
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    name="tinkering"
                    value={item.tinkering}
                    onChange={(e) => handleLabourChange(index, e)}
                    className="border p-1 w-full"
                    min="0"
                    step="0.01"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    name="painting"
                    value={item.painting}
                    onChange={(e) => handleLabourChange(index, e)}
                    className="border p-1 w-full"
                    min="0"
                    step="0.01"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    name="electrician"
                    value={item.electrician}
                    onChange={(e) => handleLabourChange(index, e)}
                    className="border p-1 w-full"
                    min="0"
                    step="0.01"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    name="mechanical"
                    value={item.mechanical}
                    onChange={(e) => handleLabourChange(index, e)}
                    className="border p-1 w-full"
                    min="0"
                    step="0.01"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    name="cgst"
                    value={item.cgst}
                    onChange={(e) => handleLabourChange(index, e)}
                    className="border p-1 w-full"
                    min="0"
                    step="0.01"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    name="sgst"
                    value={item.sgst}
                    onChange={(e) => handleLabourChange(index, e)}
                    className="border p-1 w-full"
                    min="0"
                    step="0.01"
                  />
                </td>
                <td className="p-2 text-right font-medium">
                  {item.total}
                </td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => removeLabourItem(index)}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                    title="Remove item"
                    disabled={labourItems.length <= 1}
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
            ))}
            <tr className="bg-gray-100">

                      <td className="p-2 text-center">
                <button
                  onClick={addLabourItem}
                  className="flex items-center justify-center bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 w-full"
                  title="Add new item"
                >
                  <FaPlus className="mr-1" /> Add
                </button>
              </td>
              <td colSpan="8" className="p-2 text-right font-bold">
                Grand Total:
              </td>
              <td className="p-2 text-right font-bold text-blue-600">
                ₹{calculateGrandTotal()}
              </td>
              <td className="p-2">
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-6">
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          onClick={handleSubmit}
        >
          Generate Labour Invoice
        </button>
      </div>
    </div>
  );
}

export default LabourInvoice;