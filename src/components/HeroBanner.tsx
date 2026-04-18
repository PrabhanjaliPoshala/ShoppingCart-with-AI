import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroBanner = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBrowse = () => {
    if (location.pathname !== "/") {
      navigate("/");
      // Wait for navigation, then scroll
      setTimeout(() => {
        document.getElementById("product-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } else {
      document.getElementById("product-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="relative overflow-hidden bg-nav py-12 sm:py-20 px-4">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-nav/90 via-subnav/60 to-primary/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_60%)]" />

      <div className="relative max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-8">
        <div className="flex-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-nav-accent px-3 py-1 rounded-full text-sm mb-4">
            <Sparkles className="h-4 w-4" />
            AI-Powered Shopping
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-nav mb-4 leading-tight">
            Shop Smarter with
            <br />
            <span className="text-nav-accent">AI Recommendations</span>
          </h1>
          <p className="text-subnav text-base sm:text-lg mb-6 max-w-lg">
            Upload an image or tell us your style — our AI analyzes your preferences 
            and recommends products tailored just for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
            <Button asChild size="lg" className="gap-2">
              <Link to="/recommendations">
                <Sparkles className="h-4 w-4" />
                Try AI Recommendations
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 border-nav-foreground/30 text-nav hover:bg-nav-foreground/10 hover:text-nav"
              onClick={handleBrowse}
            >
              Browse Products <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 max-w-md">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg overflow-hidden shadow-lg transform rotate-2 hover:rotate-0 transition-transform duration-300">
              <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=250&h=250&fit=crop" alt="Shoes" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg transform -rotate-2 hover:rotate-0 transition-transform duration-300 mt-6">
              <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=250&h=250&fit=crop" alt="Watch" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg transform -rotate-1 hover:rotate-0 transition-transform duration-300">
              <img src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=250&h=250&fit=crop" alt="Bag" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg transform rotate-1 hover:rotate-0 transition-transform duration-300 mt-6">
              <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop" alt="Headphones" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
