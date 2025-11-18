// bijv. src/i18n/translations.ts

export type Language = "en" | "nl" | "pap" | "es";

type BaseTranslations = {
  // Navigation
  blog: string;
  forBusiness: string;

  // Hero
  heroTitle: string;
  heroSubtitle: string;
  heroExplore: string;
  heroForBusiness: string;

  // Search
  searchPlaceholder: string;

  // Quick Links
  quickLinksTitle: string;
  shops: string;
  activities: string;
  carRentals: string;
  restaurants: string;

  // Featured
  featuredTitle: string;
  viewDetails: string;

  // Blog
  latestGuides: string;
  readMore: string;

  // Islands
  exploreIslands: string;
  aruba: string;
  bonaire: string;
  curacao: string;

  // Footer
  about: string;
  contact: string;
  faq: string;
  terms: string;
  privacy: string;
  followUs: string;

  // Business Directory
  businesses: string;
  discoverBusinesses: string;

  // 🔐 Auth / Business login
  businessAuthTitle: string;
  businessAuthSubtitle: string;
  signIn: string;
  signUp: string;
  fullName: string;
  email: string;
  password: string;

  // (oude namen als fallback – voor code die t.authTitle gebruikt)
  authTitle: string;
  authSubtitle: string;
};

export const translations: Record<Language, BaseTranslations> = {
  en: {
    // Navigation
    blog: "Blog",
    forBusiness: "For Business",

    // Hero
    heroTitle: "Discover the ABC Islands",
    heroSubtitle: "Your complete guide to Aruba, Bonaire & Curaçao",
    heroExplore: "Explore Islands",
    heroForBusiness: "For Business",

    // Search
    searchPlaceholder: "Search for restaurants, activities, shops...",

    // Quick Links
    quickLinksTitle: "Popular Categories",
    shops: "Shops",
    activities: "Activities",
    carRentals: "Car Rentals",
    restaurants: "Restaurants",

    // Featured
    featuredTitle: "Featured Highlights",
    viewDetails: "View Details",

    // Blog
    latestGuides: "Latest Guides & Tips",
    readMore: "Read More",

    // Islands
    exploreIslands: "Explore the Islands",
    aruba: "Aruba",
    bonaire: "Bonaire",
    curacao: "Curaçao",

    // Footer
    about: "About",
    contact: "Contact",
    faq: "FAQ",
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    followUs: "Follow Us",

    // Business Directory
    businesses: "Businesses",
    discoverBusinesses: "Discover Businesses",

    // Auth
    businessAuthTitle: "Business login",
    businessAuthSubtitle: "Log in or sign up to manage your business listing.",
    signIn: "Sign in",
    signUp: "Sign up",
    fullName: "Full name",
    email: "Email",
    password: "Password",

    // fallback names
    authTitle: "Business login",
    authSubtitle: "Log in or sign up to manage your business listing.",
  },

  nl: {
    // Navigation
    blog: "Blog",
    forBusiness: "Voor Bedrijven",

    // Hero
    heroTitle: "Ontdek de ABC Eilanden",
    heroSubtitle: "Jouw complete gids voor Aruba, Bonaire & Curaçao",
    heroExplore: "Verken Eilanden",
    heroForBusiness: "Voor Bedrijven",

    // Search
    searchPlaceholder: "Zoek naar restaurants, activiteiten, winkels...",

    // Quick Links
    quickLinksTitle: "Populaire Categorieën",
    shops: "Winkels",
    activities: "Activiteiten",
    carRentals: "Autoverhuur",
    restaurants: "Restaurants",

    // Featured
    featuredTitle: "Uitgelichte Highlights",
    viewDetails: "Bekijk Details",

    // Blog
    latestGuides: "Laatste Gidsen & Tips",
    readMore: "Lees Meer",

    // Islands
    exploreIslands: "Verken de Eilanden",
    aruba: "Aruba",
    bonaire: "Bonaire",
    curacao: "Curaçao",

    // Footer
    about: "Over Ons",
    contact: "Contact",
    faq: "Veelgestelde Vragen",
    terms: "Algemene Voorwaarden",
    privacy: "Privacybeleid",
    followUs: "Volg Ons",

    // Business Directory
    businesses: "Bedrijven",
    discoverBusinesses: "Ontdek Bedrijven",

    // Auth
    businessAuthTitle: "Ondernemers login",
    businessAuthSubtitle:
      "Log in of maak een account aan om je bedrijfsvermelding te beheren.",
    signIn: "Inloggen",
    signUp: "Account maken",
    fullName: "Volledige naam",
    email: "E-mailadres",
    password: "Wachtwoord",

    // fallback namen
    authTitle: "Ondernemers login",
    authSubtitle:
      "Log in of maak een account aan om je bedrijfsvermelding te beheren.",
  },

  pap: {
    // Navigation
    blog: "Blog",
    forBusiness: "Pa Negoshi",

    // Hero
    heroTitle: "Deskubri e Islanan ABC",
    heroSubtitle: "Bo guia kompleto pa Aruba, Bonaire & Kòrsou",
    heroExplore: "Eksplora Islanan",
    heroForBusiness: "Pa Negoshi",

    // Search
    searchPlaceholder: "Buska restoran, aktividat, tienda...",

    // Quick Links
    quickLinksTitle: "Kategorianan Popular",
    shops: "Tiendan",
    activities: "Aktividatnan",
    carRentals: "Hür di Outo",
    restaurants: "Restoranan",

    // Featured
    featuredTitle: "Destacanan Special",
    viewDetails: "Mira Detalye",

    // Blog
    latestGuides: "Último Guianan & Konseho",
    readMore: "Lesa Mas",

    // Islands
    exploreIslands: "Eksplora e Islanan",
    aruba: "Aruba",
    bonaire: "Bonaire",
    curacao: "Kòrsou",

    // Footer
    about: "Tokante Nos",
    contact: "Kontakto",
    faq: "Preguntanan",
    terms: "Kondishonnan",
    privacy: "Privashidat",
    followUs: "Sigi Nos",

    // Business Directory
    businesses: "Negoshinan",
    discoverBusinesses: "Deskubri Negoshinan",

    // Auth
    businessAuthTitle: "Login di negoshi",
    businessAuthSubtitle:
      "Login of crea un cuenta pa manejá bo listado di negoshi.",
    signIn: "Login",
    signUp: "Registrá",
    fullName: "Nom komplet",
    email: "Email",
    password: "Wachtwoord",

    // fallback
    authTitle: "Login di negoshi",
    authSubtitle:
      "Login of crea un cuenta pa manejá bo listado di negoshi.",
  },

  es: {
    // Navigation
    blog: "Blog",
    forBusiness: "Para Negocios",

    // Hero
    heroTitle: "Descubre las Islas ABC",
    heroSubtitle: "Tu guía completa para Aruba, Bonaire y Curazao",
    heroExplore: "Explorar Islas",
    heroForBusiness: "Para Negocios",

    // Search
    searchPlaceholder: "Buscar restaurantes, actividades, tiendas...",

    // Quick Links
    quickLinksTitle: "Categorías Populares",
    shops: "Tiendas",
    activities: "Actividades",
    carRentals: "Alquiler de Autos",
    restaurants: "Restaurantes",

    // Featured
    featuredTitle: "Destacados",
    viewDetails: "Ver Detalles",

    // Blog
    latestGuides: "Últimas Guías y Consejos",
    readMore: "Leer Más",

    // Islands
    exploreIslands: "Explorar las Islas",
    aruba: "Aruba",
    bonaire: "Bonaire",
    curacao: "Curazao",

    // Footer
    about: "Acerca de",
    contact: "Contacto",
    faq: "Preguntas Frecuentes",
    terms: "Términos de Servicio",
    privacy: "Política de Privacidad",
    followUs: "Síguenos",

    // Business Directory
    businesses: "Negocios",
    discoverBusinesses: "Descubre Negocios",

    // Auth
    businessAuthTitle: "Acceso para negocios",
    businessAuthSubtitle:
      "Inicia sesión o crea una cuenta para administrar tu negocio.",
    signIn: "Entrar",
    signUp: "Registrar",
    fullName: "Nombre completo",
    email: "Correo electrónico",
    password: "Contraseña",

    // fallback
    authTitle: "Acceso para negocios",
    authSubtitle:
      "Inicia sesión o crea una cuenta para administrar tu negocio.",
  },
};