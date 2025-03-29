import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/pages/Dashboard/Dashboard";
import Login from "./components/pages/Login";
import CustomerDetails from "./components/pages/Customers/Customers";
import Product from "./components/pages/Product/Product";
import Invoice from "./components/pages/Invoice/Invoice";
import Navbar from "./components/pages/Navbar";
import Register from "./components/pages/Register";
import { AuthProvider, AuthContext } from "./components/Context/AuthContext";
import Settings from './components/pages/Settings/Settings';
import Reports from "./components/pages/Reports";
import { useContext } from "react";
import AddProduct from "./components/pages/Product/AddProduct";
import InvoicePreview from "./components/pages/Invoice/InvoicePreview";
import InvoiceDetails from "./components/pages/Invoice/InvoiceDetails";
import Estimate from "./components/pages/Estimate/Estimate";
import EstimatePreview from "./components/pages/Estimate/EstimatePreivew";
import EstimateDetails from "./components/pages/Estimate/EstimateDetails";
import LabourInvoice from "./components/pages/Labour/Labour";
import LabourInvoiceSearch from "./components/pages/Labour/LabourDetails";
import LabourPreview from "./components/pages/Labour/LabourPreview"
import InvoiceDashboard from "./components/pages/Dashboard/InvoiceDashboard";


function App() {
  return (
    <AuthProvider>
      <Router>
        <AuthWrapper />
      </Router>
    </AuthProvider>
  );
}

// ✅ Ensures Navbar is shown only when the user is logged in
const AuthWrapper = () => {
  const { user } = useContext(AuthContext);

  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Customers" element={<CustomerDetails />} />
        <Route path="/Product" element={<Product />} />
        <Route path="/Invoice" element={<Invoice />} />
        <Route path="/Settings" element={<Settings />} />
        <Route path="/Reports" element={<Reports />} />
        <Route path="/AddProduct" element={<AddProduct />} />
        <Route path="/InvoicePreview" element={<InvoicePreview />} />
        <Route path="/InvoiceDetails" element={<InvoiceDetails />} />
        <Route path="/Estimate" element={<Estimate />} />
        <Route path="/EstimatePreview" element={<EstimatePreview />} />
        <Route path="/EstimateDetails" element={<EstimateDetails />} />
        <Route path="/Labour" element={<LabourInvoice />} />
        <Route path="/LabourDetails" element={<LabourInvoiceSearch />} />
        <Route path="/LabourPreview" element={<LabourPreview />} />
        <Route path="/InvoiceDashboard" element={<InvoiceDashboard />} />
      </Routes>
    </>
  );
};

export default App;
