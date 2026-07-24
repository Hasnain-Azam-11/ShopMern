import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import { ProductCard } from "../Components/ProductCard";
import { useState, useEffect } from "react";

function Kids() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getProducts() {
      try {
        const response = await fetch("https://shopmern-9ggl.onrender.com/api/products");
        const data = await response.json();
        const filtered = data.filter((p) => p.gender === "kids");
        setProducts(filtered);
      } catch (error) {
        console.log("Failed to load products");
      } finally {
        setLoading(false);
      }
    }
    getProducts();
  }, []);

  return (
    <>
      <NavBar />

      {/* ── Hero Section ── */}
      <section className="relative w-full h-screen overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1600"
          alt="Kids Collection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 text-white text-center px-4">
          <p className="text-xs uppercase tracking-[0.4em] mb-3 font-light">
            Fun & Comfortable
          </p>
          <h1 className="text-6xl md:text-8xl font-bold uppercase tracking-widest mb-8">
            Kids
          </h1>
          <div className="flex items-center gap-10">
            
            
          </div>
        </div>
      </section>

      {/* ── Page Header ── */}
      <div className="border-b border-gray-200 py-10 text-center">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
          Made for little ones
        </p>
        <h2 className="text-4xl font-bold uppercase tracking-widest">
          Kids' Collection
        </h2>
      </div>

      {/* ── Products Grid ── */}
      <section id="collection" className="max-w-7xl mx-auto px-6 py-10">
        {loading ? (
          <p className="text-center text-gray-400 py-20 uppercase tracking-widest text-sm">
            Loading...
          </p>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-400 py-20 uppercase tracking-widest text-sm">
            No products found
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
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
      </section>

      {/* ── Banner ── */}
      <section className="mx-6 my-10 rounded-3xl overflow-hidden relative">
        <img
          src="https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=1400"
          alt="Kids Sale Banner"
          className="w-full h-72 object-cover brightness-50"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <p className="text-sm uppercase tracking-widest mb-2 text-gray-300">
            Back to School
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Dress Them for Every Adventure
          </h2>
          <p className="text-gray-300 mb-6 max-w-md">
            Durable, comfortable, and stylish clothes for active kids. Shop the latest collection now.
          </p>
          
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Kids;