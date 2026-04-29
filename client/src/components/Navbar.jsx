import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ChevronRight, Grid2X2, Home, Menu, Search, ShoppingBag, User, UserPlus, X } from "lucide-react";
import { toggleCart } from "../store/cartSlice";
import { logout } from "../store/authSlice";
import AnnouncementBar from "./AnnouncementBar";

const navLinks = [
  { label: "Sale", path: "/sale" },
  { label: "What's New", path: "/whats-new" },
  { label: "Boys", path: "/boys" },
  { label: "Girls", path: "/girls" },
  { label: "Accessories", path: "/accessories" },
];

const trendingTags = ["eid", "boys", "girls", "wool", "summer", "farshi", "festive"];

const popularProducts = [
  { id: 1, name: "Pleated Diamante -3pc", badge: "Sold Out", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&q=80" },
  { id: 2, name: "Little Bride Twin -1pc", badge: "Sold Out", image: "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=200&q=80" },
  { id: 3, name: "Dholak -3pc", price: "from", image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&q=80" },
  { id: 4, name: "Kala Doria -3pc", badge: "Sold Out", image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200&q=80" },
];

/* ─── SEARCH DROPDOWN ─── */
function SearchDropdown({ onTagClick, onProductClick }) {
  return (
    <div className="absolute top-[calc(100%+1px)] right-0 w-[700px] bg-white border border-gray-200 shadow-2xl z-[100] px-6 py-5">
      {/* TRENDING NOW */}
      <p className="text-[11px] font-black uppercase tracking-widest text-gray-800 mb-2">Trending Now</p>
      <hr className="border-gray-200 mb-3" />
      <div className="flex flex-wrap gap-2 mb-5">
        {trendingTags.map((tag) => (
          <button
            key={tag}
            onMouseDown={() => onTagClick(tag)}
            className="flex items-center gap-1.5 border border-gray-300 px-3 py-1.5 text-[12px] text-gray-700 hover:border-gray-500 hover:bg-gray-50 transition-colors"
          >
            <Search size={11} className="text-gray-400" />
            {tag}
          </button>
        ))}
      </div>

      {/* POPULAR PRODUCTS */}
      <p className="text-[11px] font-black uppercase tracking-widest text-gray-800 mb-2">Popular Products</p>
      <hr className="border-gray-200 mb-4" />
      <div className="grid grid-cols-4 gap-4">
        {popularProducts.map((p) => (
          <button
            key={p.id}
            onMouseDown={() => onProductClick(p.name)}
            className="text-left group"
          >
            <div className="relative overflow-hidden bg-gray-100 aspect-square mb-2">
              <img
                src={p.image}
                alt={p.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {p.badge && (
                <span className="absolute top-2 left-2 bg-white text-[10px] font-semibold px-2 py-0.5 text-gray-700">
                  {p.badge}
                </span>
              )}
            </div>
            <p className="text-[12px] text-gray-800 font-medium leading-tight">{p.name}</p>
            {p.price && <p className="text-[11px] text-gray-500 mt-0.5">{p.price}</p>}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── EXPANDED navbar ─── */
function SearchOverlay({ searchQuery, setSearchQuery, handleSearch, navigate, onClose }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const submitSearch = (e) => {
    handleSearch(e);
    onClose();
  };

  const handleTagClick = (tag) => {
    navigate(`/search?q=${tag}`);
    onClose();
  };

  const handleProductClick = (name) => {
    navigate(`/search?q=${encodeURIComponent(name)}`);
    onClose();
  };

  return (
    <div className="fixed inset-x-0 top-[97px] bottom-0 z-[70] bg-black/65 lg:top-[50px]">
      <div className="mx-auto w-[min(92vw,693px)] pt-[48px]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close search"
          className="mb-5 text-white transition-transform duration-500 hover:rotate-180"
        >
          <X size={27} strokeWidth={1.6} />
        </button>

        <form
          onSubmit={submitSearch}
          onClick={() => setDropdownOpen(true)}
          className="flex h-[47px] items-center bg-white px-3"
        >
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setDropdownOpen(true)}
            className="h-full flex-1 bg-transparent text-[18px] text-black outline-none"
          />
          <button type="submit" className="text-black">
            <Search size={25} strokeWidth={2.2} />
          </button>
        </form>

        {dropdownOpen && (
          <div className="mt-[7px] max-h-[555px] overflow-y-auto bg-white px-6 py-6 shadow-2xl">
            <p className="font-display text-[16px] font-bold uppercase text-neutral-800">Trending Now</p>
            <hr className="mt-3 mb-6 border-neutral-200" />

            <div className="mb-8 flex flex-wrap gap-x-3 gap-y-4">
              {trendingTags.map((tag) => (
                <button
                  key={tag}
                  onMouseDown={() => handleTagClick(tag)}
                  className="flex h-10 items-center gap-2.5 bg-neutral-50 px-3 text-[15px] text-neutral-500 hover:bg-neutral-100"
                >
                  <Search size={17} strokeWidth={2} />
                  {tag}
                </button>
              ))}
            </div>

            <p className="font-display text-[16px] font-bold uppercase text-neutral-800">Popular Products</p>
            <hr className="mt-3 mb-4 border-neutral-200" />

            <div className="grid grid-cols-4 gap-x-7">
              {popularProducts.map((p) => (
                <button
                  key={p.id}
                  onMouseDown={() => handleProductClick(p.name)}
                  className="group text-left"
                >
                  <div className="relative mb-4 aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {p.badge && (
                      <span className="absolute left-1/2 top-0 -translate-x-1/2 bg-white px-3 py-1.5 text-[15px] font-semibold text-neutral-500">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[16px] font-semibold leading-[1.8] text-black">{p.name}</p>
                  {p.price && <p className="mt-1.5 text-[16px] text-neutral-500">{p.price}</p>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ExpandedNavbar({ cartCount, user, dispatch, navigate, searchQuery, setSearchQuery, handleSearch, userMenuOpen, setUserMenuOpen, searchFocused, setSearchFocused, searchRef }) {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto flex px-3 items-center justify-between h-[100px]">

        {/* LOGO */}
        <Link to="/">
          <img src="/images/logo.avif" alt="logo" className="h-[80px]" />
        </Link>

        {/* RIGHT SIDE */}
        <div className="flex flex-col items-end gap-3">

          {/* SEARCH BAR */}
          <div ref={searchRef} className="relative hidden md:block">
            <form
              onSubmit={handleSearch}
              className={`flex items-center bg-gray-100 text-black border px-3 h-[36px] w-[190px] transition-colors ${searchFocused ? "border-gray-500" : "border-gray-300"}`}
            >
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder="Search"
                className="flex-1 text-sm outline-none bg-transparent text-black placeholder-black"
              />
              <button type="submit" className="text-black hover:text-gray-600">
                <Search size={15} />
              </button>
            </form>

            {searchFocused && (
              <SearchDropdown
                onTagClick={(tag) => { navigate(`/search?q=${tag}`); setSearchFocused(false); }}
                onProductClick={(name) => { navigate(`/search?q=${encodeURIComponent(name)}`); setSearchFocused(false); }}
              />
            )}
          </div>

          {/* CART + USER */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => dispatch(toggleCart())}
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-rose-600 transition-colors"
            >
              <div className="relative">
                <ShoppingBag size={20} />
                <span className="absolute -top-2 -right-2 bg-white border border-red-300 text-red-600 rounded-full w-[17px] h-[17px] text-[10px] flex items-center justify-center font-bold leading-none">
                  {cartCount}
                </span>
              </div>
              <span className="hidden sm:inline text-[15px]">Shopping cart</span>
            </button>

            <div className="relative">
              {user ? (
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-1 text-sm text-gray-700 hover:text-rose-600">
                  <User size={18} />
                  <span className="hidden lg:inline">{user.name.split(" ")[0]}</span>
                </button>
              ) : (
                <Link to="/login" className="flex items-center gap-1 text-[15px] text-gray-700 hover:text-rose-600 transition-colors">
                  <User size={18} />
                  <span>Sign In</span>
                </Link>
              )}
              {userMenuOpen && user && (
                <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg border rounded-lg z-50">
                  <Link to="/orders" className="block px-4 py-2 text-sm hover:bg-gray-100">My Orders</Link>
                  <button onClick={() => dispatch(logout())} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BLACK NAV BAR */}
      <nav className="bg-black h-[44px] px-3">
        <div className="max-w-7xl mx-auto flex items-center gap-8 h-full">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path} className="text-white text-[12px] tracking-widest uppercase font-semibold hover:text-rose-400 transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

/* ─── COMPACT navbar ─── */
function CompactNavbar({ cartCount, navigate, searchQuery, setSearchQuery, handleSearch, searchOpen, setSearchOpen }) {
  return (
    <>
      <div className="relative z-[80] bg-black h-[50px] flex items-center px-6 lg:px-14">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          <Link to="/" className="text-white font-black text-[17px] tracking-widest uppercase mr-10 shrink-0" style={{ fontFamily: "'Georgia', serif", letterSpacing: "0.12em" }}>
            SWOCCLOTHING
          </Link>
          <div className="hidden lg:flex items-center gap-7 flex-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className="text-white text-[12px] tracking-widest uppercase font-semibold hover:text-rose-400 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-5">
            <button onClick={() => setSearchOpen(true)} className="text-white hover:text-rose-400 transition-colors"><Search size={18} /></button>
            <button className="relative text-white hover:text-rose-400 transition-colors">
              <ShoppingBag size={18} />
              <span className="absolute -top-2 -right-2 bg-white border border-red-300 text-red-600 rounded-full w-[15px] h-[15px] text-[9px] flex items-center justify-center font-bold leading-none">{cartCount}</span>
            </button>
          </div>
        </div>
      </div>

      {searchOpen && (
        <SearchOverlay
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
          navigate={navigate}
          onClose={() => setSearchOpen(false)}
        />
      )}
    </>
  );
}

/* ─── MAIN NAVBAR ─── */
function MobileMenu({ onClose }) {
  return (
    <div className="fixed inset-0 z-[120] bg-black/65 lg:hidden">
      <aside className="h-full w-[min(82vw,390px)] bg-white text-black shadow-2xl">
        <div className="flex h-[54px] items-center justify-between px-5">
          <h2 className="font-body text-[20px] font-semibold">Menu</h2>
          <button type="button" onClick={onClose} aria-label="Close menu" className="text-black">
            <X size={23} strokeWidth={1.8} />
          </button>
        </div>

        <nav>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={onClose}
              className="flex h-[52px] items-center justify-between border-t border-gray-200 px-5 font-body text-[17px] font-semibold"
            >
              {link.label}
              <ChevronRight size={22} strokeWidth={1.6} />
            </Link>
          ))}
        </nav>

        <div className="border-y border-gray-200">
          <Link
            to="/login"
            onClick={onClose}
            className="flex h-[60px] items-center gap-2 px-5 font-body text-[15px]"
          >
            <User size={22} strokeWidth={1.7} />
            Sign In
          </Link>
          <Link
            to="/register"
            onClick={onClose}
            className="flex h-[60px] items-center gap-2 border-t border-gray-200 px-5 font-body text-[15px]"
          >
            <UserPlus size={22} strokeWidth={1.7} />
            Create an account
          </Link>
        </div>
      </aside>
    </div>
  );
}

function MobileNavbar({ cartCount, dispatch, setSearchOpen }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <Link to="/login" aria-label="Account" className="text-black">
              <User size={25} strokeWidth={1.5} />
            </Link>
            <button type="button" onClick={() => dispatch(toggleCart())} aria-label="Cart" className="relative text-black">
              <ShoppingBag size={25} strokeWidth={1.5} />
              <span className="absolute -right-3 -top-3 flex h-[21px] w-[21px] items-center justify-center rounded-full bg-[#1f2430] text-[12px] font-bold leading-none text-white">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && <MobileMenu onClose={() => setMobileMenuOpen(false)} />}
    </div>
  );
}

function MobileBottomBar({ cartCount, dispatch, setSearchOpen }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-[90] h-[52px] border-t border-gray-200 bg-white px-3 sm:px-5 md:px-8 lg:hidden">
      <div className="grid h-full grid-cols-5 items-center">
        <Link to="/" className="flex flex-col items-center justify-center gap-1 font-body text-black">
          <Home size={21} strokeWidth={1.5} />
          <span className="text-[12px] leading-none">Home</span>
        </Link>
        <button type="button" onClick={() => setSearchOpen(true)} className="flex flex-col items-center justify-center gap-1 font-body text-black">
          <Search size={21} strokeWidth={1.5} />
          <span className="text-[12px] leading-none">Search</span>
        </button>
        <Link to="/whats-new" className="flex flex-col items-center justify-center gap-1 font-body text-black">
          <Grid2X2 size={21} strokeWidth={1.5} />
          <span className="text-[12px] leading-none">Collection</span>
        </Link>
        <Link to="/login" className="flex flex-col items-center justify-center gap-1 font-body text-black">
          <User size={21} strokeWidth={1.5} />
          <span className="text-[12px] leading-none">Account</span>
        </Link>
        <button type="button" onClick={() => dispatch(toggleCart())} className="flex flex-col items-center justify-center gap-1 font-body text-black">
          <span className="relative">
            <ShoppingBag size={21} strokeWidth={1.5} />
            <span className="absolute -right-4 -top-4 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#1f2430] text-[12px] font-bold leading-none text-white">
              {cartCount}
            </span>
          </span>
          <span className="text-[12px] leading-none">Cart</span>
        </button>
      </div>
    </nav>
  );
}

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);

  const cartItems = useSelector((s) => s.cart.items);
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartCount = cartItems.reduce((a, i) => a + i.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setSearchFocused(false);
    }
  };

  const sharedProps = { cartCount, user, dispatch, navigate, searchQuery, setSearchQuery, handleSearch, userMenuOpen, setUserMenuOpen };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <MobileNavbar
          cartCount={cartCount}
          dispatch={dispatch}
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

      <MobileBottomBar cartCount={cartCount} dispatch={dispatch} setSearchOpen={setSearchOpen} />

      {searchOpen && (
        <div className="lg:hidden">
          <SearchOverlay
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
            navigate={navigate}
            onClose={() => setSearchOpen(false)}
          />
        </div>
      )}
    </>
  );
}
