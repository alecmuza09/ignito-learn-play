import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "es" | "en";

const KEY = "ignoto.lang.v1";

const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "es",
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(KEY) as Lang | null;
    if (saved === "es" || saved === "en") setLangState(saved);
  }, []);
  function setLang(l: Lang) {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem(KEY, l);
  }
  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  return useContext(LangCtx);
}

export function useT<T extends Record<Lang, unknown>>(dict: T): T[Lang] {
  const { lang } = useLang();
  return dict[lang];
}

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <div
      className={`inline-flex rounded-full border-2 border-border bg-card p-1 shadow-soft ${className}`}
      role="group"
      aria-label="Language"
    >
      {(["es", "en"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
            lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
          }`}
          aria-pressed={lang === l}
        >
          {l === "es" ? "ES" : "EN"}
        </button>
      ))}
    </div>
  );
}