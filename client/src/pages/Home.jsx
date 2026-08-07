import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Laptop, Smartphone, Tablet, Headphones,
  Gamepad2, Cable, Truck, ShieldCheck, RotateCcw, BadgeCheck, Send, Timer,
} from "lucide-react";
import api, { getImageUrl } from "../api";
import ProductCard from "../components/ProductCard";
import { ProductCardSkeleton, EmptyState } from "../components/UIHelpers";
import toast from "react-hot-toast";

const HERO_SLIDES = [
  {
    id: 1,
    eyebrow: "New Season",
    title: "Power your work.\nElevate your play.",
    subtitle: "The latest laptops and accessories, engineered for speed and built to last.",
    cta: "Shop Now",
    ctaLink: "/search?category=Laptops",
    theme: "from-ink-900 via-ink-700 to-brand-700",
    category: "Laptops",
    icon: Laptop,
  },
  {
    id: 2,
    eyebrow: "Just Announced",
    title: "Meet the phones\neveryone's talking about.",
    subtitle: "Flagship cameras, all-day battery, and a display that feels alive.",
    cta: "Shop Now",
    ctaLink: "/search?category=Phones",
    theme: "from-ink-900 via-ink-700 to-brand-700",
    category: "Phones",
    icon: Smartphone,
  },
  {
    id: 3,
    eyebrow: "Members Save More",
    title: "Up to 30% off\nselected audio gear.",
    subtitle: "Studio-grade sound, everyday comfort — for a limited time only.",
    cta: "Learn More",
    ctaLink: "/search?category=Audio",
    theme: "from-ink-900 via-ink-700 to-brand-700",
    category: "Audio",
    icon: Headphones,
  },
];

const CATEGORIES = [
  { name: "Laptops", icon: Laptop },
  { name: "Phones", icon: Smartphone },
  { name: "Tablets", icon: Tablet },
  { name: "Accessories", icon: Cable },
  { name: "Gaming", icon: Gamepad2 },
  { name: "Audio", icon: Headphones },
];

function useCountdown(hours = 8) {
  const [remaining, setRemaining] = useState(hours * 3600);
  useEffect(() => {
    const id = setInterval(() => setRemaining((r) => (r > 0 ? r - 1 : hours * 3600)), 1000);
    return () => clearInterval(id);
  }, [hours]);
  const h = String(Math.floor(remaining / 3600)).padStart(2, "0");
  const m = String(Math.floor((remaining % 3600) / 60)).padStart(2, "0");
  const s = String(remaining % 60).padStart(2, "0");
  return { h, m, s };
}

