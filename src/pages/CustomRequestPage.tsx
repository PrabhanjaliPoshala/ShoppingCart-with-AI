import { useState } from "react";
import { Sparkles, Send, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";

const CustomRequestPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ available: boolean; matches: typeof products; explanation: string } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const analyzeRequest = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setResult(null);
    setSubmitted(false);

    try {
      const { data, error } = await supabase.functions.invoke("ai-custom-request", {
        body: { description, productCatalog: products },
      });
      if (error) throw error;

      const matchedProducts = (data.matchedIds || []).map((id: string) => products.find(p => p.id === id)).filter(Boolean);
      setResult({
        available: matchedProducts.length > 0,
        matches: matchedProducts,
        explanation: data.explanation || "",
      });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const submitRequest = async () => {
    if (!user) {
      toast({ title: "Sign in required", variant: "destructive" });
      return;
    }
    await supabase.from("custom_product_requests").insert([{
      user_id: user.id,
      description,
      ai_analysis: result as any,
      status: "pending",
    }]);
    setSubmitted(true);
    toast({ title: "Request submitted!", description: "We'll look into manufacturing this for you." });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <div className="text-center mb-8">
          <Sparkles className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="text-2xl font-bold">Can't Find What You Want?</h1>
          <p className="text-muted-foreground mt-1">Describe your ideal product and our AI will search — or you can request manufacturing!</p>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-card mb-6">
          <Textarea
            placeholder="e.g. A navy blue leather laptop bag with multiple compartments under ₹2000..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            className="mb-4"
          />
          <Button onClick={analyzeRequest} disabled={loading || !description.trim()} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Analyze with AI
          </Button>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-card rounded-lg p-6 shadow-card">
                <p className="text-sm leading-relaxed">{result.explanation}</p>
              </div>

              {result.matches.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-3">🎯 Closest Matches</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {result.matches.map(p => <ProductCard key={p.id} product={p} />)}
                  </div>
                </div>
              )}

              {!result.available && !submitted && (
                <div className="bg-accent rounded-lg p-6 text-center">
                  <p className="font-medium mb-3">This product isn't available yet. Want us to consider manufacturing it?</p>
                  <Button onClick={submitRequest}>
                    <Send className="h-4 w-4 mr-2" /> Request Manufacturing
                  </Button>
                </div>
              )}

              {submitted && (
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-accent rounded-lg p-6 text-center">
                  <CheckCircle2 className="h-10 w-10 text-deal mx-auto mb-2" />
                  <p className="font-bold">Request Submitted!</p>
                  <p className="text-sm text-muted-foreground">We'll notify you when this product becomes available.</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};

export default CustomRequestPage;
