"use client";

import { useEffect, useMemo, useState } from "react";
import { categoryLabels, money, products, type Category, type Product } from "./catalog-data";
import { localizeProduct } from "./catalog-i18n";

type View = "home" | "catalog" | Category | "favorites" | "cart";
type Cart = Record<string, number>;
type SavedOrder = { id: string; createdAt: string; total: number; status: "processing"; items: { id: string; quantity: number }[] };
type CheckoutProfile = { name: string; phone: string; email: string; city: string; deliveryAddress: string };

function normalizeUaPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("380")) return `+${digits.slice(0, 12)}`;
  if (digits.startsWith("0")) return `+38${digits.slice(0, 10)}`;
  if (digits.startsWith("80")) return `+3${digits.slice(0, 11)}`;
  return `+380${digits.slice(0, 9)}`;
}

function completeEmail(value: string, domain = "gmail.com") {
  const clean = value.trim().replace(/\s/g, "");
  return clean && !clean.includes("@") ? `${clean}@${domain}` : clean;
}

function setEmailDomain(button: HTMLButtonElement, domain: string) {
  const input = button.closest("label")?.querySelector("input");
  if (!input) return;
  input.value = completeEmail(input.value.split("@")[0], domain);
  input.focus();
}

function usePageScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const scrollY = window.scrollY;
    const body = document.body;
    const root = document.documentElement;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
      rootOverflow: root.style.overflow,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    root.style.overflow = "hidden";
    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      root.style.overflow = previous.rootOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}
type Locale = "uk" | "ru";

const copy = {
  uk: {
    face: "Для обличчя", body: "Для тіла", makeup: "Макіяж", faceMassagers: "Масажери для обличчя", bodyMassagers: "Масажери для тіла",
    new: "Новинки", about: "Філософія бренду", search: "Пошук", searchTitle: "Пошук у Diva Rituals", searchPlaceholder: "Крем, блиск, олівець...",
    noResults: "На жаль, такого товару поки немає. Можливо, він скоро з’явиться ♡", manager: "Менеджерка Diva", response: "Зазвичай відповідає протягом 5 хвилин",
    greeting: "Вітаю! Я допоможу обрати догляд, відтінок або оформити замовлення ♡", messagePlaceholder: "Напишіть повідомлення...",
    demoMessage: "Дякуємо! Це демо: повідомлення збережено лише на цьому пристрої й поки не надсилається менеджерці.",
    catalog: "Каталог", help: "Допомога", contacts: "Контакти", delivery: "Доставка й оплата", returns: "Повернення", faq: "Поширені питання",
    stay: "Залишаймося на зв'язку", news: "Новини, ритуали та красиві запуски — без зайвого шуму.", email: "Ваш email", subscribe: "Підписатися →",
    subscribed: "Дякуємо! Email збережено на цьому пристрої ♡", favorites: "Обране", home: "Головна",
  },
  ru: {
    face: "Для лица", body: "Для тела", makeup: "Макияж", faceMassagers: "Массажёры для лица", bodyMassagers: "Массажёры для тела",
    new: "Новинки", about: "Философия бренда", search: "Поиск", searchTitle: "Поиск в Diva Rituals", searchPlaceholder: "Крем, блеск, карандаш...",
    noResults: "К сожалению, такого товара пока нет. Возможно, он скоро появится ♡", manager: "Менеджер Diva", response: "Обычно отвечает в течение 5 минут",
    greeting: "Здравствуйте! Я помогу выбрать уход, оттенок или оформить заказ ♡", messagePlaceholder: "Напишите сообщение...",
    demoMessage: "Спасибо! Это демо: сообщение сохранено только на этом устройстве и пока не отправляется менеджеру.",
    catalog: "Каталог", help: "Помощь", contacts: "Контакты", delivery: "Доставка и оплата", returns: "Возврат", faq: "Частые вопросы",
    stay: "Остаёмся на связи", news: "Новости, ритуалы и красивые запуски — без лишнего шума.", email: "Ваш email", subscribe: "Подписаться →",
    subscribed: "Спасибо! Email сохранён на этом устройстве ♡", favorites: "Избранное", home: "Главная",
  },
} as const;

const links: { href: string; label: string; view?: View }[] = [
  { href: "/catalog", label: "Усі товари", view: "catalog" },
  { href: "/face", label: "Для обличчя", view: "face" },
  { href: "/body", label: "Для тіла", view: "body" },
  { href: "/makeup", label: "Макіяж", view: "makeup" },
  { href: "/face-massagers", label: "Масажери для обличчя", view: "face-massagers" },
  { href: "/body-massagers", label: "Масажери для тіла", view: "body-massagers" },
  { href: "/#new", label: "Новинки" },
  { href: "/#about", label: "Про бренд" },
];

