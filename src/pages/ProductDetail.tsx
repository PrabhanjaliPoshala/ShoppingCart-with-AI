import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, ShoppingCart, Truck, Shield, RotateCcw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const { addToCart } = useCart();
  const { toast } = useToast();

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Product not found</p>
            <Link to="/" className="text-primary hover:underline mt-2 inline-block">Back to shop</Link>
          </div>
        </div>
      </div>
    );
  }

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to products
        </Link>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Image */}
          <div className="bg-card rounded-lg overflow-hidden shadow-card">
            <img src={product.image} alt={product.title} className="w-full aspect-square object-cover" />
          </div>

          {/* Details */}
          <div>
            <p className="text-sm text-primary font-medium mb-1">{product.category}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">{product.title}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? "text-star fill-star" : "text-muted-foreground"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{product.rating} ({product.reviews.toLocaleString()} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-price">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
                  <span className="bg-deal/10 text-deal text-sm font-semibold px-2 py-0.5 rounded">Save {discount}%</span>
                </>
              )}
            </div>

            <p className="text-muted-foreground mb-6">{product.description}</p>

            <div className="flex gap-3 mb-6">
              <Button
                size="lg"
                className="flex-1 gap-2"
                onClick={() => { addToCart(product); toast({ title: "Added to cart", description: product.title }); }}
              >
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </Button>
            </div>

            <div className="space-y-3 border-t pt-4">
              {[
                { icon: Truck, text: "Free shipping on orders over $50" },
                { icon: Shield, text: "1-year warranty included" },
                { icon: RotateCcw, text: "30-day easy returns" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="h-4 w-4 text-deal" /> {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
