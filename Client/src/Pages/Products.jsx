import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import { ProductCard } from "../Components/ProductCard";
import { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";

const filterSections = [
  { label: "Gender", options: ["men", "women", "kids", "unisex"] },
  { label: "Product Type", options: ["shirts", "pants", "watches", "shoes", "accessories"] },
  { label: "Product Availability", options: ["In Stock", "Out of Stock"] },
  {
    label: "Price",
    options: [
      { value: "Under ₨500",    display: "Under ₨500" },
      { value: "₨500 - ₨2000",  display: "₨500 - ₨2,000" },
      { value: "₨2000 - ₨5000", display: "₨2,000 - ₨5,000" },
      { value: "Above ₨5000",   display: "Above ₨5,000" },
    ]
  },
];

function FilterSection({ label, options, selected, onToggle }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-xs uppercase tracking-widest font-medium text-black"
      >
        {label}
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="mt-3 flex flex-col gap-2">
          {options.map((opt) => {
            const value = typeof opt === "object" ? opt.value : opt;
            const display = typeof opt === "object" ? opt.display : opt;
            return (
              <label key={value} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selected?.includes(value) || false}
                  onChange={() => onToggle(label, value)}
                  className="w-3.5 h-3.5 accent-black cursor-pointer"
                />
                <span className="text-xs text-gray-600 group-hover:text-black transition-colors capitalize">
                  {display}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Products() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState({});

  useEffect(() => {
    async function getItems() {
      try {
        const response = await fetch("https://shopmern-9ggl.onrender.com/api/products");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.log("Error occurred:", error);
      } finally {
        setLoading(false);
      }
    }
    getItems();
  }, []);

  function handleToggleFilter(category, option) {
    setSelectedFilters((prev) => {
      const current = prev[category] || [];
      const updated = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [category]: updated };
    });
  }

  function clearAllFilters() {
    setSelectedFilters({});
  }

  // Helper to get display label for a price value
  function getPriceDisplay(value) {
    const priceSection = filterSections.find((s) => s.label === "Price");
    const match = priceSection?.options.find((o) => o.value === value);
    return match ? match.display : value;
  }

  const activeFilterCount = Object.values(selectedFilters).flat().length;

  const filteredProducts = products.filter((product) => {

    // Gender — schema enum: men, women, kids, unisex
    const genders = selectedFilters["Gender"] || [];
    if (genders.length && !genders.includes(product.gender?.toLowerCase())) return false;

    // Product Type — schema enum: shirts, pants, watches, shoes, accessories
    const types = selectedFilters["Product Type"] || [];
    if (types.length && !types.includes(product.category?.toLowerCase())) return false;

    // Availability — based on stock field
    const avail = selectedFilters["Product Availability"] || [];
    if (avail.includes("In Stock") && !avail.includes("Out of Stock") && product.stock <= 0) return false;
    if (avail.includes("Out of Stock") && !avail.includes("In Stock") && product.stock > 0) return false;

    // Price — value keys have no commas, logic matches correctly
    const prices = selectedFilters["Price"] || [];
    if (prices.length) {
      const p = product.price;
      const match = prices.some((range) => {
        if (range === "Under ₨500")    return p < 500;
        if (range === "₨500 - ₨2000")  return p >= 500 && p <= 2000;
        if (range === "₨2000 - ₨5000") return p >= 2000 && p <= 5000;
        if (range === "Above ₨5000")   return p > 5000;
        return false;
      });
      if (!match) return false;
    }

    return true;
  });

  return (
    <>
      <NavBar />

      {/* ── Page Header ── */}
      <div className="border-b border-gray-200 py-10 text-center">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
          Browse our collection
        </p>
        <h1 className="text-4xl font-bold uppercase tracking-widest">
          All Products
        </h1>
      </div>

      {/* ── Toolbar ── */}
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-gray-200">

        {/* Filter Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-xs uppercase tracking-widest font-medium flex items-center gap-2 hover:text-gray-400 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="20" y2="12" />
            <line x1="12" y1="18" x2="20" y2="18" />
          </svg>
          Filter
          {activeFilterCount > 0 && (
            <span className="bg-black text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Product Count */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400 uppercase tracking-widest">
            {filteredProducts.length} Products
          </span>
        </div>

      </div>

      {/* ── Active Filter Tags — show display labels with commas ── */}
      {activeFilterCount > 0 && (
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap gap-2 items-center">
          {Object.entries(selectedFilters).map(([category, options]) =>
            options.map((opt) => (
              <button
                key={`${category}-${opt}`}
                onClick={() => handleToggleFilter(category, opt)}
                className="flex items-center gap-1 border border-gray-300 px-3 py-1 text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors"
              >
                {category === "Price" ? getPriceDisplay(opt) : opt}
                <X size={10} />
              </button>
            ))
          )}
          <button
            onClick={clearAllFilters}
            className="text-xs uppercase tracking-widest text-gray-400 hover:text-black underline ml-2 transition-colors"
          >
            Clear All
          </button>
        </div>
      )}

      {/* ── Filter Sidebar Overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">

          {/* Sidebar */}
          <div className="w-80 bg-white h-full overflow-y-auto px-6 py-6 shadow-xl animate-in slide-in-from-left duration-300">

            {/* Sidebar Header */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xl font-bold uppercase tracking-widest">Filter</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-black hover:text-gray-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Clear All inside sidebar */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs uppercase tracking-widest text-gray-400 hover:text-black underline mb-4 transition-colors"
              >
                Clear All ({activeFilterCount})
              </button>
            )}

            {/* Filter Sections */}
            {filterSections.map((section) => (
              <FilterSection
                key={section.label}
                label={section.label}
                options={section.options}
                selected={selectedFilters[section.label] || []}
                onToggle={handleToggleFilter}
              />
            ))}

            {/* Apply Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-full mt-6 bg-black text-white text-xs uppercase tracking-widest py-3 hover:bg-gray-800 transition-colors"
            >
              Apply Filters
            </button>

          </div>

          {/* Dark Backdrop */}
          <div
            className="flex-1 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />

        </div>
      )}

      {/* ── Products Grid ── */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-400 uppercase tracking-widest">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 uppercase tracking-widest">No products match your filters.</p>
            <button
              onClick={clearAllFilters}
              className="mt-4 text-xs uppercase tracking-widest underline hover:text-gray-400 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                _id={product._id}
                name={product.name}
                price={product.price}
                category={product.category}
                stock={product.stock}
                imageURL={product.imageURL}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}

export default Products;