export default function ShopClient({ view }: { view: View }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cart, setCart] = useState<Cart>({});
  const [selected, setSelected] = useState<Product | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [catalogQuery, setCatalogQuery] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatSent, setChatSent] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountMode, setAccountMode] = useState<"login" | "register">("login");
  const [accountNotice, setAccountNotice] = useState(false);
  const [notice, setNotice] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [locale, setLocale] = useState<Locale>("uk");
  const t = copy[locale];
  const localizedNav = [locale === "uk" ? "Усі товари" : "Все товары", t.face, t.body, t.makeup, t.faceMassagers, t.bodyMassagers, t.new, t.about];
  const [selectedFromSearch, setSelectedFromSearch] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    try {
      setFavorites(JSON.parse(localStorage.getItem("dr-favorites") || "[]"));
      setCart(JSON.parse(localStorage.getItem("dr-cart") || "{}"));
      setLocale((localStorage.getItem("dr-locale") as Locale) || "uk");
    } catch { /* empty */ }
    setHydrated(true);
    if (view === "catalog") setCatalogQuery(new URLSearchParams(window.location.search).get("q") || "");
  }, []);

  const modalOpen = searchOpen || Boolean(selected) || accountOpen;
  usePageScrollLock(modalOpen);

  useEffect(() => { if (hydrated) localStorage.setItem("dr-favorites", JSON.stringify(favorites)); }, [favorites, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem("dr-cart", JSON.stringify(cart)); }, [cart, hydrated]);
  useEffect(() => { if (hydrated) { localStorage.setItem("dr-locale", locale); document.documentElement.lang = locale; } }, [locale, hydrated]);

  useEffect(() => {
    if (view === "home" || view === "cart") { setShowBackToTop(false); return; }
    const update = () => setShowBackToTop(window.scrollY > 650);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [view]);

  const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const localizedProducts = useMemo(() => products.map((product) => localizeProduct(product, locale)), [locale]);
  const pageProducts = view === "favorites"
    ? localizedProducts.filter((product) => favorites.includes(product.id))
    : view === "cart"
      ? localizedProducts.filter((product) => cart[product.id])
      : ["face", "body", "makeup", "face-massagers", "body-massagers"].includes(view)
        ? localizedProducts.filter((product) => product.category === view)
        : view === "catalog" && catalogQuery.trim()
          ? localizedProducts.filter((product) => `${product.name} ${product.subtitle} ${categoryLabels[product.category]}`.toLowerCase().includes(catalogQuery.trim().toLowerCase()))
          : localizedProducts;

  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return localizedProducts.slice(0, 5);
    const aliases: Record<string, string> = { "lip-pencil": "карандаш олівець губы губ", "lipss-call-me": "блеск блиск губы губ", "thermo-mascara": "тушь туш вії ресницы", "brow-gel": "брови брови гель", "daily-spf": "солнцезащитный сонцезахисний", "body-sculpt-cup": "вакуумный вакуумний массажер масажер" };
    return localizedProducts.filter((product) => `${product.name} ${product.subtitle} ${categoryLabels[product.category]} ${aliases[product.id] || ""}`.toLowerCase().includes(query));
  }, [search, localizedProducts]);

  const addToCart = (product: Product) => {
    setCart((current) => ({ ...current, [product.id]: (current[product.id] || 0) + 1 }));
    setNotice(`${product.name} ${locale === "uk" ? "додано до кошика" : "добавлен в корзину"}`);
    window.setTimeout(() => setNotice(""), 2200);
  };

  const changeCartQuantity = (product: Product, delta: number) => {
    setCart((current) => {
      const quantity = Math.max(0, (current[product.id] || 0) + delta);
      const next = { ...current };
      if (quantity) next[product.id] = quantity;
      else delete next[product.id];
      return next;
    });
  };

  const closeSearch = () => { setSearchOpen(false); setSearch(""); };
  const openHelp = (topic: string) => { setChatMessage(topic); setChatSent(false); setChatOpen(true); };

  const toggleFavorite = (id: string) => setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  return (
    <main>
      <div className="announcement"><span>{locale === "uk" ? "−15% на перше замовлення за кодом DIVA15" : "−15% на первый заказ по коду DIVA15"}</span><i>•</i><span>{locale === "uk" ? "Безкоштовна доставка від 2 500 грн" : "Бесплатная доставка от 2 500 грн"}</span></div>
      <header className="shop-header">
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={locale === "uk" ? "Відкрити каталог" : "Открыть каталог"}><span>☰</span></button>
        <a className="brand-logo-image" href="/" aria-label={`Diva Rituals — ${t.home}`}><img src="/diva-logo-clean.png" alt="Diva Rituals — Beauty & Self-Care" /></a>
        <nav className={menuOpen ? "open" : ""} aria-label="Каталог">
          {links.map((link, index) => <a className={link.view === view ? "active" : ""} href={link.href} key={link.label}>{localizedNav[index]}</a>)}
        </nav>
        <div className="header-actions">
          <select className="locale-toggle" value={locale} onChange={(event) => setLocale(event.target.value as Locale)} aria-label={locale === "uk" ? "Мова сайту" : "Язык сайта"}><option value="uk">UA</option><option value="ru">RU</option></select>
          <button className="search-trigger-button" onClick={() => setSearchOpen(true)} aria-label={t.search}>⌕</button>
          <a className="favorite-link" href="/favorites" aria-label={`${t.favorites}: ${favorites.length}`}><span>♥</span>{favorites.length > 0 && <b>{favorites.length}</b>}</a>
          <button className="account-trigger" onClick={() => setAccountOpen(true)} aria-label={locale === "uk" ? "Особистий кабінет" : "Личный кабинет"}><span className="account-icon" aria-hidden="true"></span></button>
          <a className="header-cart-link" href="/cart" aria-label={`${locale === "uk" ? "Кошик" : "Корзина"}: ${cartCount}`}><span className="cart-icon" aria-hidden="true"></span>{cartCount > 0 && <b>{cartCount}</b>}</a>
        </div>
      </header>

      {view === "home" ? (
        <HomeContent locale={locale} cart={cart} addToCart={addToCart} changeCartQuantity={changeCartQuantity} favorites={favorites} toggleFavorite={toggleFavorite} setSelected={setSelected} />
      ) : view === "cart" ? (
        <CartPage locale={locale} cart={cart} setCart={setCart} openHelp={openHelp} />
      ) : (
        <CatalogPage locale={locale} view={view} items={pageProducts} query={catalogQuery} cart={cart} favorites={favorites} toggleFavorite={toggleFavorite} addToCart={addToCart} changeCartQuantity={changeCartQuantity} setSelected={setSelected} />
      )}

      <SiteFooter locale={locale} openHelp={openHelp} />

      {showBackToTop && !chatOpen && <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label={locale === "uk" ? "Повернутися вгору" : "Вернуться наверх"}>↑</button>}

      <button className="chat-trigger" onClick={() => setChatOpen(!chatOpen)} aria-label={locale === "uk" ? "Чат із менеджером" : "Чат с менеджером"}><span>✦</span><i></i></button>
      {chatOpen && (
        <aside className="chat-panel" aria-label={t.manager}>
          <div className="chat-head"><div><span className="manager-dot"></span><strong>{t.manager}</strong><small>{t.response}</small></div><button onClick={() => setChatOpen(false)}>×</button></div>
          <div className="chat-body">
            <p>{t.greeting}</p>
            {chatSent && <p className="reply">{t.demoMessage}</p>}
          </div>
          <form onSubmit={(event) => { event.preventDefault(); localStorage.setItem("dr-last-chat-message", chatMessage); setChatSent(true); setChatMessage(""); }}><input required value={chatMessage} onChange={(event) => setChatMessage(event.target.value)} aria-label={t.messagePlaceholder} placeholder={t.messagePlaceholder} /><button aria-label="Надіслати">→</button></form>
        </aside>
      )}

      {searchOpen && (
        <div className="search-layer" role="dialog" aria-modal="true" aria-label="Пошук у каталозі">
          <form className="search-box" onSubmit={(event) => { event.preventDefault(); window.location.href = `/catalog${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ""}`; }}><button type="button" className="search-close" onClick={closeSearch} aria-label={locale === "uk" ? "Закрити пошук" : "Закрыть поиск"}>×</button><p>{t.searchTitle}</p><div className="search-entry"><input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.searchPlaceholder} /><button type="submit" aria-label={locale === "uk" ? "Показати всі результати" : "Показать все результаты"}><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 12h15M14 7l5 5-5 5" /></svg></button></div>
            <div className="search-results">{searchResults.length ? searchResults.map((product) => <button type="button" key={product.id} onClick={() => { setSelected(product); setSelectedFromSearch(true); setSearchOpen(false); }}><span>{product.name}<small>{product.subtitle}</small></span><strong>{money(product.price)}</strong></button>) : <p className="search-empty">{t.noResults}</p>}</div>
          </form>
        </div>
      )}

      {selected && <ProductModal locale={locale} product={selected} quantity={cart[selected.id] || 0} isFavorite={favorites.includes(selected.id)} close={() => { if (selectedFromSearch) setSearch(""); setSelected(null); setSelectedFromSearch(false); }} backToSearch={selectedFromSearch ? () => { setSelected(null); setSelectedFromSearch(false); setSearchOpen(true); } : undefined} toggleFavorite={toggleFavorite} addToCart={addToCart} changeCartQuantity={changeCartQuantity} />}
      {accountOpen && <div className="account-layer" role="dialog" aria-modal="true" aria-label={locale === "uk" ? "Особистий кабінет" : "Личный кабинет"}><section className="account-panel"><button className="account-close" onClick={() => setAccountOpen(false)} aria-label={locale === "uk" ? "Закрити" : "Закрыть"}>×</button><p>DIVA RITUALS CLUB</p><h2>{locale === "uk" ? "Особистий кабінет" : "Личный кабинет"}</h2><span>{locale === "uk" ? "Зберігайте обране, кошик та історію замовлень в одному місці." : "Сохраняйте избранное, корзину и историю заказов в одном месте."}</span><a className="account-orders-link" href="/cart#order-history">{locale === "uk" ? "Переглянути історію замовлень →" : "Посмотреть историю заказов →"}</a><div className="account-tabs"><button className={accountMode === "login" ? "active" : ""} onClick={() => { setAccountMode("login"); setAccountNotice(false); }}>{locale === "uk" ? "Увійти" : "Войти"}</button><button className={accountMode === "register" ? "active" : ""} onClick={() => { setAccountMode("register"); setAccountNotice(false); }}>{locale === "uk" ? "Реєстрація" : "Регистрация"}</button></div><button className="google-login" onClick={() => setAccountNotice(true)}><b>G</b>{locale === "uk" ? "Продовжити з Google" : "Продолжить с Google"}</button><div className="account-divider"><span>{locale === "uk" ? "або через email" : "или через email"}</span></div><form onSubmit={(event) => { event.preventDefault(); setAccountNotice(true); }}><label>Email<input type="email" autoComplete="email" required placeholder="name@example.com" /></label><label>{locale === "uk" ? "Пароль" : "Пароль"}<input type="password" autoComplete={accountMode === "login" ? "current-password" : "new-password"} required minLength={6} placeholder="••••••••" /></label><button type="submit">{accountMode === "login" ? (locale === "uk" ? "Увійти" : "Войти") : (locale === "uk" ? "Створити акаунт" : "Создать аккаунт")}</button></form>{accountNotice && <small>{locale === "uk" ? "Вигляд кабінету готовий. Справжній вхід запрацює після безпечного підключення авторизації." : "Внешний вид кабинета готов. Настоящий вход заработает после безопасного подключения авторизации."}</small>}</section></div>}
      {notice && <div className="toast">{notice}</div>}
      <div className="mobile-nav"><a href="/">⌂<span>{t.home}</span></a><a href="/#new">✦<span>{t.new}</span></a><a href="/favorites">♥<span>{t.favorites}</span></a><a href="/cart"><i className="cart-icon"></i><span>{locale === "uk" ? "Кошик" : "Корзина"}</span></a></div>
    </main>
  );
}

