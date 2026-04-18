import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Flame, Target, BadgeDollarSign, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import ExplainBadge from "@/components/ExplainBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { products, categories, Category } from "@/data/products";
import { useBehavior } from "@/context/BehaviorContext";

// Normalize any incoming category string to a valid Category (case-insensitive)
const normalizeCategory = (raw: string | null): Category => {
  if (!raw) return "All";
  const match = categories.find(
    (c) => c.toLowerCase() === raw.trim().toLowerCase()
  );
  return (match as Category) || "All";
};
const trendingProducts = products.filter((p) => p.reviews > 2000).slice(0, 4);
const dealProducts = products.filter((p) => p.originalPrice).sort((a, b) => {
  const dA = ((a.originalPrice! - a.price) / a.originalPrice!) * 100;
  const dB = ((b.originalPrice! - b.price) / b.originalPrice!) * 100;
  return dB - dA;
}).slice(0, 4);
const recommendedProducts = products.filter((p) => p.rating >= 4.5).slice(0, 4);

const SectionHeader = ({ icon: Icon, title, color }: { icon: any; title: string; color: string }) => (
  <div className="flex items-center gap-2 mb-4">
    <Icon className={`h-5 w-5 ${color}`} />
    <h2 className="text-xl font-bold">{title}</h2>
  </div>
);

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const searchParam = searchParams.get("search") || "";

  const [activeCategory, setActiveCategory] = useState<Category>(() =>
    normalizeCategory(categoryParam)
  );
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [isLoading, setIsLoading] = useState(false);
  const { getExplanation, trackSearch } = useBehavior();

  // Sync state with URL params whenever they change (fixes nav between categories)
  useEffect(() => {
    const next = normalizeCategory(categoryParam);
    setActiveCategory((prev) => (prev !== next ? next : prev));
  }, [categoryParam]);

  useEffect(() => {
    setSearchQuery(searchParam);
  }, [searchParam]);

  // Simulate fetch transition + log on category/search change
  useEffect(() => {
    setIsLoading(true);
    console.log("[Index] Filtering for category:", activeCategory, "search:", searchQuery);
    const t = setTimeout(() => setIsLoading(false), 250);
    return () => clearTimeout(t);
  }, [activeCategory, searchQuery]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result = products.filter((p) => {
      const matchCat =
        activeCategory === "All" ||
        p.category.toLowerCase() === activeCategory.toLowerCase();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
    console.log(`[Index] ${result.length} products matched`);
    return result;
  }, [activeCategory, searchQuery]);

  // Fallback: trending items when current filter yields nothing
  const fallbackProducts = useMemo(
    () => [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 4),
    []
  );

  const handleSelectCategory = (cat: Category) => {
    setActiveCategory(cat);
    setSearchQuery("");
    if (cat !== "All") trackSearch(cat); // feed behavior context for explainable AI
    const params = new URLSearchParams();
    if (cat !== "All") params.set("category", cat);
    setSearchParams(params, { replace: false });
  };

  const showSections = activeCategory === "All" && !searchQuery;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar onSearch={setSearchQuery} />
      <HeroBanner />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* Featured Sections */}
        {showSections && (
          <div className="space-y-10 mb-12">
            <section>
              <SectionHeader icon={Flame} title="Trending Now 🔥" color="text-orange-500" />
              <ExplainBadge text={getExplanation(trendingProducts[0]?.category || "", "trending")} className="mb-3" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {trendingProducts.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </section>

            <section>
              <SectionHeader icon={Target} title="Recommended for You 🎯" color="text-primary" />
              <ExplainBadge text={getExplanation(recommendedProducts[0]?.category || "", "recommended")} className="mb-3" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {recommendedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </section>

            <section>
              <SectionHeader icon={BadgeDollarSign} title="Best Deals 💰" color="text-deal" />
              <ExplainBadge text={getExplanation(dealProducts[0]?.category || "", "deal")} className="mb-3" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {dealProducts.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </section>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleSelectCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {searchQuery && (
          <p className="text-sm text-muted-foreground mb-4">
            Showing results for "<span className="font-medium text-foreground">{searchQuery}</span>"
            <button onClick={() => setSearchQuery("")} className="ml-2 text-primary hover:underline">Clear</button>
          </p>
        )}

        <h2 id="product-grid" className="text-xl font-bold mb-4 flex items-center gap-2 scroll-mt-24">
          {activeCategory === "All" ? "All Products" : activeCategory}
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="animate-fade-in">
            <div className="text-center py-10 bg-muted/40 rounded-lg mb-6">
              <p className="text-lg font-medium">No products found in this category</p>
              <p className="text-sm text-muted-foreground mt-1">
                Showing trending items instead
              </p>
              <button
                onClick={() => handleSelectCategory("All")}
                className="mt-3 text-primary hover:underline text-sm"
              >
                View all products
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {fallbackProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
