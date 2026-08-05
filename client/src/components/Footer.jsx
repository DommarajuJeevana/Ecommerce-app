import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaTruck,
  FaUndoAlt,
  FaShieldAlt,
  FaCheckCircle,
} from "react-icons/fa";

export default function Footer() {
  const trustItems = [
    { icon: FaTruck, label: "Fast Delivery" },
    { icon: FaShieldAlt, label: "Secure Payment" },
    { icon: FaUndoAlt, label: "Easy Returns" },
    { icon: FaCheckCircle, label: "Genuine Products" },
  ];

  const socialIcons = [
    FaFacebook,
    FaTwitter,
    FaInstagram,
    FaYoutube,
  ];

  return (
    <footer className="mt-20 border-t border-surface-border bg-ink-900 text-white">
      {/* Trust Strip */}
      <div className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-8 sm:grid-cols-4 lg:px-8">
          {trustItems.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon size={20} className="text-brand-400" />
              <span className="text-sm font-medium text-white/80">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Content */}
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-12 sm:grid-cols-4 lg:px-8">
        {/* Brand */}
        <div className="col-span-2 sm:col-span-1">
          <span className="text-lg font-extrabold">
            Nexora
            <span className="text-brand-400">Store</span>
          </span>

          <p className="mt-3 text-sm leading-relaxed text-white/60">
            Premium tech, delivered fast — laptops, phones, and accessories
            selected for people who care about quality.
          </p>

          <div className="mt-4 flex gap-3">
            {socialIcons.map((Icon, index) => (
              <a
                key={index}
                href="#"
                aria-label="Social"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition-colors duration-300 hover:bg-brand-500"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Company */}
        <div>
          <h4 className="mb-3 text-sm font-bold">Company</h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li>
              <Link to="/about" className="hover:text-white">
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/careers" className="hover:text-white">
                Careers
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="mb-3 text-sm font-bold">Legal</h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li>
              <Link to="/terms" className="hover:text-white">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-white">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="mb-3 text-sm font-bold">Support</h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li>
              <Link to="/orders" className="hover:text-white">
                Track Order
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white">
                Help Center
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-white">
                FAQs
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10 px-6 py-5 text-center text-xs text-white/40">
        © {new Date().getFullYear()} NexoraStore. All rights reserved.
      </div>
    </footer>
  );
}