function HomeContent({ locale, cart, addToCart, changeCartQuantity, favorites, toggleFavorite, setSelected }: { locale: Locale; cart: Cart; addToCart: (p: Product) => void; changeCartQuantity: (p: Product, delta: number) => void; favorites: string[]; toggleFavorite: (id: string) => void; setSelected: (p: Product) => void }) {
  const t = copy[locale];
  const featuredIds = ["peptide-dew", "daily-spf", "glass-lip", "cloud-blush", "rose-quartz-roller", "microcurrent-sculpt", "body-pulse-mini", "pink-souffle", "body-glaze", "brow-wax", "face-3d-lift", "body-sculpt-cup"];
  const featuredProducts = featuredIds.map((id) => products.find((product) => product.id === id)).filter(Boolean).map((product) => localizeProduct(product as Product, locale)) as Product[];
  return <>
    <section className="shop-hero">
      <img src="/diva-rituals-hero-eileen-natural.png" alt={locale === "uk" ? "Ейлін показує гуаша з рожевого кварцу" : "Эйлин показывает гуаша из розового кварца"} />
      <div className="shop-hero-copy"><p>Beauty & self-care</p><h1>{locale === "uk" ? "Догляд, що стає вашим" : "Уход, который становится вашим"} <em>{locale === "uk" ? "ритуалом" : "ритуалом"}</em></h1><span>{locale === "uk" ? "Косметика та домашні б'юті-девайси для обличчя й тіла — красиво, зрозуміло та з турботою." : "Косметика и домашние бьюти-устройства для лица и тела — красиво, понятно и с заботой."}</span><div><a href="/face">{t.face}</a><a className="light" href="/body">{t.body}</a></div></div>
      <a className="hero-shop-link" href="#new">{locale === "uk" ? "До новинок" : "К новинкам"} <span>↘</span></a>
    </section>
    <section className="category-cards">
      <a href="/face"><div className="category-art"><img src="/category-face-skincare.jpg" alt={t.face} /></div><p>01 / {t.face}</p><h2>{t.face}</h2><span>{locale === "uk" ? "Очищення, зволоження та сяйво →" : "Очищение, увлажнение и сияние →"}</span></a>
      <a href="/body"><div className="category-art"><img src="/category-body-care.jpg" alt={t.body} /></div><p>02 / {t.body}</p><h2>{t.body}</h2><span>{locale === "uk" ? "Гелі, креми, скраби та олії →" : "Гели, кремы, скрабы и масла →"}</span></a>
      <a href="/makeup"><div className="category-art"><img src="/category-makeup.jpg" alt={t.makeup} /></div><p>03 / {t.makeup}</p><h2>{t.makeup}</h2><span>{locale === "uk" ? "Блиски, рум'яна, BB-креми →" : "Блески, румяна, BB-кремы →"}</span></a>
      <a href="/face-massagers"><div className="category-art"><img src="/category-face-massagers.jpg" alt={t.faceMassagers} /></div><p>04 / {locale === "uk" ? "Девайси" : "Устройства"}</p><h2>{t.faceMassagers}</h2><span>{locale === "uk" ? "Ролери, гуаша та мікроструми →" : "Роллеры, гуаша и микротоки →"}</span></a>
      <a href="/body-massagers"><div className="category-art"><img src="/category-body-massagers.jpg" alt={t.bodyMassagers} /></div><p>05 / {locale === "uk" ? "Девайси" : "Устройства"}</p><h2>{t.bodyMassagers}</h2><span>{locale === "uk" ? "Механічні та електронні →" : "Механические и электронные →"}</span></a>
    </section>
    <a className="catalog-bridge" href="/catalog" aria-label={locale === "uk" ? "Переглянути всі товари" : "Посмотреть все товары"}><div><p>{locale === "uk" ? "Повний каталог" : "Полный каталог"}</p><h2>{locale === "uk" ? "Усі товари" : "Все товары"}</h2></div><span className="catalog-bridge-action">{locale === "uk" ? "Переглянути всі" : "Посмотреть все"} <b>→</b></span></a>
    <section className="home-products" id="new"><div className="page-title mini"><p>{locale === "uk" ? "Обрано для вас" : "Выбрано для вас"}</p><h2>{locale === "uk" ? <>Новинки та <em>фаворити</em></> : <>Новинки и <em>фавориты</em></>}</h2><a href="/catalog">{locale === "uk" ? "Переглянути все →" : "Посмотреть всё →"}</a></div><div className="shop-grid">{featuredProducts.map((product) => <ProductCard locale={locale} key={product.id} product={product} quantity={cart[product.id] || 0} favorite={favorites.includes(product.id)} toggleFavorite={toggleFavorite} addToCart={addToCart} changeCartQuantity={changeCartQuantity} setSelected={setSelected} />)}</div></section>
    <section className="brand-story" id="about"><div className="story-card" aria-label={locale === "uk" ? "Картка Diva Rituals автоматично перевертається" : "Карточка Diva Rituals автоматически переворачивается"}><span className="story-card-inner"><span className="story-card-front"><img src="/diva-rituals-emblem.jpeg" alt="Diva Rituals — Beauty & Self-Care" /></span><span className="story-card-back"><img src="/founder-eileen.png" alt={locale === "uk" ? "Ейлін — засновниця Diva Rituals" : "Эйлин — основательница Diva Rituals"}/><span className="founder-caption"><small>{locale === "uk" ? "Засновниця Diva Rituals" : "Основательница Diva Rituals"}</small><strong>{locale === "uk" ? "Ейлін" : "Эйлин"}</strong><p>{locale === "uk" ? "Створено з любов'ю для жінок, які обирають себе." : "Создано с любовью для женщин, которые выбирают себя."}</p></span></span></span></div><div><p>{locale === "uk" ? "Наша філософія" : "Наша философия"}</p><h2>{locale === "uk" ? "Догляд за собою — це любов, а не виправлення недоліків." : "Забота о себе — это любовь, а не исправление недостатков."}</h2><span>{locale === "uk" ? "Ми доглядаємо за собою насамперед для себе. Не заради чужих очікувань і не тому, що маємо щось у собі виправити. Diva Rituals створено з любов'ю, щоб щоденний догляд за обличчям і тілом став вашим улюбленим ритуалом — приємним, зрозумілим і результативним. Це час, у якому ви обираєте себе, чуєте себе й насолоджуєтеся турботою про себе." : "Мы заботимся о себе прежде всего для себя — не ради чужих ожиданий и не потому, что должны что-то исправлять. Diva Rituals создан с любовью, чтобы ежедневный уход за лицом и телом стал вашим любимым ритуалом: приятным, понятным и результативным. Это время, когда вы выбираете и слышите себя."}</span><a href="/face">{locale === "uk" ? "Почати з догляду за обличчям →" : "Начать с ухода за лицом →"}</a></div></section>
    <section className="service-row" id="delivery"><article><b>01</b><h3>{locale === "uk" ? "Підбір догляду" : "Подбор ухода"}</h3><p>{locale === "uk" ? "Розкажіть менеджерці про шкіру та звички — допоможемо скласти зрозумілу схему." : "Расскажите менеджеру о коже и привычках — поможем составить понятную схему."}</p></article><article><b>02</b><h3>{locale === "uk" ? "Доставка Україною" : "Доставка по Украине"}</h3><p>{locale === "uk" ? "Відправлення протягом 1–2 робочих днів і безкоштовна доставка від 2 500 грн." : "Отправка в течение 1–2 рабочих дней и бесплатная доставка от 2 500 грн."}</p></article><article><b>03</b><h3>{locale === "uk" ? "Красиве задоволення" : "Красивое удовольствие"}</h3><p>{locale === "uk" ? "Кожне замовлення пакуємо так, щоб розпакування стало частиною вашого ритуалу." : "Каждый заказ упаковываем так, чтобы распаковка стала частью вашего ритуала."}</p></article></section>
  </>;
}

