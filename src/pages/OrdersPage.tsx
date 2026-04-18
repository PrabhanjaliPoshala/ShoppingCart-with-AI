import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Clock, CheckCircle, Truck, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { icon: any; color: string }> = {
  Processing: { icon: Clock, color: "bg-yellow-100 text-yellow-800" },
  Shipped: { icon: Truck, color: "bg-blue-100 text-blue-800" },
  Delivered: { icon: CheckCircle, color: "bg-green-100 text-green-800" },
};

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders(data || []);
        setLoading(false);
      });
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center"><div className="text-center"><p className="mb-4">Please sign in to view orders.</p><Button asChild><Link to="/login">Sign In</Link></Button></div></main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><Package className="h-6 w-6 text-primary" /> My Orders</h1>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-4">Start shopping to see your orders here.</p>
            <Button asChild><Link to="/">Browse Products</Link></Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, idx) => {
              const items = order.items as any[];
              const sc = statusConfig[order.status] || statusConfig.Processing;
              const StatusIcon = sc.icon;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-card rounded-lg p-5 shadow-card"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div>
                      <p className="font-mono text-sm font-bold">{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                    <Badge className={`${sc.color} gap-1`}><StatusIcon className="h-3 w-3" />{order.status}</Badge>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {items.map((item: any) => (
                      <div key={item.id} className="shrink-0 flex items-center gap-2 bg-muted rounded-lg p-2 pr-4">
                        <img src={item.image} alt={item.title} className="w-10 h-10 rounded object-cover" />
                        <div>
                          <p className="text-xs font-medium line-clamp-1 max-w-[120px]">{item.title}</p>
                          <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <span className="text-sm text-muted-foreground capitalize">{order.payment_method === "cod" ? "Cash on Delivery" : order.payment_method.toUpperCase()}</span>
                    <span className="font-bold text-price">₹{parseFloat(order.total_amount).toFixed(0)}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default OrdersPage;
