import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import { ProductCard } from "../Components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const categories = [
  { name: "All" },
  { name: "shirts" },
  { name: "pants" },
  { name: "shoes" },
  { name: "watches" },
  { name: "accessories" },
];

function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    async function getProducts() {
      try {
        const response = await fetch("http://localhost:5000/api/products");
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.log("Failed to load products");
      }
    }
    getProducts();
  }, []);

  // Filter products when category or search changes
  useEffect(() => {
    let result = products;

    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim() !== "") {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(result);
  }, [selectedCategory, searchQuery, products]);

  return (
    <>
      <NavBar />

      {/* ── Hero Section ── */}
      <section className="relative w-full h-screen overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600"
          alt="Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 text-white text-center px-4">
          <p className="text-xs uppercase tracking-[0.4em] mb-3 font-light">
            Select Pieces Up To 40 Percent
          </p>
          <h1 className="text-6xl md:text-8xl font-bold uppercase tracking-widest mb-8">
            Summer Sale
          </h1>
          <div className="flex items-center gap-10">
            <a
              href="/women"
              className="text-xs uppercase tracking-[0.3em] font-medium border-b border-white pb-0.5 hover:text-gray-300 hover:border-gray-300 transition-colors cursor-pointer"
            >
              Shop Woman
            </a>
            <a
              href="/men"
              className="text-xs uppercase tracking-[0.3em] font-medium border-b border-white pb-0.5 hover:text-gray-300 hover:border-gray-300 transition-colors cursor-pointer"
            >
              Shop Man
            </a>
          </div>
        </div>
      </section>

      {/* ── Categories Filter ── */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Our Best Quality Products</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-black hover:text-gray-400 hover:bg-gray-100 cursor-pointer"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search size={18} />
            </Button>
            <Button
              variant="outline"
              className="gap-2 text-sm cursor-pointer"
              onClick={() => navigate("/allproducts")}
            >
              View All <ArrowRight size={14} />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="border border-gray-200 rounded-lg px-4 py-3 mb-6 flex items-center gap-2">
            <Search size={16} className="text-gray-400" />
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full outline-none text-sm text-black placeholder-gray-400 bg-transparent"
            />
            <button
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery("");
              }}
              className="text-xs text-gray-400 hover:text-black uppercase tracking-widest cursor-pointer"
            >
              Close
            </button>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all capitalize cursor-pointer ${
                selectedCategory === cat.name
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-600 border-gray-200 hover:border-black hover:text-black"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.slice(0, 8).map((product) => (
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

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-400 uppercase tracking-widest text-sm">
              No products found in "{selectedCategory}"
            </p>
          </div>
        )}
      </section>

      {/* ── Banner Section ── */}
      <section className="mx-6 my-10 rounded-3xl overflow-hidden relative">
        <img
          src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1400"
          alt="Banner"
          className="w-full h-72 object-cover brightness-50"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <p className="text-sm uppercase tracking-widest mb-2 text-gray-300">
            Limited Time Offer
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            End of Season Sale
          </h2>
          <p className="text-gray-300 mb-6 max-w-md">
            Up to 50% off on selected items. Don't miss out on the biggest sale of the year.
          </p>
          <Button className="bg-white text-black hover:bg-gray-200 px-8 py-5 font-semibold cursor-pointer">
            Shop the Sale
          </Button>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="bg-black text-white py-16 px-6">
        <div className="max-w-xl mx-auto text-center flex flex-col items-center gap-4">
          <Badge className="bg-gray-800 text-gray-300 text-xs">Newsletter</Badge>
          <h2 className="text-3xl font-bold">
            Subscribe & Get <span className="text-gray-400">30% OFF</span>
          </h2>
          <p className="text-gray-400 text-sm">
            Join our newsletter and be the first to know about new arrivals and exclusive deals.
          </p>
          <div className="flex items-center gap-2 w-full mt-2">
            <input
              type="email"
              placeholder="Enter your email address..."
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-gray-500"
            />
            <Button className="bg-white text-black hover:bg-gray-200 px-6 py-3 font-semibold whitespace-nowrap cursor-pointer">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Home;