function CatalogPage({ locale, view, items, query, cart, favorites, toggleFavorite, addToCart, changeCartQuantity, setSelected }: { locale: Locale; view: View; items: Product[]; query?: string; cart: Cart; favorites: string[]; toggleFavorite: (id: string) => void; addToCart: (p: Product) => void; changeCartQuantity: (p: Product, delta: number) => void; setSelected: (p: Product) => void }) {
  const t = copy[locale];
  const empty = view === "favorites" && items.length === 0;
  const localizedCategories: Record<Category, string> = { face: t.face, body: t.body, makeup: t.makeup, "face-massagers": t.faceMassagers, "body-massagers": t.bodyMassagers };
  const title = view === "favorites" ? t.favorites : view === "catalog" ? (query ? (locale === "uk" ? `Результати: «${query}»` : `Результаты: «${query}»`) : t.catalog) : localizedCategories[view as Category];
  const countText = view === "favorites"
    ? (locale === "uk" ? `Збережено товарів: ${items.length}` : `Сохранено товаров: ${items.length}`)
    : query
      ? (locale === "uk" ? `Знайдено товарів: ${items.length}` : `Найдено товаров: ${items.length}`)
      : (locale === "uk" ? `Товарів у розділі: ${items.length}` : `Товаров в разделе: ${items.length}`);
  return <section className="catalog-page"><BackButton locale={locale} /><div className="page-title"><p>{view === "favorites" ? (locale === "uk" ? "Збережено з любов'ю" : "Сохранено с любовью") : view === "catalog" ? (locale === "uk" ? "Усі категорії" : "Все категории") : (locale === "uk" ? "Вибір Diva Rituals" : "Выбор Diva Rituals")}</p><h1>{title}</h1><span>{countText}</span></div>
    {empty ? <div className="empty-state"><strong>♥</strong><h2>{locale === "uk" ? "Поки нічого не збережено" : "Пока ничего не сохранено"}</h2><p>{locale === "uk" ? "Натискайте на сердечко в картках — усе, що сподобалося, з'явиться тут." : "Нажимайте на сердечко в карточках — всё, что понравилось, появится здесь."}</p><a href="/catalog">{locale === "uk" ? "Перейти до каталогу" : "Перейти в каталог"}</a></div> : items.length ? <div className="shop-grid catalog-grid">{items.map((product) => <ProductCard locale={locale} key={product.id} product={product} quantity={cart[product.id] || 0} favorite={favorites.includes(product.id)} toggleFavorite={toggleFavorite} addToCart={addToCart} changeCartQuantity={changeCartQuantity} setSelected={setSelected} />)}</div> : <div className="empty-state"><strong>⌕</strong><h2>{t.noResults}</h2><a href="/catalog">{locale === "uk" ? "Переглянути весь каталог" : "Посмотреть весь каталог"}</a></div>}
  </section>;
}

