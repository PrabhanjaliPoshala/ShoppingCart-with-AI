import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, ShoppingCart, Users, Zap, Target, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { products } from "@/data/products";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const COLORS = ["hsl(33,100%,50%)", "hsl(210,80%,55%)", "hsl(120,60%,40%)", "hsl(0,70%,55%)", "hsl(270,60%,55%)", "hsl(180,60%,40%)"];

const AdminPage = () => {
  const { user } = useAuth();
  const [orderCount, setOrderCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [requestCount, setRequestCount] = useState(0);

  const categoryData = [...new Set(products.map(p => p.category))].map(cat => ({
    name: cat,
    products: products.filter(p => p.category === cat).length,
    avgRating: +(products.filter(p => p.category === cat).reduce((s, p) => s + p.rating, 0) / products.filter(p => p.category === cat).length).toFixed(1),
  }));

  const topProducts = [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 5).map(p => ({ name: p.title.substring(0, 15), views: p.reviews * 12 }));

  useEffect(() => {
    if (!user) return;
    supabase.from("orders").select("total_amount", { count: "exact" }).eq("user_id", user.id).then(({ data, count }) => {
      setOrderCount(count || 0);
      setTotalRevenue((data || []).reduce((s: number, o: any) => s + parseFloat(o.total_amount), 0));
    });
    supabase.from("custom_product_requests").select("id", { count: "exact" }).then(({ count }) => setRequestCount(count || 0));
  }, [user]);

  const metrics = [
    { icon: ShoppingCart, label: "Total Orders", value: orderCount, color: "text-primary" },
    { icon: TrendingUp, label: "Revenue", value: `₹${totalRevenue.toFixed(0)}`, color: "text-deal" },
    { icon: Users, label: "Products", value: products.length, color: "text-blue-500" },
    { icon: Target, label: "Custom Requests", value: requestCount, color: "text-purple-500" },
  ];

  const impactMetrics = [
    { icon: Zap, label: "Faster Discovery", value: "+30%", desc: "AI recommendations reduce search time" },
    { icon: Target, label: "Personalization", value: "95%", desc: "Accuracy in preference matching" },
    { icon: Clock, label: "Avg. Session", value: "4.2min", desc: "Users spend more time exploring" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><BarChart3 className="h-6 w-6 text-primary" /> Analytics Dashboard</h1>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card rounded-lg p-5 shadow-card">
              <m.icon className={`h-6 w-6 ${m.color} mb-2`} />
              <p className="text-2xl font-bold">{m.value}</p>
              <p className="text-xs text-muted-foreground">{m.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Category Distribution */}
          <div className="bg-card rounded-lg p-6 shadow-card">
            <h3 className="font-bold mb-4">Category Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="products" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, products }) => `${name} (${products})`}>
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Most Viewed Products */}
          <div className="bg-card rounded-lg p-6 shadow-card">
            <h3 className="font-bold mb-4">Most Popular Products</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="views" fill="hsl(33,100%,50%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* AI Impact Metrics */}
        <div className="bg-card rounded-lg p-6 shadow-card mb-8">
          <h3 className="font-bold text-lg mb-4">🧠 AI Impact Metrics</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {impactMetrics.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.1 }} className="bg-muted rounded-lg p-4 text-center">
                <m.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-3xl font-bold text-primary">{m.value}</p>
                <p className="font-medium text-sm">{m.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{m.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPage;
