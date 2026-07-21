import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function ProductCard({ _id, name, price, category, stock, imageURL, attributes = {} }) {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedAttribute, setSelectedAttribute] = useState({});

  const formattedPrice = new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);

  const goToProduct = () => navigate(`/product/${_id}`);

  // Helper function to check if product is perfume
  const isPerfume = () => {
    const perfumeKeywords = ['NICE', 'ACTUALLY', 'SAFFRON', 'JASMINE', 'BUNGALOW', 'PERFUME', 'NICE, ACTUALLY'];
    return perfumeKeywords.some(keyword => name.toUpperCase().includes(keyword));
  };

  // Render dynamic attributes based on category
  const renderAttributes = () => {
    // WATCHES - Show color options
    if (category === 'watches') {
      const watchColors = attributes.colors || ['Silver Black', 'Rose Gold', 'Black', 'Blue', 'Brown'];
      return (
        <div className="flex flex-col gap-2 mt-2">
          <label className="text-xs font-medium text-gray-700">Color:</label>
          <div className="flex flex-wrap gap-2">
            {watchColors.map((color) => (
              <button
                key={color}
                onClick={() => {
                  setSelectedAttribute({ ...selectedAttribute, color });
                  goToProduct();
                }}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-150
                  ${selectedAttribute.color === color
                    ? "border-2 border-gray-900 bg-gray-900 text-white"
                    : "border border-gray-300 bg-white text-gray-700 hover:border-gray-500"
                  }
                `}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // PERFUMES - Show ml size options
    if (category === 'accessories' && isPerfume()) {
      const perfumeSizes = attributes.sizes || ['50ml', '100ml', '200ml'];
      return (
        <div className="flex flex-col gap-2 mt-2">
          <label className="text-xs font-medium text-gray-700">Size:</label>
          <div className="flex flex-wrap gap-2">
            {perfumeSizes.map((size) => (
              <button
                key={size}
                onClick={() => {
                  setSelectedAttribute({ ...selectedAttribute, size });
                  goToProduct();
                }}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-150
                  ${selectedAttribute.size === size
                    ? "border-2 border-gray-900 bg-gray-900 text-white"
                    : "border border-gray-300 bg-white text-gray-700 hover:border-gray-500"
                  }
                `}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // SHOES - Show shoe sizes
    if (category === 'shoes') {
      const shoeSizes = attributes.shoeSizes || ['39', '40', '41', '42', '43', '44'];
      return (
        <div className="flex flex-col gap-2 mt-2">
          <label className="text-xs font-medium text-gray-700">Shoe Size:</label>
          <div className="flex flex-wrap gap-1.5">
            {shoeSizes.map((size) => (
              <button
                key={size}
                onClick={() => {
                  setSelectedAttribute({ ...selectedAttribute, shoeSize: size });
                  goToProduct();
                }}
                className={`
                  w-10 h-8 text-xs font-medium rounded transition-all duration-150
                  ${selectedAttribute.shoeSize === size
                    ? "border-2 border-gray-900 bg-gray-900 text-white"
                    : "border border-gray-300 bg-white text-gray-700 hover:border-gray-500"
                  }
                `}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // CLOTHES (shirts, pants) - Show clothing sizes
    if (category === 'shirts' || category === 'pants') {
      const clothingSizes = attributes.sizes || ['S', 'M', 'L', 'XL', 'XXL'];
      return (
        <div className="flex flex-col gap-2 mt-2">
          <label className="text-xs font-medium text-gray-700">Size:</label>
          <div className="flex flex-wrap gap-1.5">
            {clothingSizes.map((size) => (
              <button
                key={size}
                onClick={() => {
                  setSelectedAttribute({ ...selectedAttribute, size });
                  goToProduct();
                }}
                className={`
                  w-8 h-8 text-xs font-medium rounded transition-all duration-150
                  ${selectedAttribute.size === size
                    ? "border-2 border-gray-900 bg-gray-900 text-white"
                    : "border border-gray-300 bg-white text-gray-700 hover:border-gray-500"
                  }
                `}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">

      {/* Tall Portrait Image */}
      <div
        className="w-full overflow-hidden cursor-pointer"
        style={{ aspectRatio: "3 / 4" }}
        onClick={goToProduct}
      >
        <img
          src={imageURL?.[0] || "https://avatar.vercel.sh/shadcn1"}
          alt={name}
          className="w-full h-full object-cover hover:opacity-90 transition-opacity duration-200"
        />
      </div>

      {/* Info Section */}
      <div className="pt-4 pb-4 px-4 flex flex-col gap-3 border-t border-gray-200">

        {/* Product Name */}
        <p
          className="text-base font-normal text-gray-900 cursor-pointer hover:text-gray-600 transition-colors leading-snug"
          onClick={goToProduct}
        >
          {name}
        </p>

        {/* Price */}
        <p className="text-base font-bold text-gray-900">
          {formattedPrice}
        </p>

        {/* Dynamic Attributes - Shows different options based on product type */}
        {renderAttributes()}

        {/* Out of stock */}
        {stock === 0 && (
          <p className="text-sm text-red-500">Out of stock</p>
        )}
      </div>
    </div>
  );
}