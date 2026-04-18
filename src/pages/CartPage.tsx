import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-4">Discover amazing products and add them to your cart.</p>
            <Button asChild>
              <Link to="/">Continue Shopping</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="h-4 w-4" /> Continue Shopping
        </Link>
        <h1 className="text-2xl font-bold mb-6">Shopping Cart ({items.length} items)</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="bg-card rounded-lg p-4 shadow-card flex gap-4">
                <Link to={`/product/${product.id}`}>
                  <img src={product.image} alt={product.title} className="w-20 h-20 object-cover rounded" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${product.id}`} className="font-medium text-card-foreground hover:text-primary line-clamp-1">
                    {product.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                  <p className="text-lg font-bold text-price mt-1">${product.price.toFixed(2)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => removeFromCart(product.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="flex items-center border rounded">
                    <button onClick={() => updateQuantity(product.id, quantity - 1)} className="px-2 py-1 hover:bg-muted">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="px-3 text-sm font-medium">{quantity}</span>
                    <button onClick={() => updateQuantity(product.id, quantity + 1)} className="px-2 py-1 hover:bg-muted">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-card rounded-lg p-6 shadow-card h-fit sticky top-20">
            <h3 className="font-bold text-lg mb-4">Order Summary</h3>
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-deal font-medium">{totalPrice >= 50 ? "Free" : "$5.99"}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-price">${(totalPrice + (totalPrice >= 50 ? 0 : 5.99)).toFixed(2)}</span>
              </div>
            </div>
            <Button className="w-full mb-2" size="lg" asChild>
              <Link to="/checkout">Proceed to Checkout</Link>
            </Button>
            <Button variant="outline" size="sm" className="w-full" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;
