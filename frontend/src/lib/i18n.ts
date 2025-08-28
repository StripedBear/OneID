"use client";

type Locale = "ru" | "en";

const messages: Record<Locale, Record<string, string>> = {
  ru: {
    app_title: "OneID — живая записная книжка",
    nav_login: "Войти",
    nav_register: "Регистрация",
    nav_dashboard: "Дашборд",
    nav_contacts: "Контакты",
    nav_logout: "Выйти",

    login_title: "Войти",
    login_email: "Email",
    login_password: "Пароль",
    login_submit: "Войти",

    register_title: "Регистрация",
    register_submit: "Создать аккаунт",

    dashboard_my_channels: "Мои каналы",
    dashboard_add_channel: "Добавить канал",
    dashboard_delete: "Удалить",
    dashboard_public_profile: "Публичный профиль",
    dashboard_not_logged_in: "Вы не вошли в систему.",
    dashboard_go_login: "Перейти на страницу входа",
  },
  en: {
    app_title: "OneID — living address book",
    nav_login: "Log in",
    nav_register: "Sign up",
    nav_dashboard: "Dashboard",
    nav_contacts: "Contacts",
    nav_logout: "Log out",

    login_title: "Log in",
    login_email: "Email",
    login_password: "Password",
    login_submit: "Log in",

    register_title: "Sign up",
    register_submit: "Create account",

    dashboard_my_channels: "My channels",
    dashboard_add_channel: "Add channel",
    dashboard_delete: "Delete",
    dashboard_public_profile: "Public profile",
    dashboard_not_logged_in: "You are not logged in.",
    dashboard_go_login: "Go to login",
  },
};

export function t(key: string, locale: Locale = (typeof navigator !== "undefined" && navigator.language.startsWith("ru") ? "ru" : "en")) {
  return messages[locale][key] ?? messages.en[key] ?? key;
}

export function setLocalePreference(locale: Locale) {
  if (typeof window !== "undefined") localStorage.setItem("locale", locale);
}

export function getLocalePreference(): Locale {
  if (typeof window === "undefined") return "ru";
  const saved = localStorage.getItem("locale");
  return (saved === "en" || saved === "ru") ? saved : (navigator.language.startsWith("ru") ? "ru" : "en");
}


