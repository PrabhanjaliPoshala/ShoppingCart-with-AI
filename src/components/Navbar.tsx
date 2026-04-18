import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ShoppingCart, User, Menu, X, Sparkles, Heart, BarChart3, Wand2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import SmartSearch from "@/components/SmartSearch";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onSearch?: (query: string) => void;
}

const Navbar = ({ onSearch }: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalItems } = useCart();
  const { user, signOut } = useAuth();
  const { wishlistIds } = useWishlist();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "relative text-nav text-sm font-medium px-3 py-2 rounded-md transition-all duration-200",
      "hover:text-nav-accent hover:bg-nav-foreground/5",
      isActive && "text-nav-accent bg-nav-foreground/5"
    );

  const aiPicksClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "relative flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-md transition-all duration-200",
      "bg-gradient-to-r from-nav-accent/20 to-primary/20 text-nav-accent",
      "hover:from-nav-accent/30 hover:to-primary/30 hover:shadow-[0_0_12px_hsl(var(--nav-accent)/0.4)]",
      isActive && "from-nav-accent/40 to-primary/40 shadow-[0_0_16px_hsl(var(--nav-accent)/0.5)]"
    );

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-nav transition-shadow duration-300",
        scrolled && "shadow-lg shadow-black/20"
      )}
    >
      <div className="px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 sm:gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <Sparkles className="h-6 w-6 text-nav-accent transition-transform group-hover:scale-110" />
            <span className="text-nav font-bold text-lg sm:text-xl whitespace-nowrap">
              AI <span className="text-nav-accent">SmartShop</span>
            </span>
          </Link>

          {/* Search — center, flexible */}
          <div className="flex-1 min-w-0 max-w-2xl hidden md:block">
            <SmartSearch onSearch={onSearch} />
          </div>

          {/* Right cluster — desktop */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3 shrink-0">
            <NavLink to="/recommendations" className={aiPicksClass}>
              <Sparkles className="h-4 w-4" />
              <span>AI Picks</span>
            </NavLink>
            <NavLink to="/custom-request" className={navLinkClass}>
              Custom Request
            </NavLink>
            <NavLink to="/admin" className={navLinkClass}>
              Analytics
            </NavLink>

            <div className="h-6 w-px bg-nav-foreground/20 mx-1" />

            {user ? (
              <button
                onClick={() => signOut()}
                className="text-nav text-sm font-medium px-3 py-2 rounded-md hover:text-nav-accent hover:bg-nav-foreground/5 transition-all"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 text-nav text-sm font-medium px-3 py-2 rounded-md hover:text-nav-accent hover:bg-nav-foreground/5 transition-all"
              >
                <User className="h-4 w-4" />
                Sign In
              </Link>
            )}

            <Link
              to="/wishlist"
              className="relative text-nav p-2 rounded-md hover:text-nav-accent hover:bg-nav-foreground/5 transition-all"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="relative flex items-center gap-1.5 text-nav text-sm font-medium px-3 py-2 rounded-md hover:text-nav-accent hover:bg-nav-foreground/5 transition-all"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden lg:inline">Cart</span>
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile right cluster */}
          <div className="flex md:hidden items-center gap-1 shrink-0">
            <Link
              to="/cart"
              className="relative text-nav p-2 rounded-md hover:text-nav-accent transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              className="text-nav p-2 rounded-md hover:bg-nav-foreground/10 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile search — always visible under top row on small screens */}
        <div className="md:hidden mt-3 max-w-7xl mx-auto">
          <SmartSearch onSearch={onSearch} />
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-nav border-t border-nav-foreground/10 px-4 py-3 space-y-1 animate-fade-in">
          <NavLink
            to="/recommendations"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 text-sm font-semibold py-2.5 px-3 rounded-md transition-all",
                "bg-gradient-to-r from-nav-accent/20 to-primary/20 text-nav-accent",
                isActive && "from-nav-accent/40 to-primary/40"
              )
            }
          >
            <Sparkles className="h-4 w-4" /> AI Picks
          </NavLink>
          <NavLink
            to="/custom-request"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 text-nav text-sm py-2.5 px-3 rounded-md hover:bg-nav-foreground/10 hover:text-nav-accent transition-all",
                isActive && "bg-nav-foreground/10 text-nav-accent"
              )
            }
          >
            <Wand2 className="h-4 w-4" /> Custom Request
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 text-nav text-sm py-2.5 px-3 rounded-md hover:bg-nav-foreground/10 hover:text-nav-accent transition-all",
                isActive && "bg-nav-foreground/10 text-nav-accent"
              )
            }
          >
            <BarChart3 className="h-4 w-4" /> Analytics
          </NavLink>
          <NavLink
            to="/orders"
            className={({ isActive }) =>
              cn(
                "block text-nav text-sm py-2.5 px-3 rounded-md hover:bg-nav-foreground/10 hover:text-nav-accent transition-all",
                isActive && "bg-nav-foreground/10 text-nav-accent"
              )
            }
          >
            My Orders
          </NavLink>
          <NavLink
            to="/wishlist"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 text-nav text-sm py-2.5 px-3 rounded-md hover:bg-nav-foreground/10 hover:text-nav-accent transition-all",
                isActive && "bg-nav-foreground/10 text-nav-accent"
              )
            }
          >
            <Heart className="h-4 w-4" /> Wishlist
            {wishlistIds.length > 0 && (
              <span className="ml-auto bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center">
                {wishlistIds.length}
              </span>
            )}
          </NavLink>

          <div className="h-px bg-nav-foreground/10 my-2" />

          {user ? (
            <button
              onClick={() => { signOut(); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 w-full text-left text-nav text-sm py-2.5 px-3 rounded-md hover:bg-nav-foreground/10 hover:text-nav-accent transition-all"
            >
              <User className="h-4 w-4" /> Sign Out
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 text-nav text-sm py-2.5 px-3 rounded-md hover:bg-nav-foreground/10 hover:text-nav-accent transition-all"
            >
              <User className="h-4 w-4" /> Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
