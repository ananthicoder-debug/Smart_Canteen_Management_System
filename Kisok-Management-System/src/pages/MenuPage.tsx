import React, { useState } from "react";
import { motion } from "framer-motion";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

type Product = {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type SuggestedItem = {
  id: string;
  name: string;
  count: number;
  image: string;
};

type MenuPageProps = {
  products: Product[];
  suggestedItems: SuggestedItem[];
  addToCart: (productId: string) => void;
};

const MenuPage: React.FC<MenuPageProps> = ({ products, suggestedItems, addToCart }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [waitingForTap, setWaitingForTap] = useState(false);
  const [tapMessage, setTapMessage] = useState("");

  // Arduino endpoint (uses static IP from Final.ino)
  const ARDUINO_URL_BASE = "http://192.168.100.108";
  // Example expected UID stored in DB (sample provided by user)
  const EXPECTED_UID = "8FDA8A1F";

  const highlightMatch = (text: string, query: string): React.ReactNode => {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.substring(0, idx)}
        <span className="rounded bg-blue-100 px-1 text-blue-600">
          {text.substring(idx, idx + query.length)}
        </span>
        {text.substring(idx + query.length)}
      </>
    );
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-semibold text-slate-800">Today's Items</h2>
        {/* Tap card UI: replace admission-number card with card-tap interaction */}
        <div className="w-full max-w-sm">
          <div className="glass-panel p-4">
            <h4 className="text-sm font-semibold text-slate-700">Card Tap Verification</h4>
            <p className="mt-2 text-xs text-slate-600">Tap your card on the reader to verify payment after checkout.</p>
            <div className="mt-3 flex items-center gap-2">
              <button
                className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                onClick={() => {
                  setWaitingForTap(true);
                  setTapMessage("Opening card tap window...");
                  // Open Arduino verification URL in a new window; Arduino will handle detection and redirect back
                  const url = `${ARDUINO_URL_BASE}/?id=${EXPECTED_UID}`;
                  window.open(url, "arduino-tap", "width=480,height=640");
                }}
              >
                Start Tap
              </button>
              {waitingForTap && <span className="text-xs text-slate-500">{tapMessage || "Waiting for card..."}</span>}
            </div>
          </div>
        </div>
        <div className="relative w-full max-w-md">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <SearchIcon fontSize="small" />
          </span>
          <input
            className="glassy-input w-full py-2 pl-9 pr-3 text-sm"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setHighlightedIndex(-1);
            }}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
            onKeyDown={(e) => {
              if (!searchFocused) return;
              const filteredSuggestions = searchTerm.trim()
                ? suggestedItems.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                : suggestedItems;
              if (filteredSuggestions.length === 0) return;
              if (e.key === "ArrowDown") {
                setHighlightedIndex((prev) => (prev + 1) % filteredSuggestions.length);
                e.preventDefault();
              } else if (e.key === "ArrowUp") {
                setHighlightedIndex((prev) => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
                e.preventDefault();
              } else if (e.key === "Enter" && highlightedIndex >= 0) {
                setSearchTerm(filteredSuggestions[highlightedIndex].name);
                setHighlightedIndex(-1);
                setSearchFocused(false);
                e.preventDefault();
              }
            }}
            autoComplete="off"
          />
          {searchFocused && suggestedItems.length > 0 && (() => {
            const filteredSuggestions = searchTerm.trim()
              ? suggestedItems.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
              : suggestedItems;
            if (filteredSuggestions.length === 0) return null;
            return (
              <div className="glass-panel absolute z-10 mt-2 w-full py-1">
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-blue-500">
                  Suggestions for you
                </div>
                {filteredSuggestions.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 px-4 py-2 text-sm ${
                      highlightedIndex === idx ? "bg-blue-500 text-white" : "text-slate-700"
                    }`}
                    onMouseDown={() => setSearchTerm(item.name)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                  >
                    <img src={item.image} alt={item.name} className="h-8 w-8 rounded-lg object-cover" />
                    <span className="flex-1">{highlightMatch(item.name, searchTerm)}</span>
                    <span className={`text-xs ${highlightedIndex === idx ? "text-white" : "text-blue-500"}`}>
                      ({item.count}x)
                    </span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products
          .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .map((product) => (
            <motion.div
              key={product._id}
              className="glass-card overflow-hidden"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              whileHover={{ y: -4, boxShadow: "0 18px 50px -30px rgba(15,23,42,0.6)" }}
            >
              <img
                src={product.image}
                className="h-32 w-full object-cover"
                alt={product.name}
              />
              <div className="flex min-h-[150px] flex-col gap-2 px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <h5 className="text-base font-semibold text-slate-800">{product.name}</h5>
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-600">
                    ₹{product.price}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Quantity:</span> {product.quantity}
                </p>
                <div className="mt-auto">
                  <button
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    onClick={() => addToCart(product._id)}
                    disabled={product.quantity === 0}
                  >
                    <ShoppingCartIcon fontSize="inherit" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  );
};

export default MenuPage;
