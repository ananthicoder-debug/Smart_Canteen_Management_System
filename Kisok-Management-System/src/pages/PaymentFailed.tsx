import React from "react";
import { Link, useLocation } from "react-router-dom";

const PaymentFailed: React.FC = () => {
  const loc = useLocation();
  const params = new URLSearchParams(loc.search);
  const reason = params.get("reason") || "";

  return (
    <div className="py-12">
      <div className="mx-auto w-full max-w-md glass-panel p-6 text-center">
        <h2 className="text-2xl font-semibold text-rose-600">Payment Failed</h2>
        <p className="mt-4 text-sm text-slate-600">
          {reason ? `Reason: ${reason}` : "Your payment could not be completed."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/menu" className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">Try Again</Link>
          <Link to="/" className="rounded-lg border px-4 py-2 text-sm">Home</Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
