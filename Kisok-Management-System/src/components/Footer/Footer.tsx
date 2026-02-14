import React from "react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="glass-panel mx-auto mt-10 w-full max-w-6xl px-4 py-4 text-center text-xs text-slate-500">
      <p>&copy; {currentYear} Canteen Management System. All rights reserved.</p>
      <p className="mt-1">
        Developed with <span className="text-red-500">&#9829;</span> by{" "}
        <a className="font-semibold text-blue-600 hover:text-blue-700" href="https://github.com/sandosh-prabu-2005">
          Sandosh Prabu
        </a>
      </p>
    </footer>
  );
};

export default Footer;
