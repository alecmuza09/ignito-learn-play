import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  Link,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { AppHeader } from "@/components/AppHeader";
import { IgnoFloating } from "@/components/Igno";
import { LanguageProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import { uiModeFor, useProfile } from "@/lib/profile";
import { useEffect } from "react";
import { KawaiiBlob } from "@/components/KawaiiBlob";

function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 text-center">
      <div>
        <div className="flex justify-center"><KawaiiBlob size={110} shape="pentagon" color="var(--sky)" /></div>
        <h1 className="font-display text-4xl font-semibold mt-4">Página no encontrada</h1>
        <p className="text-muted-foreground mt-2">El enlace no existe o cambió de lugar.</p>
        <Link
          to="/"
          className="inline-block mt-6 rounded-full bg-primary text-primary-foreground px-6 py-3 font-bold shadow-pop"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

function ErrorView({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 text-center">
      <div className="max-w-md">
        <div className="flex justify-center"><KawaiiBlob size={96} mood="sleepy" color="var(--coral)" /></div>
        <h1 className="font-display text-3xl font-semibold mt-3">Algo salió mal</h1>
        <p className="text-muted-foreground mt-2 text-sm">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-5 rounded-full bg-primary text-primary-foreground px-5 py-2.5 font-bold"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}

const SITE_TITLE = "IGNOTO · Tutor con IA para aprender a tu manera";
const SITE_DESCRIPTION =
  "Lecciones creadas con IA a partir de lo que te gusta y de tu nivel. Para niños desde 4 años y para adultos, con una cuenta familiar y progreso visible para todos.";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: SITE_TITLE },
      { name: "description", content: SITE_DESCRIPTION },
      { name: "theme-color", content: "#f6ecdf" },
      { name: "application-name", content: "IGNOTO" },
      { name: "apple-mobile-web-app-title", content: "IGNOTO" },
      { property: "og:site_name", content: "IGNOTO" },
      { property: "og:title", content: SITE_TITLE },
      { property: "og:description", content: SITE_DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "es_MX" },
      { property: "og:image", content: "/og-image.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "IGNOTO: tutor con IA para niños y adultos" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SITE_TITLE },
      { name: "twitter:description", content: SITE_DESCRIPTION },
      { name: "twitter:image", content: "/og-image.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=Lilita+One&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "IGNOTO",
          applicationCategory: "EducationalApplication",
          operatingSystem: "Web",
          inLanguage: ["es", "en"],
          description: SITE_DESCRIPTION,
          audience: { "@type": "EducationalAudience", educationalRole: ["student", "parent"] },
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: ErrorView,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-mode="kids">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <UiModeSync />
          <AppHeader />
          <Outlet />
          <IgnoFloating />
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

/** Kids get the playful theme; adult learners get a calmer, denser one. */
function UiModeSync() {
  const profile = useProfile();
  const mode = uiModeFor(profile);
  useEffect(() => {
    document.documentElement.dataset.mode = mode;
  }, [mode]);
  return null;
}

