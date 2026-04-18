import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Package, CalendarDays, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const OrderSuccessPage = () => {
  const [params] = useSearchParams();
  const orderNumber = params.get("order") || "N/A";
  const total = params.get("total") || "0";
  const estimatedDate = new Date(Date.now() + 5 * 86400000).toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-card rounded-2xl p-8 shadow-card-hover text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <CheckCircle2 className="h-20 w-20 mx-auto mb-4" style={{ color: "hsl(var(--deal))" }} />
          </motion.div>

          <h1 className="text-2xl font-bold mb-1">Order Confirmed! 🎉</h1>
          <p className="text-muted-foreground mb-6">Thank you for shopping with AI SmartShop</p>

          <div className="bg-muted rounded-lg p-4 space-y-3 text-left mb-6">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Order Number</p>
                <p className="font-mono font-bold">{orderNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Estimated Delivery</p>
                <p className="font-medium">{estimatedDate}</p>
              </div>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Total Paid</span>
              <span className="text-price">₹{parseFloat(total).toFixed(0)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link to="/orders">View My Orders <ArrowRight className="h-4 w-4 ml-1" /></Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to="/">Continue Shopping</Link>
            </Button>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderSuccessPage;
