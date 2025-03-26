import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/pages/Dashboard/Dashboard";
import Login from "./components/pages/Login";
import CustomerDetails from "./components/pages/Customers/Customers";
import Product from "./components/pages/Product/Product";
import Billing from "./components/pages/Billing";
import Invoice from "./components/pages/Invoice/Invoice";
import PaymentStatus from "./components/pages/PaymentStatus";
import Navbar from "./components/pages/Navbar";
import Register from "./components/pages/Register";
import { AuthProvider, AuthContext } from "./components/Context/AuthContext";
import Settings from './components/pages/Settings';
import Reports from "./components/pages/Reports";
import { useContext } from "react";
import AddProduct from "./components/pages/Product/AddProduct";
import InvoicePreview from "./components/pages/Invoice/InvoicePreview";

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
        <Route path="/Billing" element={<Billing />} />
        <Route path="/Invoice" element={<Invoice />} />
        <Route path="/PaymentStatus" element={<PaymentStatus />} />
        <Route path="/Settings" element={<Settings />} />
        <Route path="/Reports" element={<Reports />} />
        <Route path="/AddProduct" element={<AddProduct />} />
        <Route path="/InvoicePreview" element={<InvoicePreview />} />
      </Routes>

    </>
  );
};

export default App;
