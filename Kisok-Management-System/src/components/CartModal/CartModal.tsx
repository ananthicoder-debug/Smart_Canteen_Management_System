import React from "react";

type CartItem = {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type CartModalProps = {
  show: boolean;
  handleClose: () => void;
  cart: CartItem[];
  incrementQuantity: (productId: string) => void;
  decrementQuantity: (productId: string) => void;
  removeFromCart: (product: CartItem) => void;
  clearCart: () => void;
  calculateTotal: () => number;
  checkout: () => void;
};

const CartModal: React.FC<CartModalProps> = ({
  show,
  handleClose,
  cart,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  clearCart,
  calculateTotal,
  checkout,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="glass-panel w-full max-w-xl">
        <div className="flex items-center justify-between border-b border-white/50 px-5 py-4">
          <h3 className="text-lg font-semibold text-slate-800">Cart</h3>
          <button className="text-slate-400 hover:text-slate-600" onClick={handleClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
          {cart.length === 0 ? (
            <p className="text-sm text-slate-500">Your cart is empty.</p>
          ) : (
            <div className="space-y-4">
              {cart.map((product) => (
                <div key={product._id} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-12 w-12 rounded-xl object-cover"
                    />
                    <div>
                      <h5 className="text-sm font-semibold text-slate-800">{product.name}</h5>
                      <p className="text-xs text-slate-500">₹{product.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="h-7 w-7 rounded-full border border-slate-200 text-sm text-slate-600 hover:bg-slate-100"
                      onClick={() => decrementQuantity(product._id)}
                    >
                      -
                    </button>
                    <span className="text-sm font-semibold text-slate-700">{product.quantity}</span>
                    <button
                      className="h-7 w-7 rounded-full border border-slate-200 text-sm text-slate-600 hover:bg-slate-100"
                      onClick={() => incrementQuantity(product._id)}
                    >
                      +
                    </button>
                    <button
                      className="h-7 w-7 rounded-full border border-rose-200 text-sm text-rose-500 hover:bg-rose-50"
                      onClick={() => removeFromCart(product)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-white/50 px-5 py-4">
          <p className="text-base font-semibold text-slate-800">Total: ₹{calculateTotal()}</p>
          <div className="ml-auto flex gap-2">
            <button
              className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50"
              onClick={clearCart}
            >
              Clear Cart
            </button>
            <button
              className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
              onClick={checkout}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartModal;
