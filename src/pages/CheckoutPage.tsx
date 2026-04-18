import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Truck, Smartphone, CheckCircle2, Loader2, ArrowLeft, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import ExplainBadge from "@/components/ExplainBadge";

interface AddressForm {
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  pincode: string;
}

const emptyAddress: AddressForm = { full_name: "", phone: "", address_line: "", city: "", pincode: "" };

const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [address, setAddress] = useState<AddressForm>(emptyAddress);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [cardNumber, setCardNumber] = useState("");
  const [upiId, setUpiId] = useState("");
  const [placing, setPlacing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const deliveryFee = totalPrice >= 999 ? 0 : 49;
  const finalTotal = totalPrice + deliveryFee;

  // Upsell: suggest products not in cart from related categories
  const cartCategories = [...new Set(items.map(i => i.product.category))];
  const upsellProducts = products
    .filter(p => cartCategories.includes(p.category) && !items.find(i => i.product.id === p.id))
    .slice(0, 3);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setSavedAddresses(data);
          const def = data.find((a: any) => a.is_default) || data[0];
          setSelectedAddressId(def.id);
          setAddress({
            full_name: def.full_name,
            phone: def.phone,
            address_line: def.address_line,
            city: def.city,
            pincode: def.pincode,
          });
        }
      });
  }, [user]);

  const handleAddressSelect = (id: string) => {
    if (id === "new") {
      setSelectedAddressId(null);
      setAddress(emptyAddress);
      return;
    }
    const a = savedAddresses.find((a: any) => a.id === id);
    if (a) {
      setSelectedAddressId(a.id);
      setAddress({ full_name: a.full_name, phone: a.phone, address_line: a.address_line, city: a.city, pincode: a.pincode });
    }
  };

  const validate = () => {
    if (!address.full_name || !address.phone || !address.address_line || !address.city || !address.pincode) {
      toast({ title: "Missing address", description: "Please fill all address fields.", variant: "destructive" });
      return false;
    }
    if (!/^\d{10}$/.test(address.phone)) {
      toast({ title: "Invalid phone", description: "Enter a valid 10-digit phone number.", variant: "destructive" });
      return false;
    }
    if (!/^\d{6}$/.test(address.pincode)) {
      toast({ title: "Invalid pincode", description: "Enter a valid 6-digit pincode.", variant: "destructive" });
      return false;
    }
    if (paymentMethod === "card" && cardNumber.replace(/\s/g, "").length < 16) {
      toast({ title: "Invalid card", description: "Enter a valid 16-digit card number.", variant: "destructive" });
      return false;
    }
    if (paymentMethod === "upi" && !upiId.includes("@")) {
      toast({ title: "Invalid UPI", description: "Enter a valid UPI ID (e.g. name@upi).", variant: "destructive" });
      return false;
    }
    return true;
  };

  const placeOrder = async () => {
    if (!user) {
      toast({ title: "Please sign in", description: "You need to be signed in to place an order.", variant: "destructive" });
      navigate("/login");
      return;
    }
    if (!validate()) return;
    setPlacing(true);

    try {
      // Save address if new
      if (!selectedAddressId) {
        await supabase.from("addresses").insert([{
          user_id: user.id,
          ...address,
          is_default: savedAddresses.length === 0,
        }]);
      }

      const orderNumber = `AS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const orderItems = items.map(i => ({
        id: i.product.id,
        title: i.product.title,
        price: i.product.price,
        quantity: i.quantity,
        image: i.product.image,
      }));

      const { error } = await supabase.from("orders").insert([{
        user_id: user.id,
        order_number: orderNumber,
        items: orderItems as any,
        total_amount: finalTotal,
        delivery_fee: deliveryFee,
        address: address as any,
        payment_method: paymentMethod,
        status: "Processing",
      }]);

      if (error) throw error;

      // Simulate payment delay
      await new Promise(r => setTimeout(r, 1500));
      setShowSuccess(true);
      await new Promise(r => setTimeout(r, 2000));

      clearCart();
      navigate(`/order-success?order=${orderNumber}&total=${finalTotal}`);
    } catch (e: any) {
      toast({ title: "Order failed", description: e.message, variant: "destructive" });
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0 && !placing) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <Button onClick={() => navigate("/")}>Continue Shopping</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Payment processing overlay */}
      <AnimatePresence>
        {(placing || showSuccess) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-card rounded-2xl p-10 text-center shadow-2xl"
            >
              {showSuccess ? (
                <>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                    <CheckCircle2 className="h-20 w-20 text-deal mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-1">Order Placed! 🎉</h3>
                  <p className="text-muted-foreground">Redirecting...</p>
                </>
              ) : (
                <>
                  <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
                  <h3 className="text-xl font-bold mb-1">Processing Payment...</h3>
                  <p className="text-muted-foreground text-sm">Please wait while we confirm your order</p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <button onClick={() => navigate("/cart")} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Cart
        </button>
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Address + Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Address */}
            <div className="bg-card rounded-lg p-6 shadow-card">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Truck className="h-5 w-5 text-primary" /> Delivery Address</h2>
              {savedAddresses.length > 0 && (
                <div className="mb-4">
                  <Label className="text-sm text-muted-foreground mb-2 block">Saved Addresses</Label>
                  <div className="space-y-2">
                    {savedAddresses.map((a: any) => (
                      <label key={a.id} className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${selectedAddressId === a.id ? "border-primary bg-accent" : "hover:bg-muted"}`}>
                        <input type="radio" name="address" checked={selectedAddressId === a.id} onChange={() => handleAddressSelect(a.id)} className="mt-1" />
                        <div>
                          <p className="font-medium">{a.full_name}</p>
                          <p className="text-sm text-muted-foreground">{a.address_line}, {a.city} - {a.pincode}</p>
                          <p className="text-sm text-muted-foreground">{a.phone}</p>
                        </div>
                      </label>
                    ))}
                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${selectedAddressId === null ? "border-primary bg-accent" : "hover:bg-muted"}`}>
                      <input type="radio" name="address" checked={selectedAddressId === null} onChange={() => handleAddressSelect("new")} />
                      <span className="text-sm font-medium">+ Add New Address</span>
                    </label>
                  </div>
                </div>
              )}

              {(selectedAddressId === null || savedAddresses.length === 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={address.full_name} onChange={e => setAddress(p => ({ ...p, full_name: e.target.value }))} placeholder="John Doe" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" value={address.phone} onChange={e => setAddress(p => ({ ...p, phone: e.target.value }))} placeholder="9876543210" maxLength={10} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="addr">Address</Label>
                    <Input id="addr" value={address.address_line} onChange={e => setAddress(p => ({ ...p, address_line: e.target.value }))} placeholder="123, MG Road, Sector 5" />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={address.city} onChange={e => setAddress(p => ({ ...p, city: e.target.value }))} placeholder="Mumbai" />
                  </div>
                  <div>
                    <Label htmlFor="pin">Pincode</Label>
                    <Input id="pin" value={address.pincode} onChange={e => setAddress(p => ({ ...p, pincode: e.target.value }))} placeholder="400001" maxLength={6} />
                  </div>
                </div>
              )}
            </div>

            {/* Payment */}
            <div className="bg-card rounded-lg p-6 shadow-card">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Payment Method</h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === "cod" ? "border-primary bg-accent" : "hover:bg-muted"}`}>
                  <RadioGroupItem value="cod" id="cod" />
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-xs text-muted-foreground">Pay when you receive your order</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === "upi" ? "border-primary bg-accent" : "hover:bg-muted"}`}>
                  <RadioGroupItem value="upi" id="upi" />
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">UPI</p>
                    <p className="text-xs text-muted-foreground">Pay using Google Pay, PhonePe, etc.</p>
                    {paymentMethod === "upi" && (
                      <Input className="mt-2" placeholder="yourname@upi" value={upiId} onChange={e => setUpiId(e.target.value)} />
                    )}
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === "card" ? "border-primary bg-accent" : "hover:bg-muted"}`}>
                  <RadioGroupItem value="card" id="card" />
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">Credit / Debit Card</p>
                    <p className="text-xs text-muted-foreground">Visa, Mastercard, RuPay</p>
                    {paymentMethod === "card" && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <Input className="col-span-2" placeholder="Card Number" value={cardNumber} onChange={e => setCardNumber(e.target.value)} maxLength={19} />
                        <Input placeholder="MM/YY" maxLength={5} />
                        <Input placeholder="CVV" maxLength={3} type="password" />
                      </div>
                    )}
                  </div>
                </label>
              </RadioGroup>
            </div>

            {/* Upsell */}
            {upsellProducts.length > 0 && (
              <div className="bg-card rounded-lg p-6 shadow-card">
                <h2 className="font-bold text-lg mb-2">🔥 Frequently Bought Together</h2>
                <ExplainBadge text="Frequently bought together based on similar users' purchases" className="mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {upsellProducts.map(p => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="bg-card rounded-lg p-6 shadow-card h-fit sticky top-20">
            <h3 className="font-bold text-lg mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-3">
                  <img src={product.image} alt={product.title} className="w-12 h-12 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{product.title}</p>
                    <p className="text-xs text-muted-foreground">Qty: {quantity}</p>
                  </div>
                  <span className="text-sm font-medium">₹{(product.price * quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{totalPrice.toFixed(0)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className={deliveryFee === 0 ? "text-deal font-medium" : ""}>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span></div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-price">₹{finalTotal.toFixed(0)}</span>
              </div>
            </div>
            <Button className="w-full mt-4" size="lg" onClick={placeOrder} disabled={placing}>
              {placing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Place Order
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">🔒 Your payment information is secure</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
