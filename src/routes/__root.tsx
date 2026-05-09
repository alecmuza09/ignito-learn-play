import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, createRootRouteWithContext, useRouter, HeadContent, Scripts, Link,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { AppHeader } from "@/components/AppHeader";
import { IgnoFloating } from "@/components/Igno";

function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 text-center">
      <div>
        <div className="text-8xl">🦉</div>
        <h1 className="font-display text-5xl font-bold mt-4">¡Ups! 404</h1>
        <p className="text-muted-foreground mt-2">IGNO no encontró esta página.</p>
        <Link to="/" className="inline-block mt-6 rounded-full bg-primary text-primary-foreground px-6 py-3 font-bold shadow-pop">Volver al inicio</Link>
      </div>
    </div>
  );
}

function ErrorView({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 text-center">
      <div className="max-w-md">
        <div className="text-7xl animate-wiggle">😵‍💫</div>
        <h1 className="font-display text-3xl font-bold mt-3">Algo se torció</h1>
        <p className="text-muted-foreground mt-2 text-sm">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-5 rounded-full bg-primary text-primary-foreground px-5 py-2.5 font-bold">Intentar de nuevo</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "IGNOTO — Aprendizaje adaptativo con IA para niños" },
      { name: "description", content: "Plataforma educativa gamificada con IA que se adapta a los intereses y nivel de cada niño." },
      { property: "og:title", content: "IGNOTO — Aprendizaje adaptativo con IA para niños" },
      { property: "og:description", content: "Plataforma educativa gamificada con IA que se adapta a los intereses y nivel de cada niño." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "IGNOTO — Aprendizaje adaptativo con IA para niños" },
      { name: "twitter:description", content: "Plataforma educativa gamificada con IA que se adapta a los intereses y nivel de cada niño." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2925d684-3c07-4d93-bc3e-b47348d04b3e/id-preview-b38c7664--9d946c84-4817-469b-91b4-91b6d4b80606.lovable.app-1778361756882.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2925d684-3c07-4d93-bc3e-b47348d04b3e/id-preview-b38c7664--9d946c84-4817-469b-91b4-91b6d4b80606.lovable.app-1778361756882.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: ErrorView,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AppHeader />
      <Outlet />
      <IgnoFloating />
    </QueryClientProvider>
  );
}
