import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  ChevronRight, Grid2X2, Home, Menu,
  Search, ShoppingBag, User, UserPlus, X,
  LogOut, Package, ChevronDown,
} from "lucide-react";
import { toggleCart } from "../store/cartSlice";
import { logout } from "../store/authSlice";
import AnnouncementBar from "./AnnouncementBar";
import CartSidebar from "./CartSidebar";
import api from "../utils/api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const slugMap = {
  boys:   "/boys",
  girls:  "/girls",
  men:    "/men",
  women:  "/women",
  womens: "/women",
};

const getCategoryLink = (name) =>
  slugMap[name.toLowerCase()] || `/${name.toLowerCase()}`;

const navLinks = [
  { label: "Sale",        path: "/sale" },
  { label: "What's New", path: "/whats-new" },
  { label: "Girls",       path: "/girls" },
  { label: "Women",       path: "/women" },
];

/* ─────────────────────────────────────────
   HOOK  –  live data from API
───────────────────────────────────────── */
function useSearchData(query) {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    api.get("/categories")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        if (data.length > 0) {
          setCategories(data.map((cat) => ({ ...cat, link: getCategoryLink(cat.name) })));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    setLoading(true);
    const isSearch = query && query.trim().length > 0;
    const url = isSearch
      ? `${API_BASE}/products?search=${encodeURIComponent(query.trim())}&limit=4`
      : `${API_BASE}/products?limit=4`;

    debounceRef.current = setTimeout(() => {
      fetch(url)
        .then((r) => r.json())
        .then((data) => setProducts(Array.isArray(data) ? data.slice(0, 4) : []))
        .catch(() => setProducts([]))
        .finally(() => setLoading(false));
    }, isSearch ? 300 : 0);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return { products, categories, loading };
}

/* ─────────────────────────────────────────
   SEARCH DROPDOWN  –  desktop
───────────────────────────────────────── */
function SearchDropdown({ query, onCategoryClick, onProductClick }) {
  const { products, categories, loading } = useSearchData(query);

  return (
    <div className="absolute top-[calc(100%+1px)] right-0 w-[700px] bg-white border border-gray-200 shadow-2xl z-[100] px-6 py-5">
      {categories.length > 0 && (
        <>
          <p className="text-[11px] font-black uppercase tracking-widest text-gray-800 mb-2">Browse Categories</p>
          <hr className="border-gray-200 mb-3" />
          <div className="flex flex-wrap gap-2 mb-5">
            {categories.slice(0, 7).map((cat) => (
              <button key={cat._id} onMouseDown={() => onCategoryClick(cat.link)}
                className="flex items-center gap-1.5 border border-gray-300 px-3 py-1.5 text-[12px] text-gray-700 hover:border-gray-500 hover:bg-gray-50 transition-colors">
                <Search size={11} className="text-gray-400" />{cat.name}
              </button>
            ))}
          </div>
        </>
      )}
      <p className="text-[11px] font-black uppercase tracking-widest text-gray-800 mb-2">
        {query?.trim() ? "Search Results" : "Popular Products"}
      </p>
      <hr className="border-gray-200 mb-4" />
      {loading ? (
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="animate-pulse"><div className="bg-gray-200 aspect-square mb-2" /><div className="h-3 bg-gray-200 rounded w-3/4" /></div>)}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-4 gap-4">
          {products.map((p) => (
            <button key={p._id} onMouseDown={() => onProductClick(p.slug)} className="text-left group">
            <div className="relative overflow-hidden bg-gray-100 aspect-square mb-2">
  {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />}
  {p.salePrice && <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-semibold px-2 py-0.5">Sale</span>}
  {p.stockStatus === "out_of_stock" && <span className="absolute top-2 right-2 bg-white text-[10px] font-semibold px-2 py-0.5 text-gray-700">Sold Out</span>}
</div>
              <p className="text-[12px] text-gray-800 font-medium leading-tight">{p.name}</p>
            {p.isSale && p.salePrice
  ? (
    <div className="flex items-baseline gap-1.5 mt-0.5">
      <span className="text-[11px] text-rose-600">Rs. {p.salePrice.toLocaleString()}</span>
      <span className="text-[10px] text-gray-400 line-through">Rs. {p.price?.toLocaleString()}</span>
    </div>
  )
  : <p className="text-[11px] text-gray-500 mt-0.5">Rs. {p.price?.toLocaleString()}</p>}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 py-4">No products found.</p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   SEARCH OVERLAY  –  mobile
───────────────────────────────────────── */
function SearchOverlay({ searchQuery, setSearchQuery, handleSearch, navigate, onClose }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { products, categories, loading } = useSearchData(dropdownOpen ? searchQuery : "");

  const submitSearch = (e) => { handleSearch(e); onClose(); };
  const goCategory = (link) => { navigate(link); onClose(); };
  const goProduct  = (slug) => { navigate(`/product/${slug}`); onClose(); };

  return (
    <div className="fixed inset-x-0 top-[97px] bottom-0 z-[70] bg-black/65 lg:top-[50px]">
      <div className="mx-auto w-[min(92vw,693px)] pt-[48px]">
        <button type="button" onClick={onClose} aria-label="Close search" className="mb-5 text-white transition-transform duration-500 hover:rotate-180">
          <X size={27} strokeWidth={1.6} />
        </button>
        <form onSubmit={submitSearch} onClick={() => setDropdownOpen(true)} className="flex h-[47px] items-center bg-white px-3">
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => setDropdownOpen(true)}
            placeholder="Search products…" className="h-full flex-1 bg-transparent text-[18px] text-black outline-none" />
          <button type="submit" className="text-black"><Search size={25} strokeWidth={2.2} /></button>
        </form>
        {dropdownOpen && (
          <div className="mt-[7px] max-h-[555px] overflow-y-auto bg-white px-6 py-6 shadow-2xl">
            {categories.length > 0 && (
              <>
                <p className="font-display text-[16px] font-bold uppercase text-neutral-800">Browse Categories</p>
                <hr className="mt-3 mb-6 border-neutral-200" />
                <div className="mb-8 flex flex-wrap gap-x-3 gap-y-4">
                  {categories.slice(0, 7).map((cat) => (
                    <button key={cat._id} onMouseDown={() => goCategory(cat.link)}
                      className="flex h-10 items-center gap-2.5 bg-neutral-50 px-3 text-[15px] text-neutral-500 hover:bg-neutral-100">
                      <Search size={17} strokeWidth={2} />{cat.name}
                    </button>
                  ))}
                </div>
              </>
            )}
            <p className="font-display text-[16px] font-bold uppercase text-neutral-800">
              {searchQuery?.trim() ? "Search Results" : "Popular Products"}
            </p>
            <hr className="mt-3 mb-4 border-neutral-200" />
            {loading ? (
              <div className="grid grid-cols-4 gap-x-7">
                {[...Array(4)].map((_, i) => <div key={i} className="animate-pulse"><div className="bg-gray-200 aspect-square mb-4" /><div className="h-4 bg-gray-200 rounded w-3/4" /></div>)}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-4 gap-x-7">
                {products.map((p) => (
                  <button key={p._id} onMouseDown={() => goProduct(p.slug)} className="group text-left">
                    <div className="relative mb-4 aspect-square overflow-hidden bg-gray-100">
  {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />}
  {p.salePrice && <span className="absolute top-2 left-2 bg-rose-600 text-white text-[12px] font-semibold px-2.5 py-1">Sale</span>}
  {p.stockStatus === "out_of_stock" && <span className="absolute left-1/2 top-0 -translate-x-1/2 bg-white px-3 py-1.5 text-[15px] font-semibold text-neutral-500">Sold Out</span>}
</div>
<p className="text-[16px] font-semibold leading-[1.8] text-black">{p.name}</p>
{p.isSale && p.salePrice
  ? (
    <div className="flex items-baseline gap-1.5 mt-0.5">
      <span className="text-[11px] text-rose-600">Rs. {p.salePrice.toLocaleString()}</span>
      <span className="text-[10px] text-gray-400 line-through">Rs. {p.price?.toLocaleString()}</span>
    </div>
  )
  : <p className="text-[11px] text-gray-500 mt-0.5">Rs. {p.price?.toLocaleString()}</p>}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 py-4">No products found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MOBILE USER MENU DRAWER
───────────────────────────────────────── */
function MobileUserMenu({ user, dispatch, navigate, onClose }) {
  const handleLogout = () => {
    dispatch(logout());
    onClose();
    navigate('/');
  };

  return (
    <div className="fixed inset-0 z-[130] bg-black/65 lg:hidden" onClick={onClose}>
      <aside
        className="absolute bottom-[52px] inset-x-0 bg-white rounded-t-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {user ? (
          <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-[#2b3a7a] flex items-center justify-center shrink-0">
              <span className="text-white text-[15px] font-bold uppercase">
                {user.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <p className="text-base font-semibold text-gray-900">Account</p>
            <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
          </div>
        )}

        {/* Menu items */}
        <nav className="py-2">
          {user ? (
            <>
              <Link
                to="/orders"
                onClick={onClose}
                className="flex items-center gap-3 px-5 py-3.5 text-[15px] text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <Package size={19} strokeWidth={1.6} className="text-gray-500" />
                My Orders
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-[15px] text-rose-600 hover:bg-rose-50 active:bg-rose-100 transition-colors"
              >
                <LogOut size={19} strokeWidth={1.6} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={onClose}
                className="flex items-center gap-3 px-5 py-3.5 text-[15px] text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User size={19} strokeWidth={1.6} className="text-gray-500" />
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className="flex items-center gap-3 px-5 py-3.5 text-[15px] text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <UserPlus size={19} strokeWidth={1.6} className="text-gray-500" />
                Create Account
              </Link>
            </>
          )}
        </nav>

        {/* Safe area spacer */}
        <div className="h-2" />
      </aside>
    </div>
  );
}

/* ─────────────────────────────────────────
   EXPANDED NAVBAR  –  desktop not scrolled
───────────────────────────────────────── */
function ExpandedNavbar({
  cartCount, user, dispatch, navigate,
  searchQuery, setSearchQuery, handleSearch,
  userMenuOpen, setUserMenuOpen,
  searchFocused, setSearchFocused, searchRef,
}) {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto flex px-3 lg:px-10 items-center justify-between h-[100px]">
        <Link to="/"><img src="/images/logo1.png" alt="logo" className="h-[80px]" /></Link>

        <div className="flex flex-col items-end gap-3">
          <div ref={searchRef} className="relative hidden md:block">
            <form onSubmit={handleSearch}
              className={`flex items-center bg-gray-100 text-black border px-3 h-[36px] w-[190px] transition-colors ${searchFocused ? "border-gray-500" : "border-gray-300"}`}>
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => setSearchFocused(true)}
                placeholder="Search" className="flex-1 text-sm outline-none bg-transparent text-black placeholder-black" />
              <button type="submit" className="text-black hover:text-gray-600"><Search size={15} /></button>
            </form>
            {searchFocused && (
              <SearchDropdown query={searchQuery}
                onCategoryClick={(link) => { navigate(link); setSearchFocused(false); }}
                onProductClick={(slug) => { navigate(`/product/${slug}`); setSearchFocused(false); }} />
            )}
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => dispatch(toggleCart())}
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-rose-600 transition-colors">
              <div className="relative">
                <ShoppingBag size={20} />
                <span className="absolute -top-2 -right-2 bg-white border border-red-300 text-red-600 rounded-full w-[17px] h-[17px] text-[10px] flex items-center justify-center font-bold leading-none">{cartCount}</span>
              </div>
              <span className="hidden sm:inline text-[15px]">Shopping cart</span>
            </button>

            <div className="relative">
              {user ? (
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1 text-sm text-gray-700 hover:text-rose-600">
                  <User size={18} />
                  <span className="hidden lg:inline">{user.name.split(" ")[0]}</span>
                  <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <Link to="/login" className="flex items-center gap-1 text-[15px] text-gray-700 hover:text-rose-600 transition-colors">
                  <User size={18} /><span>Sign In</span>
                </Link>
              )}
              {userMenuOpen && user && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg border border-gray-100 rounded-lg z-50 overflow-hidden">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                  </div>
                  <Link to="/orders" onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                    <Package size={15} className="text-gray-400" />My Orders
                  </Link>
                  <button onClick={() => { dispatch(logout()); setUserMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 border-t border-gray-100">
                    <LogOut size={15} />Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <nav className="bg-black h-[44px]">
        <div className="max-w-7xl mx-auto px-3 lg:px-10 flex items-center gap-8 h-full">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path}
              className="text-white text-[12px] tracking-widest uppercase font-semibold hover:text-rose-400 transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

/* ─────────────────────────────────────────
   COMPACT NAVBAR  –  desktop scrolled
───────────────────────────────────────── */
function CompactNavbar({ cartCount, dispatch, navigate, searchQuery, setSearchQuery, handleSearch, searchOpen, setSearchOpen }) {
  return (
    <>
      <div className="relative z-[80] bg-black h-[50px] flex items-center px-6 lg:px-14">
        <div className="max-w-7xl px-3 lg:px-10 w-full mx-auto flex items-center justify-between">
          <Link to="/" className="text-white font-black text-[17px] tracking-widest uppercase mr-10 shrink-0"
            style={{ fontFamily: "'Georgia', serif", letterSpacing: "0.12em" }}>MAVISH</Link>
          <div className="hidden lg:flex items-center gap-7 flex-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}
                className="text-white text-[12px] tracking-widest uppercase font-semibold hover:text-rose-400 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-5">
            <button onClick={() => setSearchOpen(true)} className="text-white hover:text-rose-400 transition-colors"><Search size={18} /></button>
            <button onClick={() => dispatch(toggleCart())} className="relative text-white hover:text-rose-400 transition-colors">
              <ShoppingBag size={18} />
              <span className="absolute -top-2 -right-2 bg-white border border-red-300 text-red-600 rounded-full w-[15px] h-[15px] text-[9px] flex items-center justify-center font-bold leading-none">{cartCount}</span>
            </button>
          </div>
        </div>
      </div>
      {searchOpen && (
        <SearchOverlay searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          handleSearch={handleSearch} navigate={navigate} onClose={() => setSearchOpen(false)} />
      )}
    </>
  );
}

/* ─────────────────────────────────────────
   MOBILE MENU DRAWER
───────────────────────────────────────── */
function MobileMenu({ user, dispatch, navigate, onClose }) {
  const handleLogout = () => {
    dispatch(logout());
    onClose();
    navigate('/');
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/65 lg:hidden">
      <aside className="h-full w-[min(82vw,390px)] bg-white text-black shadow-2xl flex flex-col">
        <div className="flex h-[54px] items-center justify-between px-5 border-b border-gray-100">
          <h2 className="font-body text-[20px] font-semibold">Menu</h2>
          <button type="button" onClick={onClose} aria-label="Close menu" className="text-black"><X size={23} strokeWidth={1.8} /></button>
        </div>

        {/* ── Logged-in user info ── */}
        {user && (
          <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-[#2b3a7a] flex items-center justify-center shrink-0">
              <span className="text-white text-[15px] font-bold uppercase">{user.name?.charAt(0) || 'U'}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path} onClick={onClose}
              className="flex h-[52px] items-center justify-between border-b border-gray-100 px-5 font-body text-[17px] font-semibold">
              {link.label}<ChevronRight size={22} strokeWidth={1.6} />
            </Link>
          ))}
        </nav>

        {/* Account section */}
        <div className="border-t border-gray-200">
          {user ? (
            <>
              <Link to="/orders" onClick={onClose}
                className="flex h-[56px] items-center gap-3 px-5 font-body text-[15px] border-b border-gray-100 hover:bg-gray-50">
                <Package size={20} strokeWidth={1.7} className="text-gray-500" />My Orders
              </Link>
              <button onClick={handleLogout}
                className="w-full flex h-[56px] items-center gap-3 px-5 font-body text-[15px] text-rose-600 hover:bg-rose-50">
                <LogOut size={20} strokeWidth={1.7} />Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={onClose} className="flex h-[60px] items-center gap-2 px-5 font-body text-[15px]">
                <User size={22} strokeWidth={1.7} />Sign In
              </Link>
              <Link to="/register" onClick={onClose} className="flex h-[60px] items-center gap-2 border-t border-gray-200 px-5 font-body text-[15px]">
                <UserPlus size={22} strokeWidth={1.7} />Create an account
              </Link>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

/* ─────────────────────────────────────────
   MOBILE NAVBAR
───────────────────────────────────────── */
function MobileNavbar({ cartCount, user, dispatch, navigate, setSearchOpen }) {
  const [mobileMenuOpen,     setMobileMenuOpen]     = useState(false);
  const [mobileUserMenuOpen, setMobileUserMenuOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <AnnouncementBar />
      <div className="h-[56px] border-b border-gray-200 bg-white px-3 shadow-sm sm:px-5 md:px-8">
        <div className="grid h-full grid-cols-3 items-center">
          <div className="flex items-center gap-5 sm:gap-7">
            <button type="button" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu" className="text-black">
              <Menu size={28} strokeWidth={1.8} />
            </button>
            <button type="button" onClick={() => setSearchOpen(true)} aria-label="Open search" className="text-black">
              <Search size={25} strokeWidth={1.8} />
            </button>
          </div>

          <Link to="/" className="flex justify-center">
            <img src="/images/logo.avif" alt="logo" className="h-[42px] object-contain" />
          </Link>

          <div className="flex items-center justify-end gap-5 sm:gap-7">
            {/* ── User icon — opens menu on tap ── */}
            <button
              type="button"
              aria-label="Account"
              onClick={() => setMobileUserMenuOpen(true)}
              className="relative text-black"
            >
              {user ? (
                <div className="w-7 h-7 rounded-full bg-[#2b3a7a] flex items-center justify-center">
                  <span className="text-white text-[12px] font-bold uppercase">{user.name?.charAt(0) || 'U'}</span>
                </div>
              ) : (
                <User size={25} strokeWidth={1.5} />
              )}
            </button>

            <button type="button" onClick={() => dispatch(toggleCart())} aria-label="Cart" className="relative text-black">
              <ShoppingBag size={25} strokeWidth={1.5} />
              <span className="absolute -right-3 -top-3 flex h-[21px] w-[21px] items-center justify-center rounded-full bg-[#1f2430] text-[12px] font-bold leading-none text-white">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <MobileMenu user={user} dispatch={dispatch} navigate={navigate} onClose={() => setMobileMenuOpen(false)} />
      )}

      {mobileUserMenuOpen && (
        <MobileUserMenu user={user} dispatch={dispatch} navigate={navigate} onClose={() => setMobileUserMenuOpen(false)} />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   MOBILE BOTTOM BAR
───────────────────────────────────────── */
function MobileBottomBar({ cartCount, user, dispatch, navigate, setSearchOpen }) {
  const [mobileUserMenuOpen, setMobileUserMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-[90] h-[52px] border-t border-gray-200 bg-white px-3 sm:px-5 md:px-8 lg:hidden">
        <div className="grid h-full grid-cols-5 items-center">
          <Link to="/" className="flex flex-col items-center justify-center gap-1 font-body text-black">
            <Home size={21} strokeWidth={1.5} /><span className="text-[12px] leading-none">Home</span>
          </Link>
          <button type="button" onClick={() => setSearchOpen(true)} className="flex flex-col items-center justify-center gap-1 font-body text-black">
            <Search size={21} strokeWidth={1.5} /><span className="text-[12px] leading-none">Search</span>
          </button>
          <Link to="/whats-new" className="flex flex-col items-center justify-center gap-1 font-body text-black">
            <Grid2X2 size={21} strokeWidth={1.5} /><span className="text-[12px] leading-none">Collection</span>
          </Link>

          {/* ── Account tab — shows user initial if logged in ── */}
          <button
            type="button"
            onClick={() => setMobileUserMenuOpen(true)}
            className="flex flex-col items-center justify-center gap-1 font-body text-black"
          >
            {user ? (
              <div className="w-[21px] h-[21px] rounded-full bg-[#2b3a7a] flex items-center justify-center">
                <span className="text-white text-[10px] font-bold uppercase">{user.name?.charAt(0) || 'U'}</span>
              </div>
            ) : (
              <User size={21} strokeWidth={1.5} />
            )}
            <span className="text-[12px] leading-none">Account</span>
          </button>

          <button type="button" onClick={() => dispatch(toggleCart())} className="flex flex-col items-center justify-center gap-1 font-body text-black">
            <span className="relative">
              <ShoppingBag size={21} strokeWidth={1.5} />
              <span className="absolute -right-4 -top-4 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#1f2430] text-[12px] font-bold leading-none text-white">{cartCount}</span>
            </span>
            <span className="text-[12px] leading-none">Cart</span>
          </button>
        </div>
      </nav>

      {mobileUserMenuOpen && (
        <MobileUserMenu user={user} dispatch={dispatch} navigate={navigate} onClose={() => setMobileUserMenuOpen(false)} />
      )}
    </>
  );
}

/* ─────────────────────────────────────────
   ROOT EXPORT
───────────────────────────────────────── */
export default function Navbar() {
  const [searchQuery,   setSearchQuery]   = useState("");
  const [userMenuOpen,  setUserMenuOpen]  = useState(false);
  const [scrolled,      setScrolled]      = useState(false);
  const [searchOpen,    setSearchOpen]    = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);

  const cartItems = useSelector((s) => s.cart.items);
  const user      = useSelector((s) => s.auth.user);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const cartCount = cartItems.reduce((a, i) => a + i.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchFocused(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setSearchFocused(false);
    }
  };

  const sharedProps = {
    cartCount, user, dispatch, navigate,
    searchQuery, setSearchQuery, handleSearch,
    userMenuOpen, setUserMenuOpen,
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <MobileNavbar
          cartCount={cartCount} user={user}
          dispatch={dispatch} navigate={navigate}
          setSearchOpen={setSearchOpen}
        />
        <div className="hidden lg:block">
          {!scrolled && <AnnouncementBar />}
          {scrolled ? (
            <CompactNavbar {...sharedProps} searchOpen={searchOpen} setSearchOpen={setSearchOpen} />
          ) : (
            <ExpandedNavbar {...sharedProps} searchFocused={searchFocused} setSearchFocused={setSearchFocused} searchRef={searchRef} />
          )}
        </div>
      </header>

      <MobileBottomBar
        cartCount={cartCount} user={user}
        dispatch={dispatch} navigate={navigate}
        setSearchOpen={setSearchOpen}
      />

      {searchOpen && (
        <div className="lg:hidden">
          <SearchOverlay searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            handleSearch={handleSearch} navigate={navigate} onClose={() => setSearchOpen(false)} />
        </div>
      )}

      <CartSidebar />
    </>
  );
}