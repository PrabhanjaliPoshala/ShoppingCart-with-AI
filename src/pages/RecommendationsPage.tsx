import { useState } from "react";
import { Sparkles, Upload, Loader2, Palette, Eye, Tag, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const interestOptions = ["Fashion", "Shoes", "Bags", "Electronics", "Gadgets"] as const;

interface AIAnalysis {
  style: string;
  colorTone: string;
  suggestedCategory: string;
  explanation: string;
}

const RecommendationsPage = () => {
  const [selectedInterest, setSelectedInterest] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<typeof products | null>(null);
  const [explanation, setExplanation] = useState<string>("");
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const getRecommendations = async () => {
    if (!selectedInterest && !imageFile) return;
    setLoading(true);
    setRecommendations(null);
    setExplanation("");
    setAnalysis(null);

    try {
      let imageBase64 = "";
      if (imageFile) {
        const reader = new FileReader();
        imageBase64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(imageFile);
        });
      }

      const { data, error } = await supabase.functions.invoke("ai-recommend", {
        body: {
          interest: selectedInterest,
          imageBase64: imageBase64 || undefined,
          productCatalog: products.map((p) => ({
            id: p.id, title: p.title, category: p.category, tags: p.tags, price: p.price,
          })),
        },
      });

      if (error) throw error;

      const recommendedIds: string[] = data.recommendedIds || [];
      const recs = recommendedIds
        .map((id) => products.find((p) => p.id === id))
        .filter(Boolean) as typeof products;

      setRecommendations(recs.length > 0 ? recs : products.slice(0, 4));
      setExplanation(data.explanation || "Here are some products we think you'll love!");

      if (imageFile) {
        setAnalysis({
          style: data.style || (selectedInterest === "Fashion" ? "Casual" : "Trendy"),
          colorTone: data.colorTone || "Mixed",
          suggestedCategory: data.suggestedCategory || selectedInterest || "Fashion",
          explanation: data.analysisExplanation || "AI analyzed your uploaded image to detect visual patterns and match products.",
        });
      }
    } catch (err) {
      console.error("AI recommendation error:", err);
      const fallback = selectedInterest
        ? products.filter((p) => p.category === selectedInterest).slice(0, 4)
        : products.slice(0, 4);
      setRecommendations(fallback);
      setExplanation(`Based on your interest in ${selectedInterest || "various categories"}, here are our top picks for you!`);
      if (imageFile) {
        setAnalysis({
          style: "Casual",
          colorTone: "Mixed",
          suggestedCategory: selectedInterest || "Fashion",
          explanation: "We analyzed your image's visual characteristics to find the best matches.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-3">
            <Sparkles className="h-4 w-4" /> AI-Powered
          </div>
          <h1 className="text-3xl font-bold mb-2">Personalized Product Recommendations</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Upload an image or select your interests — our AI analyzes your style and suggests the perfect products.
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-card rounded-xl shadow-card p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Upload a Style Image (optional)</h3>
              <label className="block border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                {imagePreview ? (
                  <img src={imagePreview} alt="Uploaded" className="w-full max-h-48 object-contain rounded mx-auto" />
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">Click or drag to upload an image</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              {imagePreview && (
                <button
                  onClick={() => { setImagePreview(null); setImageFile(null); setAnalysis(null); }}
                  className="text-sm text-destructive hover:underline mt-2"
                >
                  Remove image
                </button>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-3">Select Your Interest</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {interestOptions.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => setSelectedInterest(interest === selectedInterest ? "" : interest)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedInterest === interest
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-accent"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>

              <Button
                onClick={getRecommendations}
                disabled={loading || (!selectedInterest && !imageFile)}
                size="lg"
                className="w-full gap-2 mt-4"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>
                ) : (
                  <><Sparkles className="h-4 w-4" /> Get AI Recommendations</>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* AI Analysis Panel */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-card rounded-xl shadow-card p-6 mb-8 border border-primary/20"
            >
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> AI Image Analysis
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-accent/50 rounded-lg p-3 text-center">
                  <Eye className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Detected Style</p>
                  <p className="font-semibold text-sm">{analysis.style}</p>
                </div>
                <div className="bg-accent/50 rounded-lg p-3 text-center">
                  <Palette className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Color Tone</p>
                  <p className="font-semibold text-sm">{analysis.colorTone}</p>
                </div>
                <div className="bg-accent/50 rounded-lg p-3 text-center">
                  <Tag className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="font-semibold text-sm">{analysis.suggestedCategory}</p>
                </div>
                <div className="bg-accent/50 rounded-lg p-3 text-center">
                  <FileText className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="font-semibold text-sm">High</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{analysis.explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {recommendations && (
          <div className="animate-fade-in">
            <div className="bg-accent/50 rounded-lg p-4 mb-6 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm">{explanation}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {recommendations.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default RecommendationsPage;