function ProductCard({ locale, product, quantity, favorite, toggleFavorite, addToCart, changeCartQuantity, setSelected }: { locale: Locale; product: Product; quantity: number; favorite: boolean; toggleFavorite: (id: string) => void; addToCart: (p: Product) => void; changeCartQuantity: (p: Product, delta: number) => void; setSelected: (p: Product) => void }) {
  return <article className="shop-card"><div className={`cosmetic-art has-photo ${product.tone}`}><img className="product-photo" src={product.image} alt={product.subtitle} loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} /><span className="art-label">Diva<br/>Rituals</span><div className={`cosmetic ${product.kind}`}><i></i><b></b></div>{product.badge && <small>{product.badge === "Новинка" && locale === "ru" ? "Новинка" : product.badge}</small>}<button className={favorite ? "heart active" : "heart"} onClick={() => toggleFavorite(product.id)} aria-label={favorite ? (locale === "uk" ? "Прибрати з обраного" : "Убрать из избранного") : (locale === "uk" ? "Додати до обраного" : "Добавить в избранное")}>{favorite ? "♥" : "♡"}</button></div><button className="product-name" onClick={() => setSelected(product)}><span><b>{product.name}</b><small>{product.subtitle}</small></span><strong>{money(product.price)}</strong></button><div className="card-actions"><button onClick={() => setSelected(product)}>{locale === "uk" ? "Докладніше" : "Подробнее"}</button>{quantity ? <div className="card-quantity" aria-label={locale === "uk" ? "Кількість у кошику" : "Количество в корзине"}><button onClick={() => changeCartQuantity(product, -1)} aria-label={locale === "uk" ? "Зменшити кількість" : "Уменьшить количество"}>−</button><b>{quantity}</b><button onClick={() => changeCartQuantity(product, 1)} aria-label={locale === "uk" ? "Збільшити кількість" : "Увеличить количество"}>+</button></div> : <button onClick={() => addToCart(product)}>{locale === "uk" ? "До кошика +" : "В корзину +"}</button>}</div></article>;
}

