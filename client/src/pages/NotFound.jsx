import { Link } from "react-router-dom";
import { Home, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 grid h-24 w-24 place-items-center rounded-full bg-brand-50">
        <SearchX size={40} className="text-brand-400" />
      </div>
      <h1 className="text-6xl font-extrabold text-ink-900">404</h1>
      <p className="mt-3 text-lg font-bold text-ink-900">Page not found</p>
      <p className="mt-1 max-w-sm text-sm text-ink-500">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/" className="btn-primary mt-7"><Home size={15} /> Back to Home</Link>
    </div>
  );
}
