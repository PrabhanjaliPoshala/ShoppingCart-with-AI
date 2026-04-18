import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface BehaviorState {
  searchHistory: string[];
  clickedProductIds: string[];
  clickedCategories: string[];
}

interface BehaviorContextType extends BehaviorState {
  trackSearch: (query: string) => void;
  trackProductClick: (productId: string, category: string) => void;
  getExplanation: (productCategory: string, sectionType: "trending" | "recommended" | "deal" | "upsell") => string;
  getBehaviorSummary: () => string;
}

const BehaviorContext = createContext<BehaviorContextType | null>(null);

export const useBehavior = () => {
  const ctx = useContext(BehaviorContext);
  if (!ctx) throw new Error("useBehavior must be used within BehaviorProvider");
  return ctx;
};

export const BehaviorProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<BehaviorState>(() => {
    try {
      const saved = localStorage.getItem("smartshop_behavior");
      if (saved) return JSON.parse(saved);
    } catch {}
    return { searchHistory: [], clickedProductIds: [], clickedCategories: [] };
  });

  const persist = (next: BehaviorState) => {
    setState(next);
    localStorage.setItem("smartshop_behavior", JSON.stringify(next));
  };

  const trackSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    setState((prev) => {
      const next = {
        ...prev,
        searchHistory: [query, ...prev.searchHistory.filter((s) => s !== query)].slice(0, 20),
      };
      localStorage.setItem("smartshop_behavior", JSON.stringify(next));
      return next;
    });
  }, []);

  const trackProductClick = useCallback((productId: string, category: string) => {
    setState((prev) => {
      const next = {
        ...prev,
        clickedProductIds: [productId, ...prev.clickedProductIds.filter((id) => id !== productId)].slice(0, 30),
        clickedCategories: [category, ...prev.clickedCategories.filter((c) => c !== category)].slice(0, 30),
      };
      localStorage.setItem("smartshop_behavior", JSON.stringify(next));
      return next;
    });
  }, []);

  const getTopCategory = () => {
    const freq: Record<string, number> = {};
    state.clickedCategories.forEach((c) => (freq[c] = (freq[c] || 0) + 1));
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || null;
  };

  const getExplanation = useCallback(
    (productCategory: string, sectionType: "trending" | "recommended" | "deal" | "upsell") => {
      const topCat = getTopCategory();
      const recentSearch = state.searchHistory[0];

      switch (sectionType) {
        case "trending":
          if (recentSearch)
            return `Trending in your area • You recently searched for "${recentSearch}"`;
          return "Trending among shoppers like you";
        case "recommended":
          if (topCat && topCat === productCategory)
            return `Recommended because you browse ${topCat} often`;
          if (recentSearch)
            return `Recommended based on your search for "${recentSearch}"`;
          return "Recommended based on top ratings and popularity";
        case "deal":
          if (topCat)
            return `Great deal on ${productCategory} • You've shown interest in ${topCat}`;
          return "Top deal based on price drop and demand";
        case "upsell":
          return "Frequently bought together based on similar users' purchases";
        default:
          return "";
      }
    },
    [state]
  );

  const getBehaviorSummary = useCallback(() => {
    const parts: string[] = [];
    const topCat = getTopCategory();
    if (topCat) parts.push(`frequently browses ${topCat}`);
    if (state.searchHistory.length > 0)
      parts.push(`recent searches: ${state.searchHistory.slice(0, 3).join(", ")}`);
    if (state.clickedProductIds.length > 0)
      parts.push(`viewed ${state.clickedProductIds.length} products`);
    return parts.length > 0 ? `User behavior: ${parts.join("; ")}` : "";
  }, [state]);

  return (
    <BehaviorContext.Provider
      value={{ ...state, trackSearch, trackProductClick, getExplanation, getBehaviorSummary }}
    >
      {children}
    </BehaviorContext.Provider>
  );
};
