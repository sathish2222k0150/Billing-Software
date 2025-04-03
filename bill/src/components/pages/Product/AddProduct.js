import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Sidebar from "../Sidebar";

function Product() {
    const [parts, setParts] = useState([]);
    const [filteredParts, setFilteredParts] = useState([]);
    const [currentPage] = useState("Dashboard");
    const [formData, setFormData] = useState({
        serial_number: "",
        part_no: "",
        hsn_sac: "",
        vehicle: "",
        part_description: "",
        qty: "",
        mrp: "",
        rate: "",
        value: "",
        cgst: "",
        sgst: ""
    });
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchParts();
    }, []);

    useEffect(() => {
        // Filter parts whenever searchTerm or parts change
        const filtered = parts.filter(part => {
            const description = part.part_description || '';
            const partNo = part.part_no || '';
            const serialNo = part.serial_number || '';
            
            return (
                description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                partNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                serialNo.toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
        setFilteredParts(filtered);
    }, [searchTerm, parts]);

    const fetchParts = async () => {
        const response = await axios.get("http://localhost:5000/parts");
        // Ensure no null values in the response
        const sanitizedParts = response.data.map(part => ({
            serial_number: part.serial_number || "",
            part_no: part.part_no || "",
            hsn_sac: part.hsn_sac || "",
            vehicle: part.vehicle || "",
            part_description: part.part_description || "",
            qty: part.qty || "",
            mrp: part.mrp || "",
            rate: part.rate || "",
            value: part.value || "",
            cgst: part.cgst || "",
            sgst: part.sgst || "",
            id: part.id
        }));
        setParts(sanitizedParts);
        setFilteredParts(sanitizedParts);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editId) {
            await axios.put(`http://localhost:5000/parts/${editId}`, formData);
        } else {
            await axios.post("http://localhost:5000/parts", formData);
        }
        fetchParts();
        setFormData({
            serial_number: "",
            part_no: "",
            hsn_sac: "",
            vehicle: "",
            part_description: "",
            qty: "",
            mrp: "",
            rate: "",
            value: "",
            cgst: "",
            sgst: ""
        });
        setEditId(null);
    };

    const handleEdit = (part) => {
        setEditId(part.id);
        setFormData(part);
    };

    const handleDelete = async (id) => {
        await axios.delete(`http://localhost:5000/parts/${id}`);
        fetchParts();
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <div className="w-64 fixed h-full">
                <Sidebar currentPage={currentPage} />
            </div>
            <div className="flex-1 min-h-screen bg-gray-100 flex flex-col items-center p-8 ml-64 overflow-auto">
                <motion.h2 
                    className="text-3xl font-bold text-blue-600 mb-6"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Parts Inventory Management
                </motion.h2>

                {/* Form Section */}
                <motion.form 
                    onSubmit={handleSubmit}
                    className="bg-white p-6 shadow-lg rounded-xl w-full max-w-2xl grid grid-cols-2 gap-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {[
                        "Part Location", "part_no", "hsn_sac", "vehicle", "part_description", "qty", "mrp", "rate", "value", "cgst", "sgst"
                    ].map((field, index) => (
                        <motion.input
                            key={index}
                            type={field === "qty" || field === "mrp" || field === "rate" || field === "value" || field === "cgst" || field === "sgst" ? "number" : "text"}
                            name={field}
                            placeholder={field.replace("_", " ").toUpperCase()}
                            value={formData[field]}
                            onChange={handleChange}
                            required
                            className="p-2 border rounded-lg outline-none focus:border-blue-500"
                            whileFocus={{ scale: 1.05 }}
                        />
                    ))}
                    <motion.button 
                        type="submit"
                        className={`col-span-2 text-white py-2 px-4 rounded-lg transition duration-300 ${editId ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"}`}
                        whileHover={{ scale: 1.05 }}
                    >
                        {editId ? "Update Part" : "Add Part"}
                    </motion.button>
                </motion.form>

                {/* Table Section */}
                <motion.div 
                    className="mt-8 w-full max-w-4xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-700">Parts List</h3>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by name or number..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="p-2 pl-10 border rounded-lg outline-none focus:border-blue-500 w-64"
                            />
                            <svg
                                className="absolute left-3 top-3 h-4 w-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                            <thead className="bg-blue-500 text-white">
                                <tr>
                                    {["Serial No", "Part No", "HSN/SAC", "Vehicle", "Description", "Qty", "MRP", "Rate", "Value", "CGST", "SGST", "Actions"].map((heading, index) => (
                                        <th key={index} className="py-2 px-4 text-left">{heading}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredParts.map((part, index) => (
                                    <motion.tr 
                                        key={part.id}
                                        className="border-b hover:bg-gray-100 transition duration-300"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <td className="py-2 px-4">{part.serial_number}</td>
                                        <td className="py-2 px-4">{part.part_no}</td>
                                        <td className="py-2 px-4">{part.hsn_sac}</td>
                                        <td className="py-2 px-4">{part.vehicle}</td>
                                        <td className="py-2 px-4">{part.part_description}</td>
                                        <td className="py-2 px-4">{part.qty}</td>
                                        <td className="py-2 px-4">{part.mrp}</td>
                                        <td className="py-2 px-4">{part.rate}</td>
                                        <td className="py-2 px-4">{part.value}</td>
                                        <td className="py-2 px-4">{part.cgst}</td>
                                        <td className="py-2 px-4">{part.sgst}</td>
                                        <td className="py-2 px-4 flex space-x-2">
                                            <motion.button 
                                                onClick={() => handleEdit(part)}
                                                className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition duration-300"
                                                whileHover={{ scale: 1.1 }}
                                            >
                                                Edit
                                            </motion.button>
                                            <motion.button 
                                                onClick={() => handleDelete(part.id)}
                                                className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition duration-300"
                                                whileHover={{ scale: 1.1 }}
                                            >
                                                Delete
                                            </motion.button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default Product;