import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AVATARS, clearProfile, updateProfile, useProfile } from "@/lib/profile";

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [{ title: "Perfil — IGNOTO" }] }),
  component: Perfil,
});

function Perfil() {
  const profile = useProfile();
  const nav = useNavigate();
  if (!profile) return <div className="min-h-[60vh] grid place-items-center text-muted-foreground">Cargando…</div>;

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
      <h1 className="font-display text-3xl font-bold">👤 Tu perfil</h1>

      <section className="rounded-3xl bg-card border border-border p-5 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="text-6xl">{profile.avatar}</div>
          <div>
            <div className="font-display text-xl font-bold">{profile.childName}</div>
            <div className="text-sm text-muted-foreground">{profile.age} años</div>
          </div>
        </div>
        <div className="mt-5">
          <div className="text-sm font-bold mb-2">Cambia tu avatar</div>
          <div className="grid grid-cols-6 gap-2">
            {AVATARS.map((a) => (
              <button key={a} onClick={() => updateProfile({ avatar: a })}
                className={`aspect-square text-3xl rounded-2xl ${profile.avatar === a ? "bg-primary text-primary-foreground scale-110" : "bg-muted hover:bg-secondary"}`}>{a}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-card border border-border p-5 shadow-soft">
        <h2 className="font-display text-xl font-bold mb-3">Estadísticas</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          <Stat label="XP" value={profile.xp} />
          <Stat label="Monedas" value={profile.coins} />
          <Stat label="Racha" value={`${profile.streak}🔥`} />
        </div>
      </section>

      <button onClick={() => { if (confirm("¿Borrar tu perfil y empezar de nuevo?")) { clearProfile(); nav({ to: "/" }); } }}
        className="w-full rounded-full bg-destructive text-destructive-foreground py-3 font-bold">
        Reiniciar perfil
      </button>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-muted p-3">
      <div className="font-display text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
