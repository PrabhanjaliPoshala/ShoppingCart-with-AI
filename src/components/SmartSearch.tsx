import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Mic, MicOff, Clock, TrendingUp, Sparkles, X, Tag, Package } from "lucide-react";
import { products, categories } from "@/data/products";
import { useBehavior } from "@/context/BehaviorContext";

interface Suggestion {
  type: "product" | "category" | "keyword" | "recent" | "trending" | "ai";
  label: string;
  sublabel?: string;
  image?: string;
  productId?: string;
  category?: string;
}

interface SmartSearchProps {
  onSearch?: (query: string) => void;
}

const RECENT_KEY = "smartshop_recent_searches";

const getRecent = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveRecent = (q: string) => {
  if (!q.trim()) return;
  const recent = getRecent().filter((r) => r.toLowerCase() !== q.toLowerCase());
  recent.unshift(q);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 6)));
};

// Trending searches (could be derived from analytics; static fallback)
const TRENDING_SEARCHES = [
  "wireless headphones",
  "running shoes",
  "leather bag",
  "smart watch",
  "summer fashion",
];

// Highlight matched substring
const Highlight = ({ text, query }: { text: string; query: string }) => {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/20 text-foreground font-semibold px-0.5 rounded">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
};

const SmartSearch = ({ onSearch }: SmartSearchProps) => {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [listening, setListening] = useState(false);
  const [recent, setRecent] = useState<string[]>(getRecent());
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { trackSearch, searchHistory, clickedCategories } = useBehavior();

  // Debounce input
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Top category from behavior for AI personalization
  const topCategory = useMemo(() => {
    const freq: Record<string, number> = {};
    clickedCategories.forEach((c) => (freq[c] = (freq[c] || 0) + 1));
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  }, [clickedCategories]);

  // AI-style smart suggestions based on behavior
  const aiSuggestions = useMemo(() => {
    const suggestions: string[] = [];
    if (topCategory) {
      suggestions.push(`Best ${topCategory.toLowerCase()} under ₹3000`);
      suggestions.push(`Trending ${topCategory.toLowerCase()}`);
    } else {
      suggestions.push("Best deals today");
      suggestions.push("Trending electronics");
    }
    return suggestions;
  }, [topCategory]);

  // Build suggestions list
  const suggestions = useMemo<Suggestion[]>(() => {
    const q = debounced.trim().toLowerCase();

    // Empty state: recent + trending + AI
    if (!q) {
      const list: Suggestion[] = [];
      recent.slice(0, 4).forEach((r) =>
        list.push({ type: "recent", label: r })
      );
      aiSuggestions.forEach((s) =>
        list.push({ type: "ai", label: s, sublabel: "AI suggestion" })
      );
      TRENDING_SEARCHES.slice(0, 4).forEach((t) =>
        list.push({ type: "trending", label: t })
      );
      return list.slice(0, 10);
    }

    const list: Suggestion[] = [];

    // Matching categories
    categories
      .filter((c) => c !== "All" && c.toLowerCase().includes(q))
      .slice(0, 2)
      .forEach((c) =>
        list.push({ type: "category", label: c, sublabel: "Category", category: c })
      );

    // Matching products
    const productMatches = products
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 6);
    productMatches.forEach((p) =>
      list.push({
        type: "product",
        label: p.title,
        sublabel: `${p.category} • ₹${p.price}`,
        image: p.image,
        productId: p.id,
      })
    );

    // Keyword tags (deduped)
    const tagSet = new Set<string>();
    products.forEach((p) =>
      p.tags.forEach((t) => {
        if (t.toLowerCase().includes(q)) tagSet.add(t);
      })
    );
    Array.from(tagSet)
      .slice(0, 3)
      .forEach((t) =>
        list.push({ type: "keyword", label: t, sublabel: "Keyword" })
      );

    return list.slice(0, 10);
  }, [debounced, recent, aiSuggestions]);

  // Reset active index when suggestions change
  useEffect(() => {
    setActiveIdx(-1);
  }, [suggestions]);

  const submitQuery = useCallback(
    (q: string) => {
      const text = q.trim();
      if (!text) return;
      saveRecent(text);
      setRecent(getRecent());
      trackSearch(text);
      onSearch?.(text);
      setOpen(false);
      setQuery(text);
      navigate(`/?search=${encodeURIComponent(text)}`);
      console.log("[SmartSearch] submit:", text);
    },
    [navigate, onSearch, trackSearch]
  );

  const handleSelect = useCallback(
    (s: Suggestion) => {
      console.log("[SmartSearch] selected:", s);
      if (s.type === "product" && s.productId) {
        saveRecent(s.label);
        setRecent(getRecent());
        setOpen(false);
        navigate(`/product/${s.productId}`);
        return;
      }
      if (s.type === "category" && s.category) {
        setOpen(false);
        setQuery("");
        navigate(`/?category=${encodeURIComponent(s.category)}`);
        return;
      }
      submitQuery(s.label);
    },
    [navigate, submitQuery]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && suggestions[activeIdx]) {
        handleSelect(suggestions[activeIdx]);
      } else {
        submitQuery(query);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const startVoiceSearch = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      console.warn("[SmartSearch] Voice recognition unavailable");
      return;
    }
    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      submitQuery(transcript);
    };
    recognition.start();
  };

  const clearRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.removeItem(RECENT_KEY);
    setRecent([]);
  };

  const iconFor = (s: Suggestion) => {
    switch (s.type) {
      case "recent":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case "trending":
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case "ai":
        return <Sparkles className="h-4 w-4 text-primary" />;
      case "category":
        return <Tag className="h-4 w-4 text-muted-foreground" />;
      case "keyword":
        return <Search className="h-4 w-4 text-muted-foreground" />;
      case "product":
        return <Package className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const showExplain = !debounced && (topCategory || searchHistory[0]);

  return (
    <div ref={wrapRef} className="flex-1 max-w-2xl relative">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitQuery(query);
        }}
      >
        <div className="flex rounded-md overflow-hidden">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search products, brands, categories..."
            className="flex-1 px-4 py-2 text-sm text-foreground bg-card outline-none min-w-0"
            aria-autocomplete="list"
            aria-expanded={open}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="px-2 bg-card hover:bg-accent transition-colors"
              title="Clear"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          <button
            type="button"
            onClick={startVoiceSearch}
            className="px-2 bg-card border-l hover:bg-accent transition-colors"
            title="Voice search"
          >
            {listening ? (
              <MicOff className="h-4 w-4 text-destructive animate-pulse" />
            ) : (
              <Mic className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          <button type="submit" className="px-4 bg-primary hover:bg-primary/90 transition-colors">
            <Search className="h-4 w-4 text-primary-foreground" />
          </button>
        </div>
      </form>

      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 overflow-hidden animate-fade-in">
          {showExplain && (
            <div className="px-3 py-2 text-xs text-muted-foreground bg-muted/50 border-b border-border flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-primary" />
              {topCategory
                ? `Suggestions based on your interest in ${topCategory}`
                : `Based on your search for "${searchHistory[0]}"`}
            </div>
          )}

          {!debounced && recent.length > 0 && (
            <div className="px-3 py-1.5 flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-foreground border-b border-border">
              <span>Recent</span>
              <button
                onClick={clearRecent}
                className="text-primary hover:underline normal-case tracking-normal"
              >
                Clear
              </button>
            </div>
          )}

          <ul role="listbox" className="max-h-96 overflow-y-auto">
            {suggestions.map((s, i) => (
              <li
                key={`${s.type}-${s.label}-${i}`}
                role="option"
                aria-selected={i === activeIdx}
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => handleSelect(s)}
                className={`flex items-center gap-3 px-3 py-2 cursor-pointer text-sm transition-colors ${
                  i === activeIdx ? "bg-accent" : "hover:bg-accent/50"
                }`}
              >
                {s.image ? (
                  <img
                    src={s.image}
                    alt=""
                    className="h-9 w-9 rounded object-cover bg-muted shrink-0"
                  />
                ) : (
                  <div className="h-9 w-9 rounded bg-muted flex items-center justify-center shrink-0">
                    {iconFor(s)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="truncate text-foreground">
                    <Highlight text={s.label} query={debounced} />
                  </div>
                  {s.sublabel && (
                    <div className="text-xs text-muted-foreground truncate">
                      {s.sublabel}
                    </div>
                  )}
                </div>
                {s.type === "ai" && (
                  <span className="text-[10px] uppercase tracking-wide text-primary font-semibold shrink-0">
                    AI
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SmartSearch;
