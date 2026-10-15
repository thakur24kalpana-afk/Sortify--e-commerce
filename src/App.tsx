import { FormEvent, useEffect, useMemo, useState } from "react";
import { FALLBACK_IMAGE, initialProducts } from "./data/products";
import { api } from "./services/api";
import { CATEGORIES, CartLine, Category, Page, Product } from "./types";
import { AlgorithmName, algorithmSteps, complexity, measureAlgorithms } from "./utils/algorithms";

const inr = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
const readStored = <T,>(key: string, fallback: T): T => {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; } catch { return fallback; }
};

const iconPaths: Record<string, React.ReactNode> = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />,
  cart: <><path d="M3 3h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6" /><circle cx="10" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  arrow: <path d="m9 18 6-6-6-6" />,
  check: <path d="m5 12 4 4L19 6" />,
  trash: <><path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6" /></>,
  play: <path d="m8 5 11 7-11 7V5Z" />,
  pause: <path d="M9 5v14M15 5v14" />,
  reset: <path d="M4 11a8 8 0 1 1 2.3 6M4 4v7h7" />,
  shuffle: <><path d="M3 7h3c5 0 5 10 10 10h5M18 14l3 3-3 3M3 17h3c1.5 0 2.5-.8 3.3-2M15 7h6m-3-3 3 3-3 3" /></>,
  eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
  chart: <path d="M4 19V9m6 10V5m6 14v-7m5 7H2" />,
  edit: <><path d="m4 20 4.5-1 11-11a2.1 2.1 0 0 0-3-3l-11 11L4 20Z" /><path d="m14 7 3 3" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
};

function Icon({ name, size = 20, className = "" }: { name: string; size?: number; className?: string }) {
  return <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{iconPaths[name]}</svg>;
}

function SafeImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return <img src={src} alt={alt} className={className} loading="lazy" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = FALLBACK_IMAGE; }} />;
}

function Logo({ navigate }: { navigate: (page: Page) => void }) {
  return <button onClick={() => navigate("home")} className="flex shrink-0 items-center gap-2.5" aria-label="SORTIFY home"><span className="logo-mark"><span className="h-2 w-2 rounded-full bg-white" /></span><span className="text-xl font-extrabold tracking-[-0.04em]">SORTIFY<span className="text-violet-600">.</span></span></button>;
}

function Header({ page, products, cartCount, wishlistCount, search, setSearch, navigate, selectCategory }: {
  page: Page; products: Product[]; cartCount: number; wishlistCount: number; search: string; setSearch: (value: string) => void; navigate: (page: Page) => void; selectCategory: (category: Category | "All") => void;
}) {
  const [menu, setMenu] = useState(false);
  const [focused, setFocused] = useState(false);
  const suggestions = search.trim() ? products.filter(product => `${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(search.toLowerCase())).slice(0, 5) : [];
  const submit = () => { navigate("shop"); setFocused(false); };
  return <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl">
    <div className="mx-auto flex h-17 max-w-7xl items-center gap-3 px-4 sm:px-6">
      <Logo navigate={navigate} />
      <nav className="ml-3 hidden items-center gap-1 xl:flex">
        <button onClick={() => navigate("shop")} className={`nav-link ${page === "shop" ? "nav-link-active" : ""}`}>Shop</button>
        <button onClick={() => navigate("lab")} className={`nav-link ${page === "lab" ? "nav-link-active" : ""}`}>Algorithm Lab</button>
        <button onClick={() => navigate("benchmarks")} className={`nav-link ${page === "benchmarks" ? "nav-link-active" : ""}`}>Benchmarks</button>
      </nav>
      <form onSubmit={event => { event.preventDefault(); submit(); }} className="relative ml-auto hidden min-w-0 max-w-xl flex-1 md:flex">
        <Icon name="search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={event => setSearch(event.target.value)} onFocus={() => setFocused(true)} className="h-11 min-w-0 flex-1 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 pl-11 pr-3 text-sm outline-none focus:border-violet-400 focus:bg-white" placeholder="Search products, brands and categories..." aria-label="Search products" />
        <button className="rounded-r-xl bg-slate-950 px-5 text-sm font-extrabold text-white hover:bg-violet-700">Search</button>
        {focused && search && <div className="absolute left-0 right-0 top-13 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
          {suggestions.map(product => <button type="button" key={product.id} onMouseDown={() => { setSearch(product.name); submit(); }} className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-violet-50"><SafeImage src={product.image} alt="" className="h-10 w-10 rounded-lg object-cover" /><span className="min-w-0"><b className="block truncate text-sm">{product.name}</b><small className="text-slate-400">{product.brand} · {product.category}</small></span></button>)}
          {!suggestions.length && <p className="p-3 text-sm text-slate-500">No suggestions. Press Enter to search all details.</p>}
        </div>}
      </form>
      <button onClick={() => navigate("wishlist")} className="icon-btn relative" aria-label="Wishlist"><Icon name="heart" />{wishlistCount > 0 && <span className="badge-count">{wishlistCount}</span>}</button>
      <button onClick={() => navigate("cart")} className="icon-btn relative" aria-label="Cart"><Icon name="cart" />{cartCount > 0 && <span className="badge-count">{cartCount}</span>}</button>
      <button onClick={() => navigate("auth")} className="hidden h-10 items-center gap-2 rounded-full bg-slate-950 px-3.5 text-sm font-bold text-white sm:flex"><Icon name="user" size={16} />Account</button>
      <button onClick={() => setMenu(!menu)} className="icon-btn xl:hidden" aria-label="Toggle menu"><Icon name={menu ? "close" : "menu"} /></button>
    </div>
    <form onSubmit={event => { event.preventDefault(); submit(); }} className="relative flex px-4 pb-3 md:hidden">
      <Icon name="search" size={17} className="absolute left-7 top-1/2 -translate-y-[calc(50%+6px)] text-slate-400" />
      <input value={search} onChange={event => setSearch(event.target.value)} className="h-10 min-w-0 flex-1 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 pl-10 pr-2 text-xs outline-none" placeholder="Search products, brands and categories..." />
      <button className="rounded-r-xl bg-violet-600 px-4 text-xs font-bold text-white">Search</button>
    </form>
    <div className="hidden border-t border-slate-100 lg:block"><div className="mx-auto flex max-w-7xl items-center justify-center gap-7 px-6 py-2">{CATEGORIES.map(category => <button key={category} onClick={() => selectCategory(category)} className="text-xs font-bold text-slate-500 transition hover:text-violet-600">{category}</button>)}</div></div>
    {menu && <div className="border-t border-slate-100 bg-white p-3 xl:hidden">{[["Shop", "shop"], ["Algorithm Lab", "lab"], ["Benchmarks", "benchmarks"], ["Admin demo", "admin"], ["Account", "auth"]].map(([label, target]) => <button key={target} onClick={() => { navigate(target as Page); setMenu(false); }} className="block w-full rounded-xl p-3 text-left text-sm font-bold hover:bg-violet-50">{label}</button>)}</div>}
  </header>;
}

function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-extrabold ${dark ? "bg-white/10 text-violet-200" : "bg-violet-50 text-violet-700"}`}>{children}</span>;
}