function ProductModal({ locale, product, quantity, isFavorite, close, backToSearch, toggleFavorite, addToCart, changeCartQuantity }: { locale: Locale; product: Product; quantity: number; isFavorite: boolean; close: () => void; backToSearch?: () => void; toggleFavorite: (id: string) => void; addToCart: (p: Product) => void; changeCartQuantity: (p: Product, delta: number) => void }) {
  const t = copy[locale];
  const labels: Record<Category, string> = { face: t.face, body: t.body, makeup: t.makeup, "face-massagers": t.faceMassagers, "body-massagers": t.bodyMassagers };
  return <div className="modal-layer" role="dialog" aria-modal="true" aria-label={product.name}><div className="product-modal"><button className="modal-close" onClick={close} aria-label={locale === "uk" ? "Закрити картку" : "Закрыть карточку"}>×</button>{backToSearch && <button className="modal-back" onClick={backToSearch}>← {locale === "uk" ? "До пошуку" : "К поиску"}</button>}<div className={`cosmetic-art modal-art has-photo ${product.tone}`}><img className="product-photo" src={product.image} alt={product.subtitle} onError={(event) => { event.currentTarget.style.display = "none"; }} /></div><div className="modal-copy"><p>{labels[product.category]}</p><h2>{product.name}</h2><span>{product.subtitle}</span><h3>{money(product.price)} {product.oldPrice && <del>{money(product.oldPrice)}</del>}</h3><p>{product.description}</p><div className="use-box"><strong>{locale === "uk" ? "Як використовувати" : "Как использовать"}</strong><span>{product.use}</span></div><div className="modal-actions">{quantity ? <div className="modal-quantity"><button onClick={() => changeCartQuantity(product, -1)}>−</button><b>{quantity}</b><button onClick={() => changeCartQuantity(product, 1)}>+</button></div> : <button onClick={() => addToCart(product)}>{locale === "uk" ? "Додати до кошика" : "Добавить в корзину"}</button>}<button className={isFavorite ? "active" : ""} onClick={() => toggleFavorite(product.id)}>{isFavorite ? (locale === "uk" ? "♥ Збережено" : "♥ Сохранено") : (locale === "uk" ? "♡ До обраного" : "♡ В избранное")}</button></div></div></div></div>;
}