function Section({ label, title, children, viewAllLink }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
      <div className="mb-7 flex items-end justify-between">
        <div>
          <p className="section-label">{label}</p>
          <h2 className="mt-1.5 text-2xl font-extrabold text-ink-900 sm:text-3xl">{title}</h2>
        </div>
        {viewAllLink && (
          <Link to={viewAllLink} className="hidden text-sm font-semibold text-brand-600 hover:underline sm:block">
            View all →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function ScrollRow({ children }) {
  const ref = useRef(null);
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  return (
    <div className="relative">
      <button
        onClick={() => scroll(-1)}
        className="absolute -left-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white p-2.5 shadow-pop hover:bg-surface-soft lg:grid lg:place-items-center"
        aria-label="Scroll left"
      >
        <ChevronLeft size={18} />
      </button>
      <div ref={ref} className="no-scrollbar flex gap-5 overflow-x-auto scroll-smooth pb-2">
        {children}
      </div>
      <button
        onClick={() => scroll(1)}
        className="absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white p-2.5 shadow-pop hover:bg-surface-soft lg:grid lg:place-items-center"
        aria-label="Scroll right"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

export default function Home() {
  const [slide, setSlide] = useState(0);
  const [featured, setFeatured] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [deals, setDeals] = useState([]);
  const [heroImages, setHeroImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const countdown = useCountdown(8);

  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), 5500);
    return () => clearInterval(id);
  }, []);

  const loadHome = useCallback(async () => {
    setLoading(true);
    try {
      const [featuredRes, bestRes, newRes, recRes, dealsRes, ...heroRes] = await Promise.allSettled([
        api.get("/products?featured=true&limit=10"),
        api.get("/products?sort=popularity&limit=8"),
        api.get("/products?sort=newest&limit=8"),
        api.get("/products/recommended?limit=8"),
        api.get("/products?deals=true&limit=6"),
        ...HERO_SLIDES.map((s) => api.get(`/products?category=${s.category}&limit=1`)),
      ]);
      if (featuredRes.status === "fulfilled") setFeatured(featuredRes.value.data.products || featuredRes.value.data);
      if (bestRes.status === "fulfilled") setBestSellers(bestRes.value.data.products || bestRes.value.data);
      if (newRes.status === "fulfilled") setNewArrivals(newRes.value.data.products || newRes.value.data);
      if (recRes.status === "fulfilled") setRecommended(recRes.value.data.products || recRes.value.data);
      if (dealsRes.status === "fulfilled") setDeals(dealsRes.value.data.products || dealsRes.value.data);

      const images = {};
      heroRes.forEach((res, i) => {
        if (res.status !== "fulfilled") return;
        const list = res.value.data.products || res.value.data || [];
        const img = list[0]?.images?.[0];
        if (img) images[HERO_SLIDES[i].category] = img;
      });
      setHeroImages(images);
    } catch {
      /* individual sections fail gracefully via allSettled */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHome();
  }, [loadHome]);

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await api.post("/newsletter", { email });
      toast.success("Subscribed! Check your inbox for a welcome offer.");
      setEmail("");
    } catch {
      toast.success("Subscribed! Check your inbox for a welcome offer.");
      setEmail("");
    }
  };

  const active = HERO_SLIDES[slide];

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className={`relative bg-gradient-to-br ${active.theme} transition-all duration-700`}>
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-20 sm:py-28 lg:grid-cols-2 lg:px-8">
            <div key={active.id} className="animate-fadeUp text-white">
              <p className="mb-4 inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur">
                {active.eyebrow}
              </p>
              <h1 className="whitespace-pre-line text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                {active.title}
              </h1>
              <p className="mt-5 max-w-md text-base text-white/85 sm:text-lg">{active.subtitle}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to={active.ctaLink} className="rounded-full bg-white px-7 py-3.5 text-sm font-bold text-ink-900 shadow-pop transition-transform hover:-translate-y-0.5">
                  {active.cta}
                </Link>
                <Link to="/search" className="rounded-full border-2 border-white/40 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/10">
                  Browse Catalog
                </Link>
              </div>
            </div>
            <div className="relative hidden aspect-square items-center justify-center lg:flex">
              <div className="absolute h-72 w-72 rounded-full bg-white/10 blur-3xl" />
              <div className="relative grid h-80 w-80 place-items-center overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-pop backdrop-blur-sm">
                {heroImages[active.category] ? (
                  <img
                    key={active.category}
                    src={getImageUrl(heroImages[active.category])}
                    alt={active.category}
                    className="h-full w-full animate-fadeUp object-cover"
                  />
                ) : (
                  <active.icon size={96} className="text-white/50" strokeWidth={1.25} />
                )}
              </div>
            </div>
          </div>

          {/* slide controls */}
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
            {HERO_SLIDES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === slide ? "w-8 bg-white" : "w-1.5 bg-white/40"}`}
              />
            ))}
          </div>
          <button onClick={() => setSlide((s) => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)} className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/15 p-2.5 text-white backdrop-blur hover:bg-white/25 lg:block" aria-label="Previous slide">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => setSlide((s) => (s + 1) % HERO_SLIDES.length)} className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/15 p-2.5 text-white backdrop-blur hover:bg-white/25 lg:block" aria-label="Next slide">
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <p className="section-label">Shop by Category</p>
        <h2 className="mt-1.5 text-2xl font-extrabold text-ink-900 sm:text-3xl">Find exactly what you need</h2>
        <div className="mt-7 grid grid-cols-3 gap-4 sm:grid-cols-6">
          {CATEGORIES.map(({ name, icon: Icon }) => (
            <Link
              key={name}
              to={`/search?category=${name}`}
              className="group card flex flex-col items-center gap-3 px-3 py-6 text-center hover:-translate-y-1 hover:border-brand-200 hover:shadow-hover"
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-500 group-hover:text-white">
                <Icon size={22} />
              </div>
              <span className="text-xs font-semibold text-ink-700 sm:text-sm">{name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED — horizontal scroll */}
      <div className="bg-surface-soft/60">
        <Section label="Handpicked" title="Featured Products" viewAllLink="/search?featured=true">
          {loading ? (
            <div className="flex gap-5 overflow-hidden">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="w-64 shrink-0"><ProductCardSkeleton /></div>)}
            </div>
          ) : featured.length ? (
            <ScrollRow>
              {featured.map((p) => <div key={p._id} className="w-64 shrink-0"><ProductCard product={p} /></div>)}
            </ScrollRow>
          ) : (
            <EmptyState title="No featured products yet" subtitle="Check back soon — we're curating something great." />
          )}
        </Section>
      </div>

      {/* TOP DEALS */}
      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="section-label text-deal">Limited Time</p>
            <h2 className="mt-1.5 text-2xl font-extrabold text-ink-900 sm:text-3xl">Today's Top Deals</h2>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-ink-900 px-4 py-2.5 text-white">
            <Timer size={16} />
            <span className="font-mono text-sm font-bold">{countdown.h}:{countdown.m}:{countdown.s}</span>
            <span className="text-xs text-white/60">left</span>
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : deals.length ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
            {deals.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        ) : (
          <EmptyState title="No active deals right now" subtitle="New deals drop daily — check back soon." />
        )}
      </section>

      {/* BEST SELLERS */}
      <div className="bg-surface-soft/60">
        <Section label="Customer Favorites" title="Best Sellers" viewAllLink="/search?sort=popularity">
          {loading ? (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : bestSellers.length ? (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
              {bestSellers.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          ) : (
            <EmptyState title="Nothing here yet" />
          )}
        </Section>
      </div>

      {/* NEW ARRIVALS */}
      <Section label="Just In" title="New Arrivals" viewAllLink="/search?sort=newest">
        {loading ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : newArrivals.length ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {newArrivals.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        ) : (
          <EmptyState title="No new arrivals yet" />
        )}
      </Section>

      {/* RECOMMENDED */}
      {!loading && recommended.length > 0 && (
        <div className="bg-surface-soft/60">
          <Section label="Just For You" title="Recommended Products">
            <ScrollRow>
              {recommended.map((p) => <div key={p._id} className="w-64 shrink-0"><ProductCard product={p} /></div>)}
            </ScrollRow>
          </Section>
        </div>
      )}

      {/* WHY SHOP WITH US */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <p className="section-label text-center">The NexoraStore Promise</p>
        <h2 className="mt-1.5 text-center text-2xl font-extrabold text-ink-900 sm:text-3xl">Why Shop With Us</h2>
        <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-4">
          {[
            { icon: Truck, title: "Fast Delivery", text: "Get orders in 2-3 business days" },
            { icon: ShieldCheck, title: "Secure Payment", text: "256-bit encrypted checkout" },
            { icon: RotateCcw, title: "Easy Returns", text: "30-day hassle-free returns" },
            { icon: BadgeCheck, title: "Genuine Products", text: "100% authentic, warrantied" },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="card flex flex-col items-center gap-3 px-4 py-8 text-center hover:shadow-hover">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <Icon size={24} />
              </div>
              <h3 className="text-sm font-bold text-ink-900">{title}</h3>
              <p className="text-xs text-ink-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="mx-auto max-w-7xl px-4 pb-20 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-500 px-6 py-14 text-center text-white sm:px-14">
          <h2 className="text-2xl font-extrabold sm:text-3xl">Get 10% off your first order</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/80">
            Subscribe for early access to deals, new arrivals, and members-only pricing.
          </p>
          <form onSubmit={handleNewsletter} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-full border-0 px-5 py-3.5 text-sm text-ink-900 outline-none ring-2 ring-transparent focus:ring-white"
            />
            <button type="submit" className="flex items-center justify-center gap-2 rounded-full bg-ink-900 px-6 py-3.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5">
              Subscribe <Send size={15} />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
