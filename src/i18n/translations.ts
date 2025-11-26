// src/i18n/translations.ts

export type Language = "en" | "nl" | "pap" | "es";

// heel simpel type zodat je later makkelijk keys kunt toevoegen
export type Translations = Record<string, string>;

export const translations: Record<Language, Translations> = {
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

    // 🔐 Business auth (nieuw)
    businessAuthTitle: "Business account",
    businessAuthSubtitle:
      "Log in or sign up to manage your business listing.",
    signIn: "Sign in",
    signUp: "Sign up",
    fullName: "Full name",
    email: "Email",
    password: "Password",
  },

  nl: {
    // Navigation
    blog: "Blog",
    forBusiness: "Voor Bedrijven",

    // Hero
    heroTitle: "Ontdek de ABC Eilanden",
    heroSubtitle:
      "Jouw complete gids voor Aruba, Bonaire & Curaçao",
    heroExplore: "Verken Eilanden",
    heroForBusiness: "Voor Bedrijven",

    // Search
    searchPlaceholder:
      "Zoek naar restaurants, activiteiten, winkels...",

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

    // 🔐 Business auth (nieuw)
    businessAuthTitle: "Ondernemers login",
    businessAuthSubtitle:
      "Log in of maak een account aan om je bedrijfsvermelding te beheren.",
    signIn: "Inloggen",
    signUp: "Account aanmaken",
    fullName: "Volledige naam",
    email: "E-mailadres",
    password: "Wachtwoord",
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
    searchPlaceholder:
      "Buska restoran, aktividat, tienda...",

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

    // 🔐 Business auth
    businessAuthTitle: "Kuenta di Negoshi",
    businessAuthSubtitle:
      "Drenta of registra bo mes pa maneha bo negoshi.",
    signIn: "Log in",
    signUp: "Registrá",
    fullName: "Nòmber kompleto",
    email: "Email",
    password: "Kontraseña",
  },

  es: {
    // Navigation
    blog: "Blog",
    forBusiness: "Para Negocios",

    // Hero
    heroTitle: "Descubre las Islas ABC",
    heroSubtitle:
      "Tu guía completa para Aruba, Bonaire y Curazao",
    heroExplore: "Explorar Islas",
    heroForBusiness: "Para Negocios",

    // Search
    searchPlaceholder:
      "Buscar restaurantes, actividades, tiendas...",

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

    // 🔐 Business auth
    businessAuthTitle: "Cuenta de negocio",
    businessAuthSubtitle:
      "Inicia sesión o regístrate para gestionar tu negocio.",
    signIn: "Iniciar sesión",
    signUp: "Crear cuenta",
    fullName: "Nombre completo",
    email: "Correo electrónico",
    password: "Contraseña",
  },
};