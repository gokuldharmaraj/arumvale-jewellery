import { Link } from "react-router-dom";
import { ArrowRight, GitCompareArrows, Shield, Award, Gem, Sparkles, Star, ChevronRight, LogIn, Loader2 } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import heroBanner from "@/assets/hero-banner.jpg";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import MetalPrices from "../components/MetalPrices";
import axios from "axios";

const trustPoints = [{
  icon: Shield,
  label: "BIS Hallmarked",
  desc: "100% certified purity"
}, {
  icon: Award,
  label: "Best Price Guarantee",
  desc: "Compare across vendors"
}, {
  icon: Gem,
  label: "AI Value Score",
  desc: "Smart buying decisions"
}, {
  icon: Sparkles,
  label: "Verified Sellers",
  desc: "Trusted jewellers only"
}];
const testimonials = [{
  name: "Priya Sharma",
  location: "Mumbai",
  text: "The comparison engine helped me save ₹35,000 on my wedding necklace. Absolutely brilliant platform!",
  rating: 5
}, {
  name: "Rahul Mehta",
  location: "Delhi",
  text: "Finally, a transparent way to buy jewellery. The value score made my decision so easy.",
  rating: 5
}, {
  name: "Ananya Reddy",
  location: "Hyderabad",
  text: "I compared 4 diamond sets side-by-side and found the perfect one within my budget.",
  rating: 4
}];
const categories = ["All", "Necklace", "Ring", "Bangle", "Earrings", "Pendant", "Anklet", "Chain", "Bracelet"];
export default function Index() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const {
    isLoggedIn,
    user
  } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/products?status=active");
        setProducts(response.data.products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filtered = activeCategory === "All" ? products : products.filter(p => p.category === activeCategory);

  if (loading) {
    return <div className="container py-20 text-center">
        <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading products...</p>
      </div>;
  }
  return <div>
      {/* Hero */}
      <section className="relative h-[80vh] min-h-[560px] overflow-hidden">
        <img src={heroBanner} alt="Luxury Jewellery Collection" className="absolute inset-0 w-full h-full object-cover scale-105" />
        <div className="absolute inset-0 bg-gradient-to-b from-luxury-black/80 via-luxury-black/50 to-luxury-black/90" />
        
        {/* Decorative corner accents */}
        <div className="absolute top-8 left-8 w-20 h-20 border-t-2 border-l-2 border-primary/40" />
        <div className="absolute top-8 right-8 w-20 h-20 border-t-2 border-r-2 border-primary/40" />
        <div className="absolute bottom-8 left-8 w-20 h-20 border-b-2 border-l-2 border-primary/40" />
        <div className="absolute bottom-8 right-8 w-20 h-20 border-b-2 border-r-2 border-primary/40" />

        <div className="relative container h-full flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-12 bg-primary/60" />
            <p className="text-primary text-xs font-medium tracking-[0.3em] uppercase">India's First Smart Jewellery Platform</p>
            <span className="h-px w-12 bg-primary/60" />
          </div>

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-cream leading-[1.1] mb-6 max-w-4xl">
            {isLoggedIn ? <>Welcome Back,<br /><span className="gold-text italic">{user?.username}</span></> : <>Discover, Compare &<br />Choose <span className="gold-text italic">Brilliance</span></>}
          </h1>

          <p className="text-cream/60 text-base md:text-lg mb-10 max-w-xl font-light leading-relaxed">
            Compare price, purity, weight & AI value scores across India's finest jewellers — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/products" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-medium hover:bg-gold-dark transition-all duration-300 shadow-lg shadow-primary/20">
              Explore Collection <ArrowRight className="h-4 w-4" />
            </Link>
            {isLoggedIn ? <Link to="/compare" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-primary/40 text-cream font-medium hover:bg-primary/10 transition-all duration-300">
                <GitCompareArrows className="h-4 w-4 text-primary" /> Smart Compare
              </Link> : <Link to="/login" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-primary/40 text-cream font-medium hover:bg-primary/10 transition-all duration-300">
                <LogIn className="h-4 w-4 text-primary" /> Sign In to Get Started
              </Link>}
          </div>
        </div>
      </section>

      {/* Live Prices */}
      <MetalPrices />
     

      {/* Trust Badges */}
      <section className="relative -mt-6 z-10">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {trustPoints.map(tp => <div key={tp.label} className="bg-card border border-border rounded-xl p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                  <tp.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display font-semibold text-foreground text-sm">{tp.label}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{tp.desc}</p>
                </div>
              </div>)}
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-20 container">
        <div className="text-center mb-12">
          <p className="text-primary text-xs font-medium tracking-[0.25em] uppercase mb-3">Curated For You</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Featured Collection</h2>
          <div className="w-16 h-0.5 bg-primary mx-auto mt-4" />
        </div>

        <div className="flex justify-center gap-2 mb-10 overflow-x-auto pb-2">
          {categories.map(cat => <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${activeCategory === cat ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"}`}>
              {cat}
            </button>)}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(product => <ProductCard key={product._id} product={product} />)}
        </div>

        <div className="text-center mt-10">
          <Link to="/products" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-gold-dark transition-colors group">
            View Full Collection <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center mb-14">
            <p className="text-primary text-xs font-medium tracking-[0.25em] uppercase mb-3">How It Works</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Compare in 3 Simple Steps</h2>
            <div className="w-16 h-0.5 bg-primary mx-auto mt-4" />
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[{
            step: "01",
            title: "Browse & Select",
            desc: "Explore jewellery from verified vendors and select items to compare."
          }, {
            step: "02",
            title: "Smart Compare",
            desc: "View side-by-side comparison of price, purity, weight and AI value score."
          }, {
            step: "03",
            title: "Buy With Confidence",
            desc: "Choose the best option backed by data and AI recommendations."
          }].map(item => <div key={item.step} className="text-center group">
                <div className="w-16 h-16 rounded-full border-2 border-primary/30 flex items-center justify-center mx-auto mb-5 group-hover:border-primary group-hover:bg-primary/5 transition-all duration-300">
                  <span className="font-display text-xl font-bold text-primary">{item.step}</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>)}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 container">
        <div className="text-center mb-14">
          <p className="text-primary text-xs font-medium tracking-[0.25em] uppercase mb-3">Testimonials</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">What Our Customers Say</h2>
          <div className="w-16 h-0.5 bg-primary mx-auto mt-4" />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map(t => <div key={t.name} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex gap-0.5 mb-4">
                {Array.from({
              length: t.rating
            }).map((_, i) => <Star key={i} className="h-4 w-4 fill-primary text-primary" />)}
              </div>
              <p className="text-foreground text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
              <div className="border-t border-border pt-4">
                <p className="font-display font-semibold text-foreground text-sm">{t.name}</p>
                <p className="text-muted-foreground text-xs">{t.location}</p>
              </div>
            </div>)}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-luxury-black relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="container text-center relative">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="h-px w-12 bg-primary/40" />
            <Gem className="h-5 w-5 text-primary" />
            <span className="h-px w-12 bg-primary/40" />
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-cream mb-4 leading-tight">
            Ready to Find Your<br /><span className="gold-text italic mr-3">Perfect Piece?<br /></span>
          </h2>
          <p className="text-cream/50 max-w-xl mx-auto mb-10 font-light">
            {isLoggedIn ? "Explore our curated collection and use our AI-powered comparison engine to find the best value." : "Join thousands of smart buyers who save money and make better jewellery decisions with our AI-powered comparison engine."}
          </p>
          {isLoggedIn ? <Link to="/products" className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-primary text-primary-foreground font-medium hover:bg-gold-dark transition-all duration-300 shadow-lg shadow-primary/25">
              Start Comparing <GitCompareArrows className="h-4 w-4" />
            </Link> : <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-primary text-primary-foreground font-medium hover:bg-gold-dark transition-all duration-300 shadow-lg shadow-primary/25">
                Create Free Account <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 px-10 py-4 rounded-full border border-primary/40 text-cream font-medium hover:bg-primary/10 transition-all duration-300">
                <LogIn className="h-4 w-4 text-primary" /> Sign In
              </Link>
            </div>}
        </div>
      </section>
    </div>;
}
