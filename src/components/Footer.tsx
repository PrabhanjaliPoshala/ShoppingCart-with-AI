import { Sparkles } from "lucide-react";

const Footer = () => (
  <footer className="bg-nav text-nav py-8 px-4 mt-12">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-nav-accent" />
          <span className="font-bold text-lg">AI SmartShop</span>
        </div>
        <p className="text-sm text-subnav">
          © 2026 AI SmartShop. AI-powered personalized shopping experience.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