function SectionHeading({ eyebrow, title, action, onAction }: { eyebrow: string; title: string; action?: string; onAction?: () => void }) {
  return <div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-[.18em] text-violet-600">{eyebrow}</p><h2 className="mt-1 text-2xl font-extrabold tracking-[-.04em] sm:text-3xl">{title}</h2></div>{action && <button onClick={onAction} className="flex shrink-0 items-center gap-1 text-sm font-extrabold text-violet-600">{action}<Icon name="arrow" size={16} /></button>}</div>;
}

function ProductCard({ product, wished, onDetails, onCart, onWishlist }: { product: Product; wished: boolean; onDetails: () => void; onCart: () => void; onWishlist: () => void }) {
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);
  return <article className="product-card group flex h-full flex-col">
    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
      <button onClick={onDetails} className="h-full w-full"><SafeImage src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></button>
      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-extrabold text-violet-700 shadow-sm">{discount}% OFF</span>
      <button onClick={onWishlist} className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow-md transition hover:scale-105 ${wished ? "text-rose-500" : "text-slate-500"}`} aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}><Icon name="heart" size={17} className={wished ? "fill-current" : ""} /></button>
    </div>
    <div className="flex flex-1 flex-col p-4">
      <div className="flex items-center justify-between gap-2"><span className="truncate text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{product.brand} · {product.category}</span><span className="shrink-0 text-xs font-bold text-amber-500">★ {product.rating}</span></div>
      <button onClick={onDetails} className="mt-1.5 line-clamp-2 min-h-11 text-left text-base font-extrabold leading-5 hover:text-violet-600">{product.name}</button>
      <div className="mt-2 text-xs text-slate-500">{product.stock ? <span className="text-emerald-600">{product.stock < 6 ? `Only ${product.stock} left` : "In stock"}</span> : <span className="text-rose-500">Out of stock</span>} · {product.reviews} reviews</div>
      <div className="mt-3 flex items-baseline gap-2"><span className="text-lg font-extrabold">{inr(product.price)}</span><span className="text-xs text-slate-400 line-through">{inr(product.originalPrice)}</span></div>
      <button disabled={!product.stock} onClick={onCart} className="mt-4 w-full rounded-xl bg-slate-950 py-2.5 text-sm font-extrabold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500">{product.stock ? "Add to cart" : "Unavailable"}</button>
    </div>
  </article>;
}

function ProductGrid({ products, wishlist, details, addCart, toggleWishlist }: { products: Product[]; wishlist: number[]; details: (p: Product) => void; addCart: (p: Product) => void; toggleWishlist: (id: number) => void }) {
  return <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.map(product => <ProductCard key={product.id} product={product} wished={wishlist.includes(product.id)} onDetails={() => details(product)} onCart={() => addCart(product)} onWishlist={() => toggleWishlist(product.id)} />)}</div>;
}

function Home({ products, wishlist, search, setSearch, submitSearch, navigate, selectCategory, details, addCart, toggleWishlist }: {
  products: Product[]; wishlist: number[]; search: string; setSearch: (v: string) => void; submitSearch: () => void; navigate: (p: Page) => void; selectCategory: (c: Category) => void; details: (p: Product) => void; addCart: (p: Product) => void; toggleWishlist: (id: number) => void;
}) {
  const categoryImages = CATEGORIES.map(category => products.find(product => product.category === category)!);
  return <main>
    <section className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6">
      <div className="hero-grid relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-12 text-white sm:px-12 lg:min-h-[510px] lg:px-16 lg:py-16">
        <div className="relative z-10 max-w-2xl">
          <Eyebrow dark>48 curated products · 6 collections</Eyebrow>
          <h1 className="mt-6 text-5xl font-extrabold leading-[.98] tracking-[-.06em] sm:text-6xl">Discover Smarter.<br /><span className="gradient-text">Shop Better.</span></h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">Find the perfect product through intelligent discovery, meaningful filters and transparent algorithm-powered sorting.</p>
          <form onSubmit={event => { event.preventDefault(); submitSearch(); }} className="mt-8 flex max-w-xl rounded-2xl bg-white p-2 shadow-2xl">
            <Icon name="search" className="mx-3 shrink-0 self-center text-violet-600" />
            <input value={search} onChange={event => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none" placeholder="Search products, brands and categories..." />
            <button className="rounded-xl bg-violet-600 px-4 py-3 text-xs font-extrabold text-white sm:px-5 sm:text-sm">Search</button>
          </form>
          <button onClick={() => navigate("shop")} className="mt-4 flex items-center gap-2 text-sm font-extrabold text-violet-200 hover:text-white">Explore Products <Icon name="arrow" size={16} /></button>
        </div>
        <div className="absolute -bottom-16 -right-10 hidden h-[115%] w-[44%] rotate-3 overflow-hidden rounded-tl-[8rem] border border-white/10 lg:block"><SafeImage src={products[0].image} alt="Premium shopping collection" className="h-full w-full object-cover opacity-90" /></div>
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeading eyebrow="Shop your way" title="Browse every category" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {categoryImages.map(product => <button key={product.category} onClick={() => selectCategory(product.category)} className="category-image-card group">
          <SafeImage src={product.image} alt={product.category} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          <span className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-transparent" />
          <span className="absolute bottom-4 left-4 right-4 text-left text-white sm:bottom-6 sm:left-6"><b className="block text-base sm:text-xl">{product.category}</b><small className="text-white/70">8 products · Explore now</small></span>
        </button>)}
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><SectionHeading eyebrow="Trending now" title="Most-loved picks" action="View All Products" onAction={() => navigate("shop")} /><ProductGrid products={products.filter(p => p.featured).slice(0, 8)} wishlist={wishlist} details={details} addCart={addCart} toggleWishlist={toggleWishlist} /></section>
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="offer-panel grid overflow-hidden rounded-[2rem] lg:grid-cols-2">
        <div className="p-8 sm:p-12"><Eyebrow>Special edit</Eyebrow><h2 className="mt-5 text-4xl font-extrabold tracking-[-.05em]">Premium finds.<br />Smarter prices.</h2><p className="mt-4 max-w-md leading-7 text-slate-600">Explore high-rated products with meaningful savings—sorted by real catalog attributes, never paid placement.</p><button onClick={() => navigate("shop")} className="primary-btn mt-7">Shop special offers <Icon name="arrow" size={17} /></button></div>
        <SafeImage src={products.find(p => p.category === "Women's Fashion")!.image} alt="Special fashion collection" className="min-h-72 h-full w-full object-cover" />
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><SectionHeading eyebrow="New arrivals" title="Freshly added" action="Browse newest" onAction={() => navigate("shop")} /><ProductGrid products={[...products].sort((a,b) => b.createdAt-a.createdAt).slice(0,4)} wishlist={wishlist} details={details} addCart={addCart} toggleWishlist={toggleWishlist} /></section>
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><SectionHeading eyebrow="Best sellers" title="Backed by great reviews" action="View all" onAction={() => navigate("shop")} /><ProductGrid products={[...products].sort((a,b) => b.reviews-a.reviews).slice(0,4)} wishlist={wishlist} details={details} addCart={addCart} toggleWishlist={toggleWishlist} /></section>
  </main>;
}

function Shop({ products, wishlist, initialQuery, initialCategory, setGlobalSearch, details, addCart, toggleWishlist }: {
  products: Product[]; wishlist: number[]; initialQuery: string; initialCategory: Category | "All"; setGlobalSearch: (v:string) => void; details: (p:Product)=>void; addCart:(p:Product)=>void; toggleWishlist:(id:number)=>void;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<Category | "All">(initialCategory);
  const [maxPrice, setMaxPrice] = useState(80000);
  const [rating, setRating] = useState(0);
  const [stockOnly, setStockOnly] = useState(false);
  const [sort, setSort] = useState("new");
  const [limit, setLimit] = useState(12);
  const [loading, setLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  useEffect(() => { setQuery(initialQuery); setCategory(initialCategory); }, [initialQuery, initialCategory]);
  useEffect(() => { setLoading(true); const timer = setTimeout(() => setLoading(false), 180); return () => clearTimeout(timer); }, [query, category, maxPrice, rating, stockOnly, sort]);
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = products.filter(product => (!needle || `${product.name} ${product.brand} ${product.category} ${product.description}`.toLowerCase().includes(needle)) && (category === "All" || product.category === category) && product.price <= maxPrice && product.rating >= rating && (!stockOnly || product.stock > 0));
    return [...filtered].sort((a,b) => sort === "low" ? a.price-b.price : sort === "high" ? b.price-a.price : sort === "rating" ? b.rating-a.rating : sort === "name" ? a.name.localeCompare(b.name) : b.createdAt-a.createdAt);
  }, [products, query, category, maxPrice, rating, stockOnly, sort]);
  const clear = () => { setQuery(""); setGlobalSearch(""); setCategory("All"); setMaxPrice(80000); setRating(0); setStockOnly(false); setSort("new"); };
  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
    <div><Eyebrow>Complete catalog</Eyebrow><h1 className="mt-4 text-4xl font-extrabold tracking-[-.05em] sm:text-5xl">Products, intelligently sorted.</h1><p className="mt-3 text-slate-500">Search and filter all {products.length} locally stored demo products.</p></div>
    <div className="mt-7 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row">
      <label className="relative flex-1"><Icon name="search" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={event => { setQuery(event.target.value); setGlobalSearch(event.target.value); setLimit(12); }} className="input pl-10" placeholder="Search name, brand, category or description..." /></label>
      <select value={sort} onChange={event => setSort(event.target.value)} className="input sm:w-55" aria-label="Sort products"><option value="new">Newest First</option><option value="low">Price: Low to High</option><option value="high">Price: High to Low</option><option value="rating">Highest Rated</option><option value="name">Name A–Z</option></select>
      <button onClick={() => setFiltersOpen(!filtersOpen)} className="secondary-btn lg:hidden">Filters</button>
    </div>
    <div className="mt-6 grid gap-7 lg:grid-cols-[235px_1fr]">
      <aside className={`${filtersOpen ? "block" : "hidden"} h-fit rounded-2xl border border-slate-200 bg-white p-5 lg:block`}>
        <div className="flex items-center justify-between"><h2 className="font-extrabold">Filters</h2><button onClick={clear} className="text-xs font-bold text-violet-600">Clear all</button></div>
        <div className="filter-group"><p>Category</p>{(["All", ...CATEGORIES] as const).map(item => <label key={item} className="filter-check"><input type="radio" name="category" checked={category === item} onChange={() => { setCategory(item); setLimit(12); }} /><span>{item}</span><small>{item === "All" ? products.length : products.filter(p => p.category === item).length}</small></label>)}</div>
        <div className="filter-group"><div className="flex justify-between"><p>Maximum price</p><b className="text-xs text-violet-600">{inr(maxPrice)}</b></div><input type="range" min="1000" max="80000" step="1000" value={maxPrice} onChange={event => setMaxPrice(Number(event.target.value))} /><div className="mt-1 flex justify-between text-[10px] text-slate-400"><span>₹1,000</span><span>₹80,000</span></div></div>
        <div className="filter-group"><p>Minimum rating</p>{[0, 4, 4.5].map(value => <label key={value} className="filter-check"><input type="radio" name="rating" checked={rating === value} onChange={() => setRating(value)} /><span>{value ? `${value} ★ & up` : "All ratings"}</span></label>)}</div>
        <div className="filter-group"><p>Availability</p><label className="filter-check"><input type="checkbox" checked={stockOnly} onChange={event => setStockOnly(event.target.checked)} /><span>In stock only</span></label></div>
      </aside>
      <section>
        <div className="mb-5 flex items-center justify-between text-sm text-slate-500"><span><b className="text-slate-900">{results.length}</b> matching products</span>{query && <span className="hidden sm:block">Results for “{query}”</span>}</div>
        {loading ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">{Array.from({length:6},(_,i)=><div key={i} className="h-96 animate-pulse rounded-2xl bg-white"><div className="h-56 rounded-t-2xl bg-slate-200" /></div>)}</div> : results.length ? <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">{results.slice(0, limit).map(product => <ProductCard key={product.id} product={product} wished={wishlist.includes(product.id)} onDetails={() => details(product)} onCart={() => addCart(product)} onWishlist={() => toggleWishlist(product.id)} />)}</div>
          {limit < results.length && <button onClick={() => setLimit(limit + 12)} className="secondary-btn mx-auto mt-8">Load 12 more products</button>}
        </> : <EmptyState icon="search" title="No products found" text="Try another keyword or clear one of your active filters." action="Clear filters" onAction={clear} />}
      </section>
    </div>
  </main>;
}

function EmptyState({ icon, title, text, action, onAction }: { icon:string; title:string; text:string; action:string; onAction:()=>void }) {
  return <div className="grid min-h-80 place-items-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center"><div><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-violet-50 text-violet-600"><Icon name={icon} size={28} /></span><h2 className="mt-4 text-xl font-extrabold">{title}</h2><p className="mt-2 text-sm text-slate-500">{text}</p><button onClick={onAction} className="primary-btn mx-auto mt-5">{action}</button></div></div>;
}

function ProductDetails({ product, products, wished, details, addCart, toggleWishlist }: { product:Product; products:Product[]; wished:boolean; details:(p:Product)=>void; addCart:(p:Product,q:number)=>void; toggleWishlist:(id:number)=>void }) {
  const [active, setActive] = useState(0); const [quantity, setQuantity] = useState(1);
  const discount = Math.round((1-product.price/product.originalPrice)*100);
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0,4);
  useEffect(() => { setActive(0); setQuantity(1); }, [product.id]);
  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
    <p className="mb-6 text-xs text-slate-400">Home / {product.category} / <span className="text-slate-700">{product.name}</span></p>
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="grid gap-3 sm:grid-cols-[76px_1fr]"><div className="order-2 flex gap-3 sm:order-1 sm:flex-col">{product.images.map((image,index)=><button key={image} onClick={()=>setActive(index)} className={`h-18 w-18 overflow-hidden rounded-xl border-2 ${active===index?"border-violet-600":"border-transparent"}`}><SafeImage src={image} alt={`${product.name} view ${index+1}`} className="h-full w-full object-cover" /></button>)}</div><div className="order-1 aspect-square overflow-hidden rounded-[2rem] bg-slate-100 sm:order-2"><SafeImage src={product.images[active]} alt={product.name} className="h-full w-full object-cover" /></div></div>
      <div className="py-2"><Eyebrow>{discount}% off · {product.brand}</Eyebrow><h1 className="mt-5 text-4xl font-extrabold tracking-[-.05em] sm:text-5xl">{product.name}</h1><div className="mt-3 flex items-center gap-3"><b className="text-amber-500">★ {product.rating}</b><span className="text-sm text-slate-400">{product.reviews.toLocaleString("en-IN")} verified demo reviews</span></div><div className="mt-6 flex items-baseline gap-3"><span className="text-4xl font-extrabold">{inr(product.price)}</span><span className="text-lg text-slate-400 line-through">{inr(product.originalPrice)}</span></div><p className="mt-6 leading-7 text-slate-600">{product.description}</p>
        <div className={`mt-6 rounded-2xl p-4 ${product.stock?"border border-emerald-200 bg-emerald-50":"border border-rose-200 bg-rose-50"}`}><b className={product.stock?"text-emerald-800":"text-rose-700"}>{product.stock ? `${product.stock} units in local demo inventory` : "Currently out of stock"}</b></div>
        <div className="mt-6 flex flex-wrap gap-3"><div className="flex h-12 items-center rounded-xl border border-slate-200 bg-white"><button onClick={()=>setQuantity(Math.max(1,quantity-1))} className="h-full w-11 text-xl">−</button><span className="w-9 text-center font-bold">{quantity}</span><button onClick={()=>setQuantity(Math.min(product.stock || 1,quantity+1))} className="h-full w-11 text-xl">+</button></div><button disabled={!product.stock} onClick={()=>addCart(product,quantity)} className="primary-btn flex-1 justify-center disabled:bg-slate-300"><Icon name="cart" size={18}/>Add to cart</button><button onClick={()=>toggleWishlist(product.id)} className={`icon-btn h-12 w-12 border border-slate-200 ${wished?"bg-rose-50 text-rose-500":""}`} aria-label="Toggle wishlist"><Icon name="heart" className={wished?"fill-current":""}/></button></div>
        <div className="mt-8 border-t border-slate-200 pt-6"><h2 className="font-extrabold">Product specifications</h2><dl className="mt-4 grid grid-cols-2 gap-3">{Object.entries(product.specifications).map(([key,value])=><div key={key} className="rounded-xl bg-white p-3"><dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{key}</dt><dd className="mt-1 text-sm font-semibold">{value}</dd></div>)}</dl></div>
      </div>
    </div>
    <section className="mt-16"><SectionHeading eyebrow="You may also like" title={`More from ${product.category}`} /><ProductGrid products={related} wishlist={wished?[product.id]:[]} details={details} addCart={p=>addCart(p,1)} toggleWishlist={toggleWishlist}/></section>
  </main>;
}

function Wishlist({ products, wishlist, details, addCart, toggleWishlist, navigate }: { products:Product[]; wishlist:number[]; details:(p:Product)=>void; addCart:(p:Product)=>void; toggleWishlist:(id:number)=>void; navigate:(p:Page)=>void }) {
  const items=products.filter(p=>wishlist.includes(p.id));
  return <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6"><Eyebrow>Saved locally</Eyebrow><h1 className="mt-4 text-4xl font-extrabold tracking-[-.05em]">Your wishlist <span className="text-slate-300">({items.length})</span></h1><div className="mt-8">{items.length?<ProductGrid products={items} wishlist={wishlist} details={details} addCart={addCart} toggleWishlist={toggleWishlist}/>:<EmptyState icon="heart" title="Nothing saved yet" text="Tap the heart on any product to keep it here across refreshes." action="Explore products" onAction={()=>navigate("shop")}/>}</div></main>;
}

function Cart({ products, cart, setQuantity, remove, clear, navigate }: { products:Product[]; cart:CartLine[]; setQuantity:(id:number,q:number)=>void; remove:(id:number)=>void; clear:()=>void; navigate:(p:Page)=>void }) {
  const lines=cart.map(line=>({line,product:products.find(p=>p.id===line.productId)})).filter(x=>x.product) as {line:CartLine;product:Product}[];
  const subtotal=lines.reduce((sum,x)=>sum+x.product.price*x.line.quantity,0);
  return <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6"><div className="flex items-end justify-between gap-3"><div><Eyebrow>Local demo cart</Eyebrow><h1 className="mt-4 text-4xl font-extrabold tracking-[-.05em]">Shopping cart <span className="text-slate-300">({lines.length})</span></h1></div>{lines.length>0&&<button onClick={()=>{if(window.confirm("Clear every item from your cart?"))clear();}} className="text-sm font-bold text-rose-600">Clear cart</button>}</div>
    <div className="mt-8">{!lines.length?<EmptyState icon="cart" title="Your cart is empty" text="Browse the catalog and add something you love." action="Continue shopping" onAction={()=>navigate("shop")}/>:<div className="grid gap-7 lg:grid-cols-[1fr_370px]"><div className="space-y-4">{lines.map(({line,product})=><article key={product.id} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:gap-6"><SafeImage src={product.image} alt={product.name} className="h-28 w-24 rounded-xl object-cover sm:h-36 sm:w-36"/><div className="flex min-w-0 flex-1 flex-col"><span className="text-xs font-bold text-violet-600">{product.category}</span><h2 className="mt-1 truncate text-lg font-extrabold">{product.name}</h2><span className="mt-1 text-sm text-slate-400">{inr(product.price)} each</span><div className="mt-auto flex items-center justify-between"><div className="flex items-center rounded-lg border border-slate-200"><button onClick={()=>setQuantity(product.id,Math.max(1,line.quantity-1))} className="h-9 w-9">−</button><span className="w-8 text-center text-sm font-bold">{line.quantity}</span><button onClick={()=>setQuantity(product.id,Math.min(product.stock,line.quantity+1))} className="h-9 w-9">+</button></div><div className="flex items-center gap-4"><b>{inr(product.price*line.quantity)}</b><button onClick={()=>{if(window.confirm(`Remove ${product.name} from cart?`))remove(product.id);}} className="text-slate-400 hover:text-rose-500" aria-label="Remove product"><Icon name="trash" size={18}/></button></div></div></div></article>)}</div>
      <aside className="h-fit rounded-3xl bg-slate-950 p-6 text-white"><h2 className="text-xl font-extrabold">Order summary</h2><div className="mt-6 space-y-4 border-b border-white/10 pb-5 text-sm"><div className="flex justify-between text-slate-400"><span>Subtotal</span><b className="text-white">{inr(subtotal)}</b></div><div className="flex justify-between text-slate-400"><span>Estimated delivery</span><b className="text-emerald-400">Free</b></div></div><div className="my-5 flex items-end justify-between"><span className="font-bold">Grand total</span><b className="text-3xl">{inr(subtotal)}</b></div><button onClick={()=>alert("Checkout is intentionally disabled in local demo mode. Connect the documented FastAPI service to process orders securely.")} className="w-full rounded-xl bg-violet-600 py-3.5 font-extrabold hover:bg-violet-500">Review demo checkout</button><p className="mt-4 text-center text-xs leading-5 text-slate-500">No payment or order will be processed. Backend not connected.</p><button onClick={()=>navigate("shop")} className="mt-3 w-full text-center text-sm font-bold text-violet-300">Continue shopping</button></aside></div>}</div>
  </main>;
}

function AlgorithmLab({ products }: { products:Product[] }) {
  const names:AlgorithmName[]=["Linear Search","Binary Search","Bubble Sort","Selection Sort","Merge Sort","Quick Sort"];
  const [name,setName]=useState<AlgorithmName>("Bubble Sort"); const [sample,setSample]=useState(()=>products.slice(0,12).map(p=>p.price)); const [target,setTarget]=useState(sample[5]); const [index,setIndex]=useState(0); const [playing,setPlaying]=useState(false); const [speed,setSpeed]=useState(450);
  const steps=useMemo(()=>algorithmSteps(name,sample,target),[name,sample,target]); const current=steps[index]||{values:sample,active:[],sorted:[],message:"Ready",comparisons:0,swaps:0};
  useEffect(()=>{if(!playing)return;const timer=window.setInterval(()=>setIndex(value=>{if(value>=steps.length-1){setPlaying(false);return value;}return value+1;}),speed);return()=>clearInterval(timer);},[playing,speed,steps.length]);
  const reset=()=>{setPlaying(false);setIndex(0);}; const generate=()=>{const pool=[...products].sort(()=>Math.random()-.5).slice(0,12).map(p=>p.price);setSample(pool);setTarget(pool[Math.floor(Math.random()*pool.length)]);reset();};
  const max=Math.max(...current.values);
  return <main className="min-h-screen bg-slate-950 text-white"><div className="mx-auto max-w-7xl px-4 py-12 sm:px-6"><Eyebrow dark>Core academic feature · Real product prices</Eyebrow><div className="mt-5 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><h1 className="text-4xl font-extrabold tracking-[-.05em] sm:text-5xl">Algorithm <span className="gradient-text">Lab.</span></h1><p className="mt-3 max-w-2xl text-slate-400">Execute genuine search and sort logic step by step. Each bar is an actual catalog price.</p></div><select value={name} onChange={event=>{setName(event.target.value as AlgorithmName);reset();}} className="h-12 rounded-xl border border-white/10 bg-white/10 px-4 text-sm font-bold text-white outline-none">{names.map(item=><option key={item} className="bg-slate-900">{item}</option>)}</select></div>
    <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_290px]"><section className="visualizer-panel"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5"><div><p className="text-xs font-bold text-violet-300">STEP {Math.min(index+1,steps.length)} OF {steps.length}</p><h2 className="mt-1 font-extrabold">{name}</h2></div><div className="flex gap-2"><button onClick={generate} className="algo-control"><Icon name="shuffle" size={16}/>New data</button><button onClick={reset} className="algo-control"><Icon name="reset" size={16}/>Reset</button></div></div>
      <div className="flex h-80 items-end gap-2 px-4 pt-10 sm:gap-3">{current.values.map((value,i)=><div key={`${i}-${value}`} className="flex h-full min-w-0 flex-1 flex-col justify-end"><span className={`mb-2 hidden text-center text-[9px] font-bold sm:block ${current.active.includes(i)?"text-violet-300":"text-slate-500"}`}>{Math.round(value/1000)}k</span><div className={`bar ${current.active.includes(i)?"bar-active":""} ${current.sorted.includes(i)?"bar-sorted":""}`} style={{height:`${Math.max(8,value/max*100)}%`}}/></div>)}</div>
      <div className="mx-5 mt-5 rounded-xl border border-violet-400/20 bg-violet-400/10 p-4 text-sm text-violet-100">{current.message}</div>
      <div className="flex flex-wrap items-center gap-3 p-5"><button onClick={()=>setPlaying(!playing)} className="flex h-11 items-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-extrabold"><Icon name={playing?"pause":"play"} size={17}/>{playing?"Pause":index?"Resume":"Start"}</button><label className="flex items-center gap-2 text-xs font-bold text-slate-400">Speed<input type="range" min="80" max="900" value={980-speed} onChange={e=>setSpeed(980-Number(e.target.value))} className="w-24 accent-violet-500"/></label>{name.includes("Search")&&<label className="ml-auto text-xs text-slate-400">Target <select value={target} onChange={e=>{setTarget(Number(e.target.value));reset();}} className="ml-2 rounded-lg bg-white/10 p-2 text-white">{sample.map((v,i)=><option key={`${v}-${i}`} value={v} className="bg-slate-900">{inr(v)}</option>)}</select></label>}</div>
    </section><aside className="space-y-4">{[["Comparisons",current.comparisons],["Swaps / moves",current.swaps],["Elapsed animation",`${(index*speed/1000).toFixed(2)}s`],["Final result",index===steps.length-1?"Complete":"In progress"]].map(([label,value])=><div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-5"><span className="text-xs text-slate-500">{label}</span><p className="mt-2 text-2xl font-extrabold text-violet-300">{value}</p></div>)}</aside></div>
    <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{Object.entries(complexity[name]).map(([key,value])=><div key={key} className="rounded-2xl border border-white/10 bg-white/5 p-5"><span className="text-xs capitalize text-slate-500">{key} complexity</span><b className="mt-2 block text-lg text-emerald-300">{value}</b></div>)}</section></div></main>;
}

type BenchRow=ReturnType<typeof measureAlgorithms>[number];
function Benchmarks() {
  const [rows,setRows]=useState<BenchRow[]>([]); const [running,setRunning]=useState(false);
  const run=()=>{setRunning(true);requestAnimationFrame(()=>setTimeout(()=>{setRows(measureAlgorithms([100,300,600,1000,1500]));setRunning(false);},20));};
  useEffect(()=>run(),[]);
  const algorithms:[keyof Pick<BenchRow,"quick"|"merge"|"selection"|"linear"|"binary">,string,string][]=[["quick","Native numeric sort","#7c3aed"],["merge","Merge Sort","#2563eb"],["selection","Selection Sort","#db2777"],["linear","Linear Search","#059669"],["binary","Binary Search","#d97706"]];
  const max=Math.max(.001,...rows.flatMap(row=>algorithms.map(([key])=>row[key])));
  return <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><Eyebrow>Browser-dependent measurements</Eyebrow><h1 className="mt-4 text-4xl font-extrabold tracking-[-.05em] sm:text-5xl">Performance dashboard.</h1><p className="mt-3 max-w-2xl text-slate-500">Measured locally with performance.now(). Results vary by browser, hardware, load and JavaScript engine.</p></div><button onClick={run} disabled={running} className="primary-btn disabled:bg-slate-400"><Icon name="chart" size={17}/>{running?"Measuring…":"Run benchmarks"}</button></div>
    <section className="mt-8 overflow-x-auto rounded-3xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-extrabold">Input size vs execution time</h2><div className="mt-8 min-w-[650px] space-y-7">{rows.map(row=><div key={row.size}><p className="mb-2 text-xs font-extrabold text-slate-500">{row.size.toLocaleString()} items</p><div className="space-y-2">{algorithms.map(([key,label,color])=><div key={key} className="grid grid-cols-[130px_1fr_80px] items-center gap-3 text-xs"><span>{label}</span><div className="h-5 rounded-full bg-slate-100"><div className="h-full min-w-1 rounded-full transition-all duration-500" style={{width:`${Math.max(1,row[key]/max*100)}%`,background:color}}/></div><b className="text-right">{row[key].toFixed(3)} ms</b></div>)}</div></div>)}</div></section>
    <div className="mt-6 grid gap-5 lg:grid-cols-2"><section className="rounded-3xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-extrabold">Selection Sort comparisons</h2><p className="mt-1 text-sm text-slate-500">Actual loop comparison count from the same benchmark run.</p><div className="mt-6 flex h-52 items-end gap-4">{rows.map(row=><div key={row.size} className="flex h-full flex-1 flex-col justify-end"><span className="mb-2 text-center text-[10px] font-bold">{row.comparisons.toLocaleString()}</span><div className="chart-bar" style={{height:`${row.comparisons/Math.max(...rows.map(r=>r.comparisons))*100}%`}}/><span className="mt-2 text-center text-[10px] text-slate-400">{row.size}</span></div>)}</div></section><section className="rounded-3xl bg-slate-950 p-6 text-white"><Eyebrow dark>How to interpret</Eyebrow><h2 className="mt-4 text-2xl font-extrabold">Measurements, not promises.</h2><p className="mt-3 text-sm leading-6 text-slate-400">Very fast operations can approach timer resolution and appear noisy. Run the benchmark repeatedly and compare growth trends—not a single number. Native numeric sort is labelled honestly because JavaScript engines choose their own optimized implementation.</p><div className="mt-6 grid grid-cols-3 gap-3">{[["Best","Minimum work"],["Average","Typical input"],["Worst","Maximum work"]].map(([a,b])=><div key={a} className="rounded-xl bg-white/5 p-3"><b className="text-violet-300">{a}</b><span className="mt-1 block text-[10px] text-slate-500">{b}</span></div>)}</div></section></div>
  </main>;
}

function Admin({ products, setProducts, toast }: { products:Product[]; setProducts:React.Dispatch<React.SetStateAction<Product[]>>; toast:(text:string)=>void }) {
  const blank={name:"",brand:"",category:"Electronics" as Category,price:"",stock:"",image:""}; const [form,setForm]=useState(blank); const [editing,setEditing]=useState<number|null>(null); const [open,setOpen]=useState(false); const [query,setQuery]=useState(""); const filtered=products.filter(p=>`${p.name} ${p.brand}`.toLowerCase().includes(query.toLowerCase()));
  const submit=(event:FormEvent)=>{event.preventDefault();const price=Number(form.price),stock=Number(form.stock);if(!form.name.trim()||!form.brand.trim()||price<=0||stock<0){toast("Please complete every required field with valid values.");return;} if(editing){setProducts(items=>items.map(p=>p.id===editing?{...p,name:form.name,brand:form.brand,category:form.category,price,stock,image:form.image||p.image,images:form.image?[form.image,...p.images.slice(1)]:p.images}:p));toast("Product updated in local demo storage.");}else{const base=products.find(p=>p.category===form.category)!;const product:Product={...base,id:Math.max(...products.map(p=>p.id))+1,name:form.name,brand:form.brand,price,originalPrice:Math.round(price*1.2),stock,image:form.image||base.image,images:[form.image||base.image,...base.images.slice(1)],createdAt:Date.now(),reviews:0,rating:4.5,featured:false};setProducts(items=>[product,...items]);toast("Product added to local demo storage.");}setForm(blank);setEditing(null);setOpen(false);};
  const edit=(product:Product)=>{setEditing(product.id);setForm({name:product.name,brand:product.brand,category:product.category,price:String(product.price),stock:String(product.stock),image:product.image});setOpen(true);};
  const remove=(product:Product)=>{if(window.confirm(`Delete ${product.name} from this local demo?`)){setProducts(items=>items.filter(p=>p.id!==product.id));toast("Product deleted from local demo storage.");}};
  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><b>Local administration demo:</b> changes are stored only in this browser. Secure server-side authentication and PostgreSQL persistence require the FastAPI integration layer.</div><div className="mt-7 flex flex-wrap items-end justify-between gap-4"><div><Eyebrow>Demo operations</Eyebrow><h1 className="mt-3 text-4xl font-extrabold tracking-[-.05em]">Catalog administration.</h1></div><button onClick={()=>{setEditing(null);setForm(blank);setOpen(!open);}} className="primary-btn"><Icon name="plus" size={17}/>Add product</button></div>
    <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Products",products.length],["Categories",CATEGORIES.length],["Low stock",products.filter(p=>p.stock>0&&p.stock<6).length],["Out of stock",products.filter(p=>!p.stock).length]].map(([label,value])=><article key={label} className="rounded-2xl border border-slate-200 bg-white p-5"><span className="text-sm text-slate-500">{label}</span><b className="mt-3 block text-3xl">{value}</b></article>)}</div>
    {open&&<form onSubmit={submit} className="mt-6 rounded-3xl border border-violet-200 bg-white p-6 shadow-lg"><div className="flex items-center justify-between"><h2 className="text-xl font-extrabold">{editing?"Edit product":"Add product"}</h2><button type="button" onClick={()=>setOpen(false)} className="icon-btn"><Icon name="close"/></button></div><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><label className="form-label">Product name *<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="input mt-2" required/></label><label className="form-label">Brand *<input value={form.brand} onChange={e=>setForm({...form,brand:e.target.value})} className="input mt-2" required/></label><label className="form-label">Category *<select value={form.category} onChange={e=>setForm({...form,category:e.target.value as Category})} className="input mt-2">{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></label><label className="form-label">Price (₹) *<input type="number" min="1" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} className="input mt-2" required/></label><label className="form-label">Stock *<input type="number" min="0" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} className="input mt-2" required/></label><label className="form-label">Image URL (optional)<input type="url" value={form.image} onChange={e=>setForm({...form,image:e.target.value})} className="input mt-2"/></label></div><button className="primary-btn mt-5">{editing?"Save changes":"Add product"}</button></form>}
    <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white"><div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"><h2 className="text-xl font-extrabold">Product management</h2><label className="relative"><Icon name="search" size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} className="input pl-9 sm:w-72" placeholder="Search products..."/></label></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-400"><tr><th className="px-6 py-3">PRODUCT</th><th>CATEGORY</th><th>PRICE</th><th>STOCK</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>{filtered.map(product=><tr key={product.id} className="border-t border-slate-100"><td className="px-6 py-3"><div className="flex items-center gap-3"><SafeImage src={product.image} alt="" className="h-11 w-11 rounded-lg object-cover"/><div><b className="block">{product.name}</b><small className="text-slate-400">{product.brand}</small></div></div></td><td>{product.category}</td><td className="font-bold">{inr(product.price)}</td><td>{product.stock}</td><td><span className={`rounded-full px-2 py-1 text-xs font-bold ${!product.stock?"bg-rose-50 text-rose-700":product.stock<6?"bg-amber-50 text-amber-700":"bg-emerald-50 text-emerald-700"}`}>{!product.stock?"Out":product.stock<6?"Low":"Active"}</span></td><td><div className="flex gap-2"><button onClick={()=>edit(product)} className="icon-btn h-8 w-8 text-violet-600" aria-label="Edit"><Icon name="edit" size={16}/></button><button onClick={()=>remove(product)} className="icon-btn h-8 w-8 text-rose-500" aria-label="Delete"><Icon name="trash" size={16}/></button></div></td></tr>)}</tbody></table></div></section>
  </main>;
}

function Auth({ toast }: { toast:(text:string)=>void }) {
  const [register,setRegister]=useState(false);const [show,setShow]=useState(false);const [success,setSuccess]=useState(false);const [error,setError]=useState("");
  const submit=(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();const data=new FormData(event.currentTarget),email=String(data.get("email")),password=String(data.get("password"));if(!email.includes("@")||password.length<8){setError("Enter a valid email and a password with at least 8 characters.");return;}setError("");setSuccess(true);toast("Demo form validated. No credentials were stored or transmitted.");};
  return <main className="grid min-h-[calc(100vh-110px)] lg:grid-cols-2"><section className="hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between"><Eyebrow dark>Demo authentication</Eyebrow><div><h1 className="text-5xl font-extrabold tracking-[-.06em]">A smarter account<br/>experience.</h1><p className="mt-5 max-w-md leading-7 text-slate-400">This interface validates inputs only. Connect the API service to FastAPI with secure password hashing and protected sessions for real authentication.</p></div><p className="text-xs text-slate-500">No passwords are stored in localStorage.</p></section><section className="grid place-items-center bg-white p-6"><div className="w-full max-w-md">{success?<div className="text-center"><span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Icon name="check" size={34}/></span><h1 className="mt-5 text-3xl font-extrabold">Demo validation complete.</h1><p className="mt-2 text-slate-500">No account was created because a backend is not connected.</p><button onClick={()=>setSuccess(false)} className="primary-btn mx-auto mt-6">Back to form</button></div>:<><Eyebrow>{register?"Demo registration":"Demo login"}</Eyebrow><h1 className="mt-5 text-4xl font-extrabold tracking-[-.05em]">{register?"Create an account.":"Welcome back."}</h1><p className="mt-2 text-sm text-slate-500">UI demonstration only — no credentials are persisted.</p><form onSubmit={submit} className="mt-8 space-y-4">{register&&<label className="form-label">Full name<input name="name" className="input mt-2" required minLength={2}/></label>}<label className="form-label">Email address<input name="email" type="email" className="input mt-2" required/></label><label className="form-label">Password<div className="relative mt-2"><input name="password" type={show?"text":"password"} className="input pr-11" required minLength={8}/><button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" aria-label="Toggle password visibility"><Icon name="eye" size={18}/></button></div></label>{error&&<p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}<button className="primary-btn w-full justify-center">{register?"Validate registration":"Validate login"}</button></form><p className="mt-6 text-center text-sm text-slate-500">{register?"Already registered?":"Need an account?"} <button onClick={()=>setRegister(!register)} className="font-extrabold text-violet-600">{register?"Sign in":"Register"}</button></p></>}</div></section></main>;
}

function Footer({ navigate }: { navigate:(p:Page)=>void }) {
  return <footer className="mt-14 border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 py-10 sm:flex-row sm:items-center sm:px-6"><div><Logo navigate={navigate}/><p className="mt-3 text-sm text-slate-500">A local-first college project demonstration.</p></div><div className="flex flex-wrap gap-5 text-sm font-bold text-slate-500"><button onClick={()=>navigate("shop")}>Shop</button><button onClick={()=>navigate("lab")}>Algorithm Lab</button><button onClick={()=>navigate("benchmarks")}>Benchmarks</button><button onClick={()=>navigate("admin")}>Admin demo</button></div></div><div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">React + Tailwind frontend · FastAPI/PostgreSQL integration points prepared · No backend currently connected</div></footer>;
}

export default function App() {
  const [page,setPage]=useState<Page>("home");
  const [products,setProducts]=useState<Product[]>(()=>readStored("sortify-products",initialProducts));
  const [cart,setCart]=useState<CartLine[]>(()=>readStored("sortify-cart",[]));
  const [wishlist,setWishlist]=useState<number[]>(()=>readStored("sortify-wishlist",[]));
  const [selectedId,setSelectedId]=useState(1);
  const [search,setSearch]=useState("");
  const [category,setCategory]=useState<Category|"All">("All");
  const [toastText,setToastText]=useState("");
  useEffect(()=>localStorage.setItem("sortify-products",JSON.stringify(products)),[products]);
  useEffect(()=>localStorage.setItem("sortify-cart",JSON.stringify(cart)),[cart]);
  useEffect(()=>localStorage.setItem("sortify-wishlist",JSON.stringify(wishlist)),[wishlist]);
  useEffect(()=>{if(!toastText)return;const timer=setTimeout(()=>setToastText(""),2600);return()=>clearTimeout(timer);},[toastText]);
  const toast=(text:string)=>setToastText(text);
  const navigate=(target:Page)=>{setPage(target);window.scrollTo({top:0,behavior:"smooth"});};
  const selectCategory=(value:Category|"All")=>{setCategory(value);setSearch("");navigate("shop");};
  const details=(product:Product)=>{setSelectedId(product.id);navigate("product");};
  const addCart=(product:Product,quantity=1)=>{if(!product.stock){toast("This product is currently unavailable.");return;}setCart(lines=>lines.some(line=>line.productId===product.id)?lines.map(line=>line.productId===product.id?{...line,quantity:Math.min(product.stock,line.quantity+quantity)}:line):[...lines,{productId:product.id,quantity:Math.min(product.stock,quantity)}]);toast(`${product.name} added to cart.`);};
  const toggleWishlist=(id:number)=>{setWishlist(items=>items.includes(id)?items.filter(item=>item!==id):[...items,id]);toast(wishlist.includes(id)?"Removed from wishlist.":"Saved to wishlist.");};
  const selected=products.find(product=>product.id===selectedId)||products[0];
  const cartCount=cart.reduce((sum,line)=>sum+line.quantity,0);
  return <div className="min-h-screen bg-[#f8f7ff] text-slate-900">
    <Header page={page} products={products} cartCount={cartCount} wishlistCount={wishlist.length} search={search} setSearch={setSearch} navigate={navigate} selectCategory={selectCategory}/>
    {page==="home"&&<Home products={products} wishlist={wishlist} search={search} setSearch={setSearch} submitSearch={()=>navigate("shop")} navigate={navigate} selectCategory={selectCategory} details={details} addCart={product=>addCart(product)} toggleWishlist={toggleWishlist}/>}
    {page==="shop"&&<Shop products={products} wishlist={wishlist} initialQuery={search} initialCategory={category} setGlobalSearch={setSearch} details={details} addCart={product=>addCart(product)} toggleWishlist={toggleWishlist}/>}
    {page==="product"&&<ProductDetails product={selected} products={products} wished={wishlist.includes(selected.id)} details={details} addCart={addCart} toggleWishlist={toggleWishlist}/>}
    {page==="wishlist"&&<Wishlist products={products} wishlist={wishlist} details={details} addCart={product=>addCart(product)} toggleWishlist={toggleWishlist} navigate={navigate}/>}
    {page==="cart"&&<Cart products={products} cart={cart} setQuantity={(id,quantity)=>setCart(lines=>lines.map(line=>line.productId===id?{...line,quantity}:line))} remove={id=>setCart(lines=>lines.filter(line=>line.productId!==id))} clear={()=>setCart([])} navigate={navigate}/>}
    {page==="lab"&&<AlgorithmLab products={products}/>}
    {page==="benchmarks"&&<Benchmarks/>}
    {page==="admin"&&<Admin products={products} setProducts={setProducts} toast={toast}/>}
    {page==="auth"&&<Auth toast={toast}/>}
    {!["lab","auth"].includes(page)&&<Footer navigate={navigate}/>}
    {toastText&&<div role="status" className="fixed bottom-5 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-2xl"><Icon name="check" size={16} className="text-emerald-400"/>{toastText}</div>}
    {!api.configured&&<span className="sr-only">Local demo mode: backend API is not connected.</span>}
  </div>;
}
