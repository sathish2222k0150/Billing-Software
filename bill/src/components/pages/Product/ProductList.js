import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProductsPage = () => {
    const [ setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [, setError] = useState(null);
  
    useEffect(() => {
      const fetchProducts = async () => {
        try {
          const response = await axios.get('http://localhost:5000/parts');
          setProducts(response.data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
  
      fetchProducts();
    }, [setProducts]);
  
    
  
    if (loading) return (
      <div className="p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p>Loading products...</p>
      </div>
    );
  
}
  
  export default ProductsPage;