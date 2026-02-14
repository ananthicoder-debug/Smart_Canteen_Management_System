import React, { useEffect, useState } from "react";

type Product = {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  reason?: string;
};

type HomePageProps = {
  recommendations: Product[];
  addToCart: (productId: string) => void;
};

const HomePage: React.FC<HomePageProps> = ({ recommendations, addToCart }) => {
  return (
    <>
      {recommendations.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold text-slate-800">Recommended for you</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recommendations.map((product) => (
              <div key={product._id} className="glass-card flex h-full flex-col overflow-hidden">
                <img
                  src={product.image}
                  className="h-32 w-full rounded-t-2xl object-cover"
                  alt={product.name}
                />
                <div className="flex min-h-[160px] flex-1 flex-col gap-2 px-4 py-3">
                  <h5 className="text-base font-semibold text-slate-800">{product.name}</h5>
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">Price:</span> ₹{product.price}
                  </p>
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">Quantity:</span> {product.quantity}
                  </p>
                  {product.reason && (
                    <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
                      <span className="font-semibold">Why?</span> {product.reason}
                    </div>
                  )}
                  <div className="mt-auto">
                    <button
                      className="w-full rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      onClick={() => addToCart(product._id)}
                      disabled={product.quantity === 0}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-panel mx-auto mb-10 max-w-4xl p-6">
        <div className="flex flex-col items-center gap-6 md:flex-row">
          <img
            src={process.env.PUBLIC_URL + "/mepco-logo.png"}
            alt="Mepco College Logo"
            className="h-24 w-24 rounded-2xl bg-white object-contain shadow"
          />
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              About Mepco Schlenk Engineering College
            </h2>
            <div className="mt-3 flex flex-wrap gap-4">
              <Counter label="Years of Excellence" value={40} />
              <Counter label="Students" value={4000} />
              <Counter label="Placements" value={50000} />
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-600">
          Mepco Schlenk Engineering College, Sivakasi, is a premier institution in Tamil Nadu, India, known for its academic
          excellence, vibrant campus life, and commitment to innovation. The college offers a wide range of undergraduate and
          postgraduate programs in engineering, technology, and management, and is recognized for its state-of-the-art facilities,
          experienced faculty, and strong industry connections. Mepco fosters holistic development, research, and entrepreneurship,
          making it a top choice for aspiring engineers and technologists.
        </p>
        <LearnMoreSection />
        <CollegeCarousel />
      </div>
    </>
  );
};

const Counter = ({ label, value }: { label: string; value: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    const incrementTime = 20;
    const step = Math.ceil(end / 50);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setCount(start);
    }, incrementTime);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="glass-card px-4 py-3 text-center">
      <div className="text-lg font-semibold text-slate-800">{count.toLocaleString()}</div>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
};

const LearnMoreSection = () => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mt-4">
      <button
        className="rounded-full border border-blue-200 px-4 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        {expanded ? "Hide Details" : "Learn More"}
      </button>
      {expanded && (
        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <ul className="list-disc space-y-1 pl-5">
            <li>NBA & NAAC accredited programs</li>
            <li>Strong placement record with top MNCs</li>
            <li>Active research and innovation centers</li>
            <li>Vibrant student clubs and technical societies</li>
            <li>Beautiful, green, Wi-Fi enabled campus</li>
          </ul>
        </div>
      )}
    </div>
  );
};

const CollegeCarousel = () => {
  const highlights = [
    { img: process.env.PUBLIC_URL + "/mepco-logo.png", caption: "Proud Heritage" },
    { img: "https://www.mepcoeng.ac.in/images/gallery/infra/infra1.jpg", caption: "Modern Infrastructure" },
    { img: "https://www.mepcoeng.ac.in/images/gallery/placement/placement1.jpg", caption: "Excellent Placements" },
    { img: "https://www.mepcoeng.ac.in/images/gallery/campus/campus1.jpg", caption: "Green Campus" },
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIdx((i) => (i + 1) % highlights.length), 3500);
    return () => clearInterval(timer);
  }, [highlights.length]);

  return (
    <div className="mt-6 flex flex-col items-center">
      <div className="w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm md:max-w-xl">
        <img src={highlights[idx].img} alt={highlights[idx].caption} className="h-48 w-full object-cover" />
      </div>
      <div className="mt-2 text-sm font-semibold text-slate-700">{highlights[idx].caption}</div>
      <div className="mt-2 flex gap-2">
        {highlights.map((_, i) => (
          <span
            key={i}
            className={`h-2.5 w-2.5 rounded-full ${idx === i ? "bg-blue-600" : "bg-slate-300"}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
