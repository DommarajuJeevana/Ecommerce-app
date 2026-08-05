import { useLocation } from "react-router-dom";

const CONTENT = {
  "/about": {
    title: "About NexoraStore",
    body: "NexoraStore brings you premium laptops, phones, and accessories from trusted brands, backed by fast delivery, secure payments, and genuine products — every time.",
  },
  "/contact": {
    title: "Contact Us",
    body: "Have a question about an order or a product? Reach our support team at support@nexorastore.com and we'll get back to you within 24 hours.",
  },
  "/careers": {
    title: "Careers",
    body: "We're always looking for people who care about great products and great service. Check back soon for open roles.",
  },
  "/terms": {
    title: "Terms of Service",
    body: "By using NexoraStore, you agree to our terms covering purchases, returns, account use, and acceptable behavior on our platform. Full legal terms available on request.",
  },
  "/privacy": {
    title: "Privacy Policy",
    body: "We collect only the information needed to process your orders and improve your experience, and we never sell your personal data to third parties.",
  },
};

export default function StaticPage() {
  const { pathname } = useLocation();
  const page = CONTENT[pathname] || { title: "NexoraStore", body: "" };

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
      <h1 className="mb-4 text-2xl font-extrabold text-ink-900 sm:text-3xl">{page.title}</h1>
      <p className="text-sm leading-relaxed text-ink-500">{page.body}</p>
    </div>
  );
}
