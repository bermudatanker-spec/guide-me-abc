// src/i18n/dicts.ts
import type { Locale } from "./config";

export type Dict = Record<string, string>;

export const DICTS: Record<Locale, Dict> = {
  en: {
    // Navigation / common
    forBusiness: "For Business",
    aruba: "Aruba",
    bonaire: "Bonaire",
    curacao: "Curaçao",
    businesses: "Businesses",
    blog: "Blog",
    faq: "FAQ",
    islandsMenu: "Islands",
    blogGuides: "Blog & Guides",
    whyABC: "Why ABC Islands?",
    getStarted: "Get Started",
    connect: "Connect",

    // Hero
    exploreIslands: "Discover the ABC Islands",
    faqSubtitle:
      "Your complete guide to Aruba, Bonaire & Curaçao — beaches, restaurants, tours and trusted local businesses.",
    exploreIslandsCta: "Explore Islands",

    // For Business page
    fbHeroTitle: "Grow Your Business on the ABC Islands",
    fbHeroSubtitle:
      "Create your professional mini-site, reach customers and grow your business with our all-in-one platform.",
    fbHeroCta: "Get Started – Free Trial",
    fbPricingTitle: "Simple, Transparent Pricing",
    fbFeaturesTitle: "Everything You Need to Succeed",
    fbFaqTitle: "Frequently Asked Questions",
    fbFinalCtaTitle: "Ready to Grow Your Business?",
    fbFinalCtaSubtitle:
      "Join hundreds of businesses already reaching more customers on the ABC Islands.",

    // Menu
    menu_for_business: "For Business",
    menu_sign_in_business: "Sign in",
    menu_register_business: "Register new business",
    menu_dashboard: "Dashboard",

    // Auth
    businessAuthTitle: "Business Account",
    businessAuthSubtitle: "Log in or sign up to manage your business",
    signIn: "Sign in",
    signUp: "Sign up",
    fullName: "Full name",
    email: "Email",
    password: "Password",
    logout: "Log out",

    // Forgot / Reset password
    forgot_title: "Forgot password",
    forgot_sub:
      "Enter your email. We'll send you a link to reset your password.",
    send_reset_link: "Send reset link",
    sent_check_email: "We sent you an email with further instructions.",
    reset_title: "Set new password",
    new_pw: "New password",
    confirm_pw: "Confirm password",
    save_pw: "Save password",
    pw_too_short: "Password must be at least 8 characters.",
    pw_mismatch: "Passwords do not match.",
    show_pw: "Show password",
    hide_pw: "Hide password",

    // Generic UI
    sending: "Sending…",
    saving: "Saving…",
    back: "Back",
    backToDashboard: "Back to Dashboard",
    viewDetails: "View details",
    noMiniSite: "No mini-site",
    none: "— None —",

    // Dashboard
    dashboardTitle: "Dashboard",
    dashboardSubtitle: "Manage your business listings",
    myBusinesses: "My Businesses",
    noBusinesses: "You have no businesses yet",
    business: "business",
    businessesPlural: "businesses",
    addFirstBusiness: "Start by adding your first business",
    addBusiness: "Add Business",
    edit: "Edit",
    view: "Mini-site",

    // Create
    businessCreateTitle: "Create Business",
    businessCreateSubtitle: "Register your business.",
    businessName: "Business name",
    island: "Island",
    selectIsland: "Select island",
    category: "Category",
    selectCategory: "Select category",
    description: "Description",
    descriptionPlaceholder: "Tell us about your business…",
    address: "Address",
    phone: "Phone",
    website: "Website",
    createBusinessCta: "Create Business",

    // Create validation / status
    missingRequired: "Missing required fields",
    fillRequired: "Please provide at least a business name and island.",
    created: "Business created",
    error: "Error",
    saveError: "Could not save business",

    // Biz detail
    contact: "Contact",
  },

  nl: {
    // Navigation / common
    forBusiness: "Voor Ondernemers",
    aruba: "Aruba",
    bonaire: "Bonaire",
    curacao: "Curaçao",
    businesses: "Bedrijven",
    blog: "Blog",
    faq: "FAQ",
    islandsMenu: "Eilanden",
    blogGuides: "Blog & Gidsen",
    whyABC: "Waarom ABC Islands?",
    getStarted: "Aan de slag",
    connect: "Contact",

    // Hero
    exploreIslands: "Ontdek de ABC-eilanden",
    faqSubtitle:
      "Je complete gids voor Aruba, Bonaire & Curaçao — stranden, restaurants, tours en betrouwbare lokale bedrijven.",
    exploreIslandsCta: "Eilanden verkennen",

    // For Business page
    fbHeroTitle: "Laat je bedrijf groeien op de ABC-eilanden",
    fbHeroSubtitle:
      "Maak je professionele mini-site, bereik klanten en groei met ons alles-in-één platform.",
    fbHeroCta: "Start gratis proef",
    fbPricingTitle: "Eenvoudige, transparante prijzen",
    fbFeaturesTitle: "Alles wat je nodig hebt om te slagen",
    fbFaqTitle: "Veelgestelde vragen",
    fbFinalCtaTitle: "Klaar om je bedrijf te laten groeien?",
    fbFinalCtaSubtitle:
      "Sluit je aan bij honderden bedrijven die al meer klanten bereiken op de ABC-eilanden.",

    // Menu
    menu_for_business: "Voor Ondernemers",
    menu_sign_in_business: "Inloggen",
    menu_register_business: "Nieuw bedrijf registreren",
    menu_dashboard: "Dashboard",

    // Auth
    businessAuthTitle: "Zakelijk account",
    businessAuthSubtitle: "Log in of registreer om je bedrijf te beheren",
    signIn: "Inloggen",
    signUp: "Registreren",
    fullName: "Volledige naam",
    email: "E-mail",
    password: "Wachtwoord",
    logout: "Uitloggen",

    // Forgot / Reset
    forgot_title: "Wachtwoord vergeten",
    forgot_sub:
      "Vul je e-mail in. Je ontvangt een link om je wachtwoord te resetten.",
    send_reset_link: "Verstuur reset-link",
    sent_check_email:
      "We hebben je een e-mail gestuurd met verdere instructies.",
    reset_title: "Nieuw wachtwoord",
    new_pw: "Nieuw wachtwoord",
    confirm_pw: "Bevestig wachtwoord",
    save_pw: "Wachtwoord opslaan",
    pw_too_short: "Wachtwoord moet minimaal 8 tekens zijn.",
    pw_mismatch: "Wachtwoorden komen niet overeen.",
    show_pw: "Toon wachtwoord",
    hide_pw: "Verberg wachtwoord",

    // Generic UI
    sending: "Versturen…",
    saving: "Opslaan…",
    back: "Terug",
    backToDashboard: "Terug naar dashboard",
    viewDetails: "Bekijk details",
    noMiniSite: "Geen mini-site",
    none: "— Geen —",

    // Dashboard
    dashboardTitle: "Dashboard",
    dashboardSubtitle: "Beheer je bedrijfsregistraties",
    myBusinesses: "Mijn bedrijven",
    noBusinesses: "Je hebt nog geen bedrijven",
    business: "bedrijf",
    businessesPlural: "bedrijven",
    addFirstBusiness: "Begin met het toevoegen van je eerste bedrijf",
    addBusiness: "Bedrijf toevoegen",
    edit: "Bewerken",
    view: "Mini-site",

    // Create
    businessCreateTitle: "Bedrijf aanmaken",
    businessCreateSubtitle: "Registreer je bedrijf.",
    businessName: "Bedrijfsnaam",
    island: "Eiland",
    selectIsland: "Selecteer eiland",
    category: "Categorie",
    selectCategory: "Selecteer categorie",
    description: "Beschrijving",
    descriptionPlaceholder: "Vertel iets over je bedrijf…",
    address: "Adres",
    phone: "Telefoon",
    website: "Website",
    createBusinessCta: "Bedrijf registreren",

    // Create validation / status
    missingRequired: "Verplichte velden ontbreken",
    fillRequired: "Vul minimaal een bedrijfsnaam en eiland in.",
    created: "Bedrijf aangemaakt",
    error: "Fout",
    saveError: "Kon bedrijf niet opslaan",

    // Biz detail
    contact: "Contact",
  },

  es: {
    // Navigation / common
    forBusiness: "Para Negocios",
    aruba: "Aruba",
    bonaire: "Bonaire",
    curacao: "Curaçao",
    businesses: "Negocios",
    blog: "Blog",
    faq: "Preguntas",
    islandsMenu: "Islas",
    blogGuides: "Blog & Guías",
    whyABC: "¿Por qué ABC Islands?",
    getStarted: "Comenzar",
    connect: "Conectar",

    // Hero
    exploreIslands: "Descubre las Islas ABC",
    faqSubtitle:
      "Tu guía completa de Aruba, Bonaire y Curaçao — playas, restaurantes, tours y negocios locales de confianza.",
    exploreIslandsCta: "Explorar Islas",

    // For Business page
    fbHeroTitle: "Haz crecer tu negocio en las Islas ABC",
    fbHeroSubtitle:
      "Crea tu mini-sitio profesional, llega a clientes y crece con nuestra plataforma todo-en-uno.",
    fbHeroCta: "Comienza – Prueba gratis",
    fbPricingTitle: "Precios simples y transparentes",
    fbFeaturesTitle: "Todo lo que necesitas para tener éxito",
    fbFaqTitle: "Preguntas frecuentes",
    fbFinalCtaTitle: "¿Listo para crecer?",
    fbFinalCtaSubtitle:
      "Únete a cientos de negocios que ya llegan a más clientes en las Islas ABC.",

    // Menu
    menu_for_business: "Para Negocios",
    menu_sign_in_business: "Iniciar sesión",
    menu_register_business: "Registrar nuevo negocio",
    menu_dashboard: "Panel",

    // Auth
    businessAuthTitle: "Cuenta de Negocio",
    businessAuthSubtitle:
      "Inicia sesión o regístrate para gestionar tu negocio",
    signIn: "Iniciar sesión",
    signUp: "Registrarse",
    fullName: "Nombre completo",
    email: "Correo",
    password: "Contraseña",
    logout: "Cerrar sesión",

    // Forgot / Reset
    forgot_title: "¿Olvidaste tu contraseña?",
    forgot_sub:
      "Introduce tu correo. Te enviaremos un enlace para restablecer la contraseña.",
    send_reset_link: "Enviar enlace de restablecimiento",
    sent_check_email: "Te enviamos un correo con más instrucciones.",
    reset_title: "Crear nueva contraseña",
    new_pw: "Nueva contraseña",
    confirm_pw: "Confirmar contraseña",
    save_pw: "Guardar contraseña",
    pw_too_short: "La contraseña debe tener al menos 8 caracteres.",
    pw_mismatch: "Las contraseñas no coinciden.",

    show_pw: "Mostrar contraseña",
    hide_pw: "Ocultar contraseña",

    // Generic UI
    sending: "Enviando…",
    saving: "Guardando…",
    back: "Atrás",
    backToDashboard: "Volver al panel",
    viewDetails: "Ver detalles",
    noMiniSite: "Sin mini-sitio",
    none: "— Ninguno —",

    // Dashboard
    dashboardTitle: "Panel",
    dashboardSubtitle: "Administra tus registros de negocio",
    myBusinesses: "Mis negocios",
    noBusinesses: "Todavía no tienes negocios",
    business: "negocio",
    businessesPlural: "negocios",
    addFirstBusiness: "Comienza agregando tu primer negocio",
    addBusiness: "Agregar negocio",
    edit: "Editar",
    view: "Mini-sitio",

    // Create
    businessCreateTitle: "Crear negocio",
    businessCreateSubtitle: "Registra tu negocio.",
    businessName: "Nombre del negocio",
    island: "Isla",
    selectIsland: "Selecciona isla",
    category: "Categoría",
    selectCategory: "Selecciona categoría",
    description: "Descripción",
    descriptionPlaceholder: "Cuéntanos sobre tu negocio…",
    address: "Dirección",
    phone: "Teléfono",
    website: "Sitio web",
    createBusinessCta: "Crear negocio",

    // Create validation / status
    missingRequired: "Faltan campos obligatorios",
    fillRequired:
      "Introduce al menos un nombre de negocio y la isla.",
    created: "Negocio creado",
    error: "Error",
    saveError: "No se pudo guardar el negocio",

    // Biz detail
    contact: "Contacto",
  },

  pap: {
    // Navigation / common
    forBusiness: "Pa Negoshi",
    aruba: "Aruba",
    bonaire: "Boneiru",
    curacao: "Kòrsou",
    businesses: "Negoshinan",
    blog: "Blog",
    faq: "Preguntanan",
    islandsMenu: "Islanan",
    blogGuides: "Blog & Guia",
    whyABC: "Dikon ABC Islands?",
    getStarted: "Kuminsá",
    connect: "Konektá",

    // Hero
    exploreIslands: "Deskubrí Islanan ABC",
    faqSubtitle:
      "Bo guía kompleto pa Aruba, Boneiru i Kòrsou — playa, restoran, tour i negoshinan local ku ta konfiabel.",
    exploreIslandsCta: "Eksplorá Islanan",

    // For Business page
    fbHeroTitle: "Laga bo negoshi krese riba Islanan ABC",
    fbHeroSubtitle:
      "Krea bo mini-site profesional, yega na kliente i krese ku nos plataforma tur-den-un.",
    fbHeroCta: "Kuminsá – Purba gratis",
    fbPricingTitle: "Preisnan simpel i transparante",
    fbFeaturesTitle: "Tur kos ku bo mester pa ta eksitoso",
    fbFaqTitle: "Preguntanan Frekuente",
    fbFinalCtaTitle: "Kla pa krese bo negoshi?",
    fbFinalCtaSubtitle:
      "Uni ku hopi negoshi ku ta yegando na mas kliente riba Islanan ABC.",

    // Menu
    menu_for_business: "Pa Negoshiante",
    menu_sign_in_business: "Log in",
    menu_register_business: "Registra un negoshi nobo",
    menu_dashboard: "Dashboard",

    // Auth
    businessAuthTitle: "Info di bo Negoshi",
    businessAuthSubtitle: "Log in òf registrá pa manehá bo negoshi",
    signIn: "Log in",
    signUp: "Registrá",
    fullName: "Nòmber kompletu",
    email: "Email",
    password: "Kontraseña",
    logout: "Sali afó",

    // Forgot / Reset
    forgot_title: "Lubidá bo kódigo",
    forgot_sub: "Yena bo email. Nos ta manda un link pa reset bo kódigo.",
    send_reset_link: "Manda link pa reset",
    sent_check_email: "Nos a manda bo un email ku mas instrukshon.",
    reset_title: "Yena un kódigo nobo",
    new_pw: "Kódigo nobo",
    confirm_pw: "Konfirma bo kódigo",
    save_pw: "Warda kódigo",
    pw_too_short: "Kódigo mester tin minimo 8 karákter.",
    pw_mismatch: "E kódigonan no ta meskos.",
    show_pw: "Mustra kontraseña",
    hide_pw: "Skonde kontraseña",

    // Generic UI
    sending: "Mandando…",
    saving: "Warda…",
    back: "Bek",
    backToDashboard: "Bek na dashboard",
    viewDetails: "Mira detaye",
    noMiniSite: "Sin mini-site",
    none: "— Ningun —",

    // Dashboard
    dashboardTitle: "Dashboard",
    dashboardSubtitle: "Manehá bo registrashonnan di negoshi",
    myBusinesses: "Mi negoshinan",
    noBusinesses: "Bo no tin ningun negoshi todavía",
    business: "negoshi",
    businessesPlural: "negoshinan",
    addFirstBusiness: "Kuminsá ku agrega bo prome negoshi",
    addBusiness: "Agrega negoshi",
    edit: "Editá",
    view: "Mini-site",

    // Create
    businessCreateTitle: "Krea negoshi",
    businessCreateSubtitle: "Registrá bo negoshi.",
    businessName: "Nòmber di negoshi",
    island: "Isla",
    selectIsland: "Skohe isla",
    category: "Kategoria",
    selectCategory: "Skohe kategoria",
    description: "Deskripshon",
    descriptionPlaceholder: "Kontá tiki tok tok tok tok tok",
    address: "Adres",
    phone: "Telefòn",
    website: "Website",
    createBusinessCta: "Registrá negoshi",

    // Create validation / status
    missingRequired: "Kampo obligatorio ta falta",
    fillRequired: "Yena minimo nòmber di negoshi i isla.",
    created: "Negoshi a wordu krea",
    error: "Eror",
    saveError: "No por a warda negoshi",

    // Biz detail
    contact: "Kontakt",
  },
};