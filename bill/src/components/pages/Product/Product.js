/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Sidebar from '../Sidebar';
import Header from '../Product/Header';
import FilterSection from '../Product/FilterSection';
import ProductCard from '../Product/ProductCard';

function Product() {
  const [currentPage] = useState("Dashboard");
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [filters, setFilters] = useState({
    brand: '',
    availability: '',
    vehicleBrand: '',
    minPrice: '',
    maxPrice: '',
  });
  const [sortOption, setSortOption] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/parts');
        setProducts(response.data || []); // Ensure we always have an array
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        setProducts([]); // Set empty array on error
      }
    };

    fetchProducts();
  }, []);

  // Extract unique brands and vehicle brands for filters
  const brands = useMemo(() => {
    return [...new Set(products?.map(product => product.brand) || [])].filter(Boolean);
  }, [products]);

  const vehicleBrands = useMemo(() => {
    return Array.from(
      new Set(
        (products || []).flatMap((product) =>
          (product?.suitableFor || []).map((vehicle) =>
            vehicle?.model ? vehicle.model.split(" ")[0] : ""
          )
        )
      )
    ).filter((brand) => brand !== "");
  }, [products]);
  
  

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    if (loading || !products) return [];
    if (error) return [];

    let filteredProducts = (products || []).filter((product) => {
      if (!product) return false;
      
      // Search term filter
      const matchesSearch = searchTerm === '' || 
        (product.part_no && product.part_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.serial_number && product.serial_number.toLowerCase().includes(searchTerm.toLowerCase()));

      // Other filters
      return (
        matchesSearch &&
        (filters.brand === '' || product.brand === filters.brand) &&
        (filters.availability === '' || 
          (filters.availability === 'available' ? product.availability : !product.availability)) &&
        (filters.vehicleBrand === '' || 
          (product.suitableFor || []).some(vehicle => 
            vehicle?.model?.startsWith(filters.vehicleBrand))) &&
        (filters.minPrice === '' || (product.price || 0) >= Number(filters.minPrice)) &&
        (filters.maxPrice === '' || (product.price || 0) <= Number(filters.maxPrice))
      );
    });

    // Sorting
    switch (sortOption) {
      case 'price-low-high':
        filteredProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high-low':
        filteredProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'name-asc':
        filteredProducts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name-desc':
        filteredProducts.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'qty-high-low':
        filteredProducts.sort((a, b) => (b.qty || 0) - (a.qty || 0));
        break;
      default:
        break;
    }

    return filteredProducts;
  }, [products, searchTerm, filters, sortOption, loading, error]);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar currentPage={currentPage} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p>Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar currentPage={currentPage} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-red-500">
            <p>Error loading products: {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar currentPage={currentPage} />

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <Header />

        <main className="container mx-auto px-4 py-8">
          {/* Filter Section */}
          <FilterSection 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filters={filters}
            setFilters={setFilters}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            showSort={showSort}
            setShowSort={setShowSort}
            setSortOption={setSortOption}
            brands={brands}
            vehicleBrands={vehicleBrands}
            sortOption={sortOption}
          />

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedProducts.length > 0 ? (
              filteredAndSortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-12">
                {products.length === 0 ? (
                  'No products available in inventory'
                ) : (
                  'No products match your filters'
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Product;