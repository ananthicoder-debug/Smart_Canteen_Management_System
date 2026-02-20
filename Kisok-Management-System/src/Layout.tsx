import React, { useEffect, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Link } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";

import CartModal from "./components/CartModal/CartModal";
import ProductDetailModal from "./components/ProductDetail/ProductDetailModal";
import Footer from "./components/Footer/Footer";
import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import OrdersPage from "./pages/OrdersPage";
import PaymentFailed from "./pages/PaymentFailed";

type Product = {
  _id: string;
  id?: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
  image?: string;
  category?: string;
  ingredients?: string;
  allergens?: string;
  reason?: string;
};

type CartItem = Product & { quantity: number };

type SaleItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

type Sale = {
  userId: string;
  items: SaleItem[];
  total: number;
  timestamp: number;
};

type SuggestedItem = SaleItem & { count: number; image: string };

type FeedbackForm = {
  name: string;
  admissionNumber: string;
  message: string;
};

type LayoutProps = {
  page: "home" | "menu" | "orders" | "payment-failed";
};

const ShoppingCartIcon = FaShoppingCart as unknown as React.ComponentType<
  React.SVGProps<SVGSVGElement>
>;

const Layout: React.FC<LayoutProps> = ({ page }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showAdmissionModal, setShowAdmissionModal] = useState(false);
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [showProductDetailModal] = useState(false);
  const [showCheckoutToast, setShowCheckoutToast] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [suggestedItems, setSuggestedItems] = useState<SuggestedItem[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [userId, setUserId] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackForm>({
    name: "",
    admissionNumber: "",
    message: "",
  });
  const [feedbackStatus, setFeedbackStatus] = useState("");
  // Arduino endpoint (matches Final.ino static IP)
  const ARDUINO_URL_BASE = "http://192.168.100.108";
  // Expected UID will be fetched from backend for the current user when available
  const [expectedUid, setExpectedUid] = useState<string | null>(null);

  const fetchExpectedUid = async (adNo: string) => {
    try {
      const res = await axios.get(`/api/users/${encodeURIComponent(adNo)}`);
      return res.data && res.data.uid ? res.data.uid : null;
    } catch (err) {
      return null;
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let response;
        try {
          response = await axios.get<Product[]>('/api/products');
        } catch (err) {
          // fallback to absolute backend URL if proxy isn't working
          response = await axios.get<Product[]>('http://localhost:3000/api/products');
        }
        setProducts(response.data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const url = userId
          ? `/api/recommendations?userId=${encodeURIComponent(userId)}`
          : "/api/recommendations";
        const res = await axios.get<{ all?: Product[] }>(url);
        setRecommendations(res.data.all || []);
      } catch (err) {
        setRecommendations([]);
      }
    };
    fetchRecommendations();
  }, [userId]);

  const addToCart = async (productId: string): Promise<void> => {
    try {
      const { data: product } = await axios.get<Product>(
        `/api/products/${productId}`
      );
      if (!product || product.quantity <= 0) return;
      setCart((prev) => {
        const exists = prev.find((p) => p._id === product._id);
        if (exists) {
          return prev.map((p) =>
            p._id === product._id ? { ...p, quantity: p.quantity + 1 } : p
          );
        }
        return [...prev, { ...product, quantity: 1 }];
      });
      await axios.post("/api/products/update-quantity", {
        id: product._id,
        quantityChange: -1,
      });
      setShowCartModal(true);
    } catch (err) {
      console.error(err);
      alert("Failed to add product to cart.");
    }
  };

  const incrementQuantity = (productId: string) =>
    setCart((prev) =>
      prev.map((p) =>
        p._id === productId ? { ...p, quantity: p.quantity + 1 } : p
      )
    );

  const decrementQuantity = (productId: string) =>
    setCart((prev) =>
      prev.map((p) =>
        p._id === productId && p.quantity > 1
          ? { ...p, quantity: p.quantity - 1 }
          : p
      )
    );

  const removeFromCart = (prod: CartItem) =>
    setCart((prev) => prev.filter((p) => p._id !== prod._id));

  const clearCart = () => setCart([]);

  const calculateTotal = () =>
    cart.reduce((sum, p) => sum + p.price * p.quantity, 0);

  const checkout = () => {
    setShowCartModal(false);
    setShowAdmissionModal(true);
  };

  const fetchUserSuggestions = async (adNo: string): Promise<void> => {
    try {
      const response = await axios.get<Sale[]>("/api/sales");
      const userOrders = response.data.filter((order) => order.userId === adNo);
      const itemCounts: Record<string, SuggestedItem> = {};
      userOrders.forEach((order) => {
        order.items.forEach((item) => {
          if (!itemCounts[item.id]) {
            itemCounts[item.id] = { ...item, count: 0, image: "" };
          }
          itemCounts[item.id].count += item.quantity;
        });
      });
      const merged = Object.values(itemCounts).map((item) => {
        const prod = products.find(
          (p) => p._id === item.id || p.id === item.id
        );
        return {
          ...item,
          image: prod
            ? prod.image
            : "https://via.placeholder.com/36?text=No+Img",
        };
      });
      const sorted = merged.sort((a, b) => b.count - a.count);
      setSuggestedItems(sorted.slice(0, 5));
    } catch (err) {
      setSuggestedItems([]);
    }
  };

  // Submit sale to backend and show receipt
  const submitSale = async (userIdForSale: string) => {
    setCheckoutError("");
    fetchUserSuggestions(userIdForSale);
    const saleData: Sale = {
      userId: userIdForSale,
      items: cart.map((i) => ({
        id: i._id,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
      total: calculateTotal(),
      timestamp: Date.now(),
    };
    try {
      // Post sale to backend with fallback to absolute URL
      try {
        await axios.post("/api/sales", saleData);
      } catch (err) {
        // fallback to absolute backend URL if proxy isn't working
        await axios.post("http://localhost:3000/api/sales", saleData);
      }
      
      // Reduce stock for each item in the cart
      for (const item of cart) {
        try {
          await axios.post("/api/products/update-quantity", {
            id: item._id,
            quantityChange: -item.quantity,
          });
        } catch (err) {
          // fallback to absolute backend URL
          await axios.post("http://localhost:3000/api/products/update-quantity", {
            id: item._id,
            quantityChange: -item.quantity,
          });
        }
      }
      
      if (cart.length > 0) {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Kiosk Vending Machine Invoice", 14, 22);
        doc.setFontSize(12);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);
        doc.text(`User ID: ${userIdForSale}`, 14, 36);
        const columns = ["Item", "Qty", "Price", "Subtotal"];
        const rows = cart.map((item) => [
          item.name,
          item.quantity.toString(),
          `Rs: ${Number(item.price).toFixed(2)}`,
          `Rs: ${(Number(item.price) * item.quantity).toFixed(2)}`,
        ]);
        autoTable(doc, {
          head: [columns],
          body: rows,
          startY: 45,
        });
        const finalY = (doc as any).lastAutoTable
          ? (doc as any).lastAutoTable.finalY
          : 45;
        doc.setFontSize(14);
        doc.text(
          `Total Amount\nRs: ${calculateTotal().toFixed(2)}`,
          14,
          finalY + 10
        );
        doc.save(`invoice_${Date.now()}.pdf`);
      }
      clearCart();
      setShowReceiptModal(true);
      setShowCheckoutToast(true);
      setTimeout(() => setShowCheckoutToast(false), 3000);
      try {
        const response = await axios.get<Product[]>("/api/products");
        setProducts(response.data || []);
      } catch (error) {
        // fallback to absolute backend URL
        try {
          const response = await axios.get<Product[]>("http://localhost:3000/api/products");
          setProducts(response.data || []);
        } catch (err) {
          console.error("Error fetching products after purchase:", err);
        }
      }
    } catch (err) {
      console.error("Checkout failed:", err);
      setCheckoutError("Checkout failed. Please try again.");
    }
  };

  const handleFloatingCartClick = () => setShowCartModal(true);

  return (
    <div className="min-h-screen text-slate-900">
      <header className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="glass-panel flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img
              src={process.env.PUBLIC_URL + "/mepco-logo.png"}
              alt="Mepco College Logo"
              className="h-16 w-16 rounded-2xl bg-white/80 object-contain shadow"
            />
            <Link to="/" className="text-2xl font-semibold text-slate-800">
              Kiosk Vending Machine <span className="text-blue-600">| CSE Department</span>
            </Link>
          </div>
          <nav className="flex flex-wrap items-center gap-3">
            <Link className="glassy-chip px-4 py-2 text-xs font-semibold hover:bg-white/80" to="/">
              Home
            </Link>
            <Link className="glassy-chip px-4 py-2 text-xs font-semibold hover:bg-white/80" to="/menu">
              Menu
            </Link>
            <Link className="glassy-chip px-4 py-2 text-xs font-semibold hover:bg-white/80" to="/orders">
              My Orders
            </Link>
            <button
              className="glassy-chip px-4 py-2 text-xs font-semibold hover:bg-white/80"
              onClick={() => setShowFeedbackModal(true)}
            >
              Feedback
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-10">
        {checkoutError && (
          <div className="glass-panel fixed right-4 top-4 z-50 px-4 py-3 text-sm text-rose-600">
            <div className="flex items-center justify-between gap-4">
              <span>{checkoutError}</span>
              <button className="text-rose-500" onClick={() => setCheckoutError("")}>✕</button>
            </div>
          </div>
        )}

        {page === "home" && (
          <HomePage recommendations={recommendations} addToCart={addToCart} />
        )}
        {page === "menu" && (
          <MenuPage
            products={products}
            suggestedItems={suggestedItems}
            addToCart={addToCart}
          />
        )}
        {page === "orders" && <OrdersPage />}
        {page === "payment-failed" && <PaymentFailed />}

        <CartModal
          show={showCartModal}
          handleClose={() => setShowCartModal(false)}
          cart={cart}
          incrementQuantity={incrementQuantity}
          decrementQuantity={decrementQuantity}
          removeFromCart={removeFromCart}
          clearCart={clearCart}
          calculateTotal={calculateTotal}
          checkout={checkout}
        />
        <ProductDetailModal
          show={showProductDetailModal}
          handleClose={() => {}}
          product={null}
          addToCart={addToCart}
        />

        <ModalShell
          open={showAdmissionModal}
          title="Tap Card to Verify"
          onClose={() => {
            setShowAdmissionModal(false);
            setAdmissionNumber("");
          }}
          footer={
            <div className="flex justify-end gap-2">
              <button
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                onClick={() => {
                  setShowAdmissionModal(false);
                  setAdmissionNumber("");
                }}
              >
                Cancel
              </button>
            </div>
          }
        >
          <div>
            <p className="text-sm text-slate-600">Enter your admission number to verify your card:</p>
            <input
              className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              type="text"
              value={admissionNumber}
              onChange={(e) => setAdmissionNumber(e.target.value)}
              placeholder="e.g., STU001"
            />
            <div className="mt-4 flex items-center gap-3">
              <button
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={!admissionNumber.trim()}
                onClick={async () => {
                  if (!admissionNumber.trim()) {
                    setCheckoutError("Please enter your admission number.");
                    return;
                  }
                  // Fetch expected UID from backend for this admission number
                  let uidToUse = await fetchExpectedUid(admissionNumber);
                  if (!uidToUse) {
                    setCheckoutError(`No card UID found for admission number: ${admissionNumber}`);
                    return;
                  }
                  setExpectedUid(uidToUse);
                  
                  // Open Arduino verification window with expected UID
                  const url = `${ARDUINO_URL_BASE}/?id=${uidToUse}`;
                  const w = window.open(url, "arduino-tap", "width=480,height=640");
                  if (!w) {
                    setCheckoutError("Unable to open verification window. Please allow popups.");
                    return;
                  }
                  // Poll child window for same-origin redirect back to kiosk (contains status)
                  const interval = setInterval(() => {
                    try {
                      const href = w.location.href; // will throw until same-origin
                      if (!href) return;
                      const u = new URL(href);
                      const status = u.searchParams.get("status");
                      const reason = u.searchParams.get("reason");
                      const id = u.searchParams.get("id");
                      if (status === "success") {
                        clearInterval(interval);
                        w.close();
                        setShowAdmissionModal(false);
                        submitSale(admissionNumber);
                        setUserId(admissionNumber);
                        setAdmissionNumber("");
                      } else if (u.pathname && u.pathname.includes("/payment-failed")) {
                        clearInterval(interval);
                        w.close();
                        setShowAdmissionModal(false);
                        setCheckoutError(reason ? `Payment failed: ${reason}` : "Payment failed.");
                        // navigate user to payment failed page
                        window.location.href = "/payment-failed" + (reason ? `?reason=${encodeURIComponent(reason)}` : "");
                      }
                    } catch (err) {
                      // cross-origin until Arduino redirects back; ignore
                    }
                  }, 500);
                }}
              >
                Start Tap
              </button>
              <span className="text-xs text-slate-500">Tap reader window opens — follow its instructions.</span>
            </div>
          </div>
        </ModalShell>

        <ModalShell
          open={showReceiptModal}
          title="Payment Successful"
          onClose={() => setShowReceiptModal(false)}
          footer={
            <div className="flex justify-end">
              <button
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                onClick={() => setShowReceiptModal(false)}
              >
                Close
              </button>
            </div>
          }
        >
          <p className="text-sm text-slate-600">Your order has been placed successfully!</p>
        </ModalShell>

        <ModalShell
          open={showFeedbackModal}
          title="Submit Feedback"
          onClose={() => setShowFeedbackModal(false)}
          footer={
            <div className="flex justify-end gap-2">
              <button
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                onClick={() => setShowFeedbackModal(false)}
              >
                Close
              </button>
              <button
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                onClick={async () => {
                  setFeedbackStatus("");
                  if (!feedback.name || !feedback.admissionNumber || !feedback.message) {
                    setFeedbackStatus("All fields are required.");
                    return;
                  }
                  try {
                    await axios.post("/api/feedback", feedback);
                    setFeedbackStatus("Feedback submitted successfully!");
                    setFeedback({ name: "", admissionNumber: "", message: "" });
                  } catch (err) {
                    setFeedbackStatus("Failed to submit feedback.");
                  }
                }}
              >
                Submit
              </button>
            </div>
          }
        >
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600">Name</label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                type="text"
                value={feedback.name}
                onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Admission Number</label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                type="text"
                value={feedback.admissionNumber}
                onChange={(e) => setFeedback({ ...feedback, admissionNumber: e.target.value })}
                placeholder="Enter your admission number"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Feedback</label>
              <textarea
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                rows={3}
                value={feedback.message}
                onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                placeholder="Enter your feedback"
              />
            </div>
            {feedbackStatus && (
              <div
                className={`rounded-lg px-3 py-2 text-xs ${
                  feedbackStatus.includes("success")
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-rose-50 text-rose-500"
                }`}
              >
                {feedbackStatus}
              </div>
            )}
          </div>
        </ModalShell>

        {showCheckoutToast && (
          <div className="fixed bottom-4 right-4 z-50 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow">
            Checkout successful!
          </div>
        )}

        {cart.length > 0 && !showCartModal && (
          <button
            className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700"
            onClick={handleFloatingCartClick}
            aria-label="View Cart"
          >
            <ShoppingCartIcon />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold">
              {cart.length}
            </span>
          </button>
        )}
      </main>
      <Footer />
    </div>
  );
};

const ModalShell = ({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="glass-panel w-full max-w-lg">
        <div className="flex items-center justify-between border-b border-white/50 px-5 py-4">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <button className="text-slate-400 hover:text-slate-600" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="border-t border-white/50 px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
};

export default Layout;