function CartPage({ locale, cart, setCart, openHelp }: { locale: Locale; cart: Cart; setCart: (cart: Cart) => void; openHelp: (topic: string) => void }) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderReady, setOrderReady] = useState(false);
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [profile, setProfile] = useState<CheckoutProfile>({ name: "", phone: "", email: "", city: "", deliveryAddress: "" });
  usePageScrollLock(checkoutOpen);
  useEffect(() => {
    if (!checkoutOpen) return;
    const validateCharacters = (event: Event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || !input.closest(".checkout-form")) return;
      if (input.name === "deliveryAddress") {
        input.value = input.value.replace(/[^A-Za-zА-Яа-яЁёІіЇїЄєҐґ0-9'’ №#.,/\-]/g, "");
      }
    };
    document.addEventListener("input", validateCharacters);
    return () => document.removeEventListener("input", validateCharacters);
  }, [checkoutOpen]);
  useEffect(() => {
    try {
      setOrders(JSON.parse(localStorage.getItem("dr-orders") || "[]"));
      setProfile(JSON.parse(localStorage.getItem("dr-checkout-profile") || '{"name":"","phone":"","email":"","city":"","deliveryAddress":""}'));
    } catch { /* empty */ }
  }, []);
  const items = products.filter((product) => cart[product.id]).map((product) => localizeProduct(product, locale));
  const t = copy[locale];
  const labels: Record<Category, string> = { face: t.face, body: t.body, makeup: t.makeup, "face-massagers": t.faceMassagers, "body-massagers": t.bodyMassagers };
  const total = items.reduce((sum, product) => sum + product.price * cart[product.id], 0);
  const completeOrder = (form: HTMLFormElement) => {
    const data = new FormData(form);
    const nextProfile: CheckoutProfile = {
      name: String(data.get("name") || ""),
      phone: normalizeUaPhone(String(data.get("phone") || "")),
      email: completeEmail(String(data.get("email") || "")),
      city: String(data.get("city") || ""),
      deliveryAddress: String(data.get("deliveryAddress") || ""),
    };
    setProfile(nextProfile);
    localStorage.setItem("dr-checkout-profile", JSON.stringify(nextProfile));
    const order: SavedOrder = { id: `DR-${Date.now().toString().slice(-6)}`, createdAt: new Date().toISOString(), total, status: "processing", items: items.map((product) => ({ id: product.id, quantity: cart[product.id] })) };
    const next = [order, ...orders];
    setOrders(next);
    localStorage.setItem("dr-orders", JSON.stringify(next));
    setOrderReady(true);
    setCart({});
  };
  const historyLink = orders.length ? <a className="order-history-link" href="#order-history">{locale === "uk" ? "Історія замовлень" : "История заказов"}<span>↓</span></a> : null;
  if (!items.length && !checkoutOpen) return <section className="catalog-page cart-empty-page"><BackButton locale={locale} /><div className="page-title cart-title"><div><p>{locale === "uk" ? "Ваш ритуальний кошик" : "Ваша ритуальная корзина"}</p><h1>{locale === "uk" ? "Кошик" : "Корзина"}</h1></div>{historyLink}</div><div className="empty-state"><strong className="empty-cart-icon"><i className="cart-icon"></i></strong><h2>{locale === "uk" ? "Кошик поки порожній" : "Корзина пока пуста"}</h2><p>{locale === "uk" ? "Додайте улюблені засоби — вони залишаться тут на цьому пристрої." : "Добавьте любимые средства — они останутся здесь на этом устройстве."}</p><a href="/catalog">{locale === "uk" ? "Перейти до каталогу" : "Перейти в каталог"}</a></div><OrderHistory locale={locale} orders={orders} openHelp={openHelp} /></section>;
  return <section className="cart-page"><BackButton locale={locale} /><div className="page-title cart-title"><div><p>{locale === "uk" ? "Ваш ритуальний кошик" : "Ваша ритуальная корзина"}</p><h1>{locale === "uk" ? "Кошик" : "Корзина"}</h1><span>{items.length} {locale === "uk" ? "позицій у вашому замовленні" : "позиций в вашем заказе"}</span></div>{historyLink}</div><div className="cart-layout"><div className="cart-list">{items.map((product) => <article key={product.id}><div className={`mini-art has-photo ${product.tone}`}><img src={product.image} alt={product.subtitle} loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} /></div><div><p>{labels[product.category]}</p><h3>{product.name}</h3><span>{product.subtitle}</span><div className="quantity"><button onClick={() => setCart({ ...cart, [product.id]: Math.max(1, cart[product.id] - 1) })}>−</button><b>{cart[product.id]}</b><button onClick={() => setCart({ ...cart, [product.id]: cart[product.id] + 1 })}>+</button></div></div><strong>{money(product.price * cart[product.id])}</strong><button className="remove" onClick={() => { const next = { ...cart }; delete next[product.id]; setCart(next); }}>×</button></article>)}</div><aside className="order-box"><p>{locale === "uk" ? "Ваше замовлення" : "Ваш заказ"}</p><div><span>{locale === "uk" ? "Товари" : "Товары"}</span><b>{money(total)}</b></div><div><span>Доставка</span><b>{total >= 2500 ? (locale === "uk" ? "Безкоштовно" : "Бесплатно") : (locale === "uk" ? "За тарифами" : "По тарифам")}</b></div><hr/><div className="total"><span>{locale === "uk" ? "Разом" : "Итого"}</span><b>{money(total)}</b></div><button className="checkout-button" onClick={() => setCheckoutOpen(true)}>{locale === "uk" ? "Оформити замовлення" : "Оформить заказ"}</button><small>{locale === "uk" ? "Оплата не списується до підтвердження замовлення." : "Оплата не списывается до подтверждения заказа."}</small></aside></div>
    {checkoutOpen && <div className="checkout-layer" role="dialog" aria-modal="true" aria-label={locale === "uk" ? "Оформлення замовлення" : "Оформление заказа"}><div className="checkout-panel"><button className="modal-close" onClick={() => setCheckoutOpen(false)}>×</button>{orderReady ? <div className="checkout-success"><span>✓</span><h2>{locale === "uk" ? "Замовлення прийнято" : "Заказ принят"}</h2><p>{locale === "uk" ? "Кошик очищено, а замовлення збережено в історії зі статусом «В обробці»." : "Корзина очищена, а заказ сохранён в истории со статусом «В обработке»."}</p><button onClick={() => setCheckoutOpen(false)}>{locale === "uk" ? "Переглянути історію нижче" : "Посмотреть историю ниже"}</button></div> : <><p className="eyebrow">{locale === "uk" ? "Оформлення замовлення" : "Оформление заказа"}</p><h2>{locale === "uk" ? "Доставка та оплата" : "Доставка и оплата"}</h2><form className="checkout-form" onSubmit={(event) => { event.preventDefault(); completeOrder(event.currentTarget); }}><label>{locale === "uk" ? "Ім’я та прізвище" : "Имя и фамилия"}<input name="name" autoComplete="name" required minLength={2} maxLength={60} pattern="[A-Za-zА-Яа-яЁёІіЇїЄєҐґ'’ -]+" onInput={(event) => { event.currentTarget.value = event.currentTarget.value.replace(/[^A-Za-zА-Яа-яЁёІіЇїЄєҐґ'’ -]/g, ""); }} title={locale === "uk" ? "Введіть ім’я літерами" : "Введите имя буквами"} defaultValue={profile.name} placeholder={locale === "uk" ? "Ваше повне ім’я" : "Ваше полное имя"} /></label><label>{locale === "uk" ? "Номер телефону" : "Номер телефона"}<input name="phone" type="tel" inputMode="tel" autoComplete="tel" required minLength={10} maxLength={20} pattern="[+]?[0-9 ()-]{10,20}" defaultValue={profile.phone} onInput={(event) => { event.currentTarget.value = event.currentTarget.value.replace(/(?!^\+)[^0-9 ()-]/g, ""); }} onBlur={(event) => { event.currentTarget.value = normalizeUaPhone(event.currentTarget.value); }} title={locale === "uk" ? "Введіть коректний номер телефону" : "Введите корректный номер телефона"} placeholder="+380 __ ___ __ __" /></label><label>Email<input name="email" type="email" inputMode="email" autoComplete="email" required maxLength={80} defaultValue={profile.email} onInput={(event) => { event.currentTarget.value = event.currentTarget.value.replace(/\s/g, ""); }} onBlur={(event) => { event.currentTarget.value = completeEmail(event.currentTarget.value); }} placeholder="name@gmail.com" /><span className="email-domain-suggestions"><button type="button" onClick={(event) => setEmailDomain(event.currentTarget, "gmail.com")}>@gmail.com</button><button type="button" onClick={(event) => setEmailDomain(event.currentTarget, "ukr.net")}>@ukr.net</button></span></label><label>{locale === "uk" ? "Місто" : "Город"}<input name="city" autoComplete="address-level2" required minLength={2} maxLength={50} pattern="[A-Za-zА-Яа-яЁёІіЇїЄєҐґ'’ .-]+" onInput={(event) => { event.currentTarget.value = event.currentTarget.value.replace(/[^A-Za-zА-Яа-яЁёІіЇїЄєҐґ'’ .-]/g, ""); }} title={locale === "uk" ? "Введіть назву міста літерами" : "Введите название города буквами"} defaultValue={profile.city} placeholder={locale === "uk" ? "Київ" : "Киев"} /></label><label className="full">{locale === "uk" ? "Адреса або відділення Нової пошти" : "Адрес или отделение Новой почты"}<input name="deliveryAddress" autoComplete="street-address" required minLength={3} maxLength={120} defaultValue={profile.deliveryAddress} placeholder={locale === "uk" ? "Вулиця, будинок або № відділення" : "Улица, дом или № отделения"} /></label><fieldset className="full"><legend>{locale === "uk" ? "Спосіб доставки" : "Способ доставки"}</legend><label><input type="radio" name="delivery" value="nova-poshta" defaultChecked /> {locale === "uk" ? "Нова пошта" : "Новая почта"}</label><label><input type="radio" name="delivery" value="courier" /> {locale === "uk" ? "Кур’єр по Києву" : "Курьер по Киеву"}</label></fieldset><fieldset className="full"><legend>{locale === "uk" ? "Спосіб оплати" : "Способ оплаты"}</legend><label><input type="radio" name="payment" value="cod" defaultChecked /> {locale === "uk" ? "Післяплата при отриманні" : "Оплата при получении"}</label><label><input type="radio" name="payment" value="online" /> {locale === "uk" ? "Онлайн-оплата карткою" : "Онлайн-оплата картой"}</label></fieldset><button className="full" type="submit">{locale === "uk" ? "Підтвердити дані замовлення" : "Подтвердить данные заказа"} · {money(total)}</button></form><small className="checkout-note">{locale === "uk" ? "Онлайн-оплата та відправлення в Telegram будуть активовані після підключення сервісів." : "Онлайн-оплата и отправка в Telegram будут активированы после подключения сервисов."}</small></>}</div></div>}
    <OrderHistory locale={locale} orders={orders} openHelp={openHelp} />
  </section>;
}

function OrderHistory({ locale, orders, openHelp }: { locale: Locale; orders: SavedOrder[]; openHelp: (topic: string) => void }) {
  const [filter, setFilter] = useState<"all" | "processing">("all");
  if (!orders.length) return null;
  const visible = filter === "processing" ? orders.filter((order) => order.status === "processing") : orders;
  return <section className="order-history" id="order-history"><div className="order-history-head"><div><p>{locale === "uk" ? "Особистий кабінет" : "Личный кабинет"}</p><h2>{locale === "uk" ? "Історія замовлень" : "История заказов"}</h2></div><div className="order-filters"><button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>{locale === "uk" ? "Усі" : "Все"}</button><button className={filter === "processing" ? "active" : ""} onClick={() => setFilter("processing")}>{locale === "uk" ? "В обробці" : "В обработке"}</button></div></div><div className="order-history-list">{visible.map((order) => <article key={order.id}><div><small>{new Intl.DateTimeFormat(locale === "uk" ? "uk-UA" : "ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(new Date(order.createdAt))}</small><h3>{locale === "uk" ? "Замовлення №" : "Заказ №"}{order.id.replace(/\D/g, "")}</h3><p>{order.items.map((item) => { const product = products.find((entry) => entry.id === item.id); return product ? `${localizeProduct(product, locale).name} × ${item.quantity}` : `${item.id} × ${item.quantity}`; }).join(" · ")}</p></div><div className="order-history-side"><span>{locale === "uk" ? "В обробці" : "В обработке"}</span><strong>{money(order.total)}</strong><button onClick={() => openHelp(`${locale === "uk" ? "Потрібна допомога із замовленням" : "Нужна помощь с заказом"} ${order.id}`)}>{locale === "uk" ? "Зв’язатися з підтримкою" : "Связаться с поддержкой"}</button></div></article>)}</div></section>;
}

function SiteFooter({ locale, openHelp }: { locale: Locale; openHelp: (topic: string) => void }) {
  const t = copy[locale];
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  return <footer className="shop-footer"><div className="footer-main"><div><a className="brand-logo-image footer-brand-logo" href="/"><img src="/diva-logo-footer-dark.png" alt="Diva Rituals — Beauty & Self-Care" /></a></div><div><strong>{t.catalog}</strong><a href="/catalog">{locale === "uk" ? "Усі товари" : "Все товары"}</a><a href="/face">{t.face}</a><a href="/body">{t.body}</a><a href="/makeup">{t.makeup}</a><a href="/face-massagers">{t.faceMassagers}</a><a href="/body-massagers">{t.bodyMassagers}</a><a href="/favorites">{t.favorites}</a></div><div className="footer-help"><strong>{t.help}</strong><button onClick={() => openHelp(locale === "uk" ? "Хочу зв’язатися з менеджеркою" : "Хочу связаться с менеджером")}>{t.contacts}</button><a href="/#delivery">{t.delivery}</a><button onClick={() => openHelp(locale === "uk" ? "Потрібна допомога з поверненням товару" : "Нужна помощь с возвратом товара")}>{t.returns}</button><button onClick={() => openHelp(locale === "uk" ? "У мене є питання про замовлення" : "У меня есть вопрос о заказе")}>{t.faq}</button></div><div><strong>{t.stay}</strong><p>{t.news}</p>{subscribed ? <p className="subscribe-success">{t.subscribed}</p> : <form className="subscribe-form" onSubmit={(event) => { event.preventDefault(); localStorage.setItem("dr-subscriber-email", email); setSubscribed(true); }}><label htmlFor="newsletter-email">{t.email}</label><div><input id="newsletter-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" /><button type="submit">{t.subscribe}</button></div></form>}</div></div><div className="footer-bottom"><span>© 2026 Diva Rituals</span><p>{locale === "uk" ? "Концептуальний проєкт для портфоліо. Назви, товари, ціни й відгуки демонстраційні." : "Концептуальный проект для портфолио. Названия, товары, цены и отзывы демонстрационные."}</p><span className="social-links"><a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram</a><a href="https://www.tiktok.com/" target="_blank" rel="noreferrer">TikTok</a></span></div></footer>;
}

function BackButton({ locale }: { locale: Locale }) {
  return <button className="back-button" onClick={() => { window.location.href = "/"; }} aria-label={locale === "uk" ? "Повернутися на головну" : "Вернуться на главную"}><span>←</span> {locale === "uk" ? "На головну" : "На главную"}</button>;
}
