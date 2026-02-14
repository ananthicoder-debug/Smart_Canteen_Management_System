import React from "react";

type Product = {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  description?: string;
  category?: string;
  ingredients?: string;
  allergens?: string;
};

type ProductDetailModalProps = {
  show: boolean;
  handleClose: () => void;
  product: Product | null;
  addToCart: (productId: string) => void;
};

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  show,
  handleClose,
  product,
  addToCart,
}) => {
  if (!show || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="glass-panel w-full max-w-3xl">
        <div className="flex items-center justify-between border-b border-white/50 px-5 py-4">
          <h3 className="text-lg font-semibold text-slate-800">{product.name}</h3>
          <button className="text-slate-400 hover:text-slate-600" onClick={handleClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="space-y-5 px-5 py-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <img src={product.image} alt={product.name} className="h-64 w-full object-cover" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              {product.category && (
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">{product.category}</p>
              )}
              <p className="text-base font-semibold text-slate-800">₹{product.price}</p>
              <p className="text-sm text-slate-600">
                Stock: {product.quantity > 0 ? (
                  <span className="font-semibold text-emerald-600">{product.quantity} units</span>
                ) : (
                  <span className="font-semibold text-rose-500">Out of Stock</span>
                )}
              </p>
            </div>
            <div className="flex items-start">
              <button
                className="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product._id);
                  handleClose();
                }}
                disabled={product.quantity === 0}
              >
                {product.quantity === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">Description</p>
            <p className="mt-2">{product.description || "No description available."}</p>
          </div>

          {product.ingredients && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">Ingredients</p>
              <p className="mt-2">{product.ingredients}</p>
            </div>
          )}

          {product.allergens && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
              <p className="font-semibold">Allergens</p>
              <p className="mt-2 font-semibold">{product.allergens}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
