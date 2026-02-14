import React, { useState } from "react";
import axios from "axios";

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

const UserOrderHistory = () => {
  const [orders, setOrders] = useState<Sale[]>([]);
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const fetchOrders = async (adNo: string): Promise<void> => {
    try {
      const response = await axios.get<Sale[]>("/api/sales");
      const userOrders = response.data.filter((order) => order.userId === adNo);
      setOrders(userOrders);
    } catch (error) {
      setError("Error fetching orders. Please try again.");
      setOrders([]);
    }
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!admissionNumber) {
      setError("Please enter your admission number.");
      return;
    }
    setError("");
    fetchOrders(admissionNumber);
    setShowModal(false);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold text-slate-800">Order History</h2>
        <button
          className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          onClick={handleShowModal}
        >
          Enter Admission Number
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-lg font-semibold text-slate-800">Enter Admission Number</h3>
              <button className="text-slate-400 hover:text-slate-600" onClick={handleCloseModal} aria-label="Close">
                ✕
              </button>
            </div>
            <div className="px-5 py-4">
              <form onSubmit={handleSubmit} className="space-y-3">
                <label className="text-xs font-semibold text-slate-600">Admission Number</label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  type="text"
                  value={admissionNumber}
                  onChange={(e) => setAdmissionNumber(e.target.value)}
                  placeholder="Enter your admission number"
                />
                {error && <div className="text-xs text-rose-500">{error}</div>}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    View Orders
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {orders.length > 0 ? (
        <div className="glass-card overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {orders.map((order) => (
                <tr key={order.timestamp}>
                  <td className="px-4 py-3 text-slate-700">
                    {new Date(order.timestamp).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {order.items.map((item) => (
                      <div key={item.id}>
                        {item.name} x {item.quantity}
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">₹{order.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass-panel p-10 text-center">
          <img
            src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
            alt="No orders"
            className="mx-auto h-16 w-16 opacity-70"
          />
          <h4 className="mt-4 text-lg font-semibold text-slate-700">No order history available.</h4>
          <p className="mt-2 text-sm text-slate-500">Your past orders will appear here after your first purchase!</p>
        </div>
      )}
    </div>
  );
};

export default UserOrderHistory;
