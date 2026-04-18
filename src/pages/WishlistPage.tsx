import { Heart, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "@/components/ui/button";

const WishlistPage = () => {
  const { wishlistIds, clearWishlist } = useWishlist();
  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-destructive fill-destructive" />
            <h1 className="text-2xl font-bold">My Wishlist</h1>
            <span className="text-sm text-muted-foreground">({wishlistProducts.length} items)</span>
          </div>
          {wishlistProducts.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearWishlist}>
              Clear All
            </Button>
          )}
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg text-muted-foreground mb-2">Your wishlist is empty</p>
            <p className="text-sm text-muted-foreground mb-6">Start adding items you love!</p>
            <Button asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" /> Browse Products
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {wishlistProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default WishlistPage;
