import React from 'react';
import { Search, Filter, SortAsc, X } from 'lucide-react';

const FilterSection = ({
  searchTerm = '',
  setSearchTerm = () => {},
  filters = {},
  setFilters = () => {},
  showFilters = false,
  setShowFilters = () => {},
  showSort = false,
  setShowSort = () => {},
  setSortOption = () => {},
  brands = [],
  vehicleBrands = [],
  sortOption = '',
}) => {
  // Ensure all filter values have defaults
  const safeFilters = {
    brand: '',
    availability: '',
    vehicleBrand: '',
    minPrice: '',
    maxPrice: '',
    ...filters
  };

  return (
    <div className="mb-8 bg-white p-4 rounded-xl shadow-sm">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by part number, name, or description..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <button
              onClick={() => {
                setShowFilters(!showFilters);
                setShowSort(false);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
            {showFilters && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 p-4">
                <div className="space-y-4">
                  {/* Brand Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <select
                      value={safeFilters.brand}
                      onChange={(e) => setFilters({ ...safeFilters, brand: e.target.value })}
                      className="w-full border border-gray-200 rounded-md p-2"
                    >
                      <option value="">All Brands</option>
                      {brands.map((brand, index) => (
                        <option key={index} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Availability Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                    <select
                      value={safeFilters.availability}
                      onChange={(e) => setFilters({ ...safeFilters, availability: e.target.value })}
                      className="w-full border border-gray-200 rounded-md p-2"
                    >
                      <option value="">All</option>
                      <option value="available">In Stock</option>
                      <option value="unavailable">Out of Stock</option>
                    </select>
                  </div>
                  
                  {/* Vehicle Brand Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Brand</label>
                    <select
                      value={safeFilters.vehicleBrand}
                      onChange={(e) => setFilters({ ...safeFilters, vehicleBrand: e.target.value })}
                      className="w-full border border-gray-200 rounded-md p-2"
                    >
                      <option value="">All Vehicle Brands</option>
                      {vehicleBrands.map((brand, index) => (
                        <option key={index} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Price Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={safeFilters.minPrice}
                        onChange={(e) => setFilters({ ...safeFilters, minPrice: e.target.value })}
                        className="w-full border border-gray-200 rounded-md p-2"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={safeFilters.maxPrice}
                        onChange={(e) => setFilters({ ...safeFilters, maxPrice: e.target.value })}
                        className="w-full border border-gray-200 rounded-md p-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Sort Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSort(!showSort);
                setShowFilters(false);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <SortAsc className="w-4 h-4" />
              Sort
            </button>
            {showSort && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setSortOption('price-high-low');
                      setShowSort(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Price: High to Low
                  </button>
                  <button
                    onClick={() => {
                      setSortOption('price-low-high');
                      setShowSort(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Price: Low to High
                  </button>
                  <button
                    onClick={() => {
                      setSortOption('name-asc');
                      setShowSort(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Name: A to Z
                  </button>
                  <button
                    onClick={() => {
                      setSortOption('name-desc');
                      setShowSort(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Name: Z to A
                  </button>
                  <button
                    onClick={() => {
                      setSortOption('qty-high-low');
                      setShowSort(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Quantity: High to Low
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Active Filters */}
      {(safeFilters.brand || safeFilters.availability || safeFilters.vehicleBrand || safeFilters.minPrice || safeFilters.maxPrice || sortOption) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {safeFilters.brand && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Brand: {safeFilters.brand}
              <button
                onClick={() => setFilters({ ...safeFilters, brand: '' })}
                className="ml-2 hover:text-blue-600"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          )}
          {safeFilters.availability && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              {safeFilters.availability === 'available' ? 'In Stock' : 'Out of Stock'}
              <button
                onClick={() => setFilters({ ...safeFilters, availability: '' })}
                className="ml-2 hover:text-blue-600"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          )}
          {safeFilters.vehicleBrand && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Vehicle: {safeFilters.vehicleBrand}
              <button
                onClick={() => setFilters({ ...safeFilters, vehicleBrand: '' })}
                className="ml-2 hover:text-blue-600"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          )}
          {(safeFilters.minPrice || safeFilters.maxPrice) && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Price: {safeFilters.minPrice || '0'} - {safeFilters.maxPrice || '∞'}
              <button
                onClick={() => setFilters({ ...safeFilters, minPrice: '', maxPrice: '' })}
                className="ml-2 hover:text-blue-600"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          )}
          {sortOption && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Sort: {
                sortOption === 'price-high-low' ? 'Price: High to Low' :
                sortOption === 'price-low-high' ? 'Price: Low to High' :
                sortOption === 'name-asc' ? 'Name: A to Z' :
                sortOption === 'name-desc' ? 'Name: Z to A' :
                'Quantity: High to Low'
              }
              <button
                onClick={() => setSortOption('')}
                className="ml-2 hover:text-blue-600"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterSection;