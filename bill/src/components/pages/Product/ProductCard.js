import React from 'react';

const ProductCard = ({ product }) => {
  if (!product) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 text-center">
        Product data not available
      </div>
    );
  }

  // Ensure suitableFor is always an array
  const suitableFor = Array.isArray(product.suitableFor) ? product.suitableFor : [];
  
  // Get description - check both product.description and product.part_description
  const description = product.description || product.part_description || '';

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {product.name || product.part_description || 'Unnamed Product'}
          </h3>
          <p className="text-blue-600 font-medium">
            {product.brand || product.hsn_sac || 'No Brand'}
          </p>
          <p className="text-sm text-gray-500">
            Part No: {product.part_no || 'N/A'}
          </p>
          {product.serial_number && (
            <p className="text-sm text-gray-500">
              Serial: {product.serial_number}
            </p>
          )}
        </div>
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
          #{product.id || 'N/A'}
        </span>
      </div>
      
      <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Quantity: {product.qty || 0}
            </span>
            <span className={`text-sm font-medium ${
              (product.qty >= 1) ? 'text-green-600' : 'text-red-600'
            }`}>
              {(product.qty >= 1) ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Compatibility:</p>
          <div className="mt-2 space-y-2">
            {suitableFor.length > 0 ? (
              suitableFor.map((vehicle, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {vehicle?.model || 'Multiple Vehicles'}
                    </span>
                    <span className="text-sm font-semibold">
                      ₹{(vehicle?.price || product.rate || 0)?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {description}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-400 italic">
                {description && (
                  <p className="text-xs text-gray-500 mt-1">
                    {description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-500">Dealer Price:</span>
            <span className="text-sm font-semibold">
              ₹{(product.rate || 0)?.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-500">Retail Price:</span>
            <span className="text-lg font-bold text-gray-900">
              ₹{(product.mrp || 0)?.toLocaleString('en-IN')}
            </span>
          </div>
          {product.cgst && product.sgst && (
            <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
              <span>GST: {product.cgst}% CGST + {product.sgst}% SGST</span>
              <span>₹{((product.mrp - product.rate) || 0).toFixed(2)} total</span>
            </div>
          )}
        </div>
      </div>
  );
};

export default ProductCard;