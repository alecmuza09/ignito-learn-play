import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, BookOpen, Search, ShieldCheck, Users, Baby, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/lib/auth";
import { adminDeleteUser, adminSetSuspended } from "@/lib/admin.functions";
import { levelTitle } from "@/lib/profile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type LearnerRow = Database["public"]["Tables"]["learners"]["Row"];
type RoleRow = Database["public"]["Tables"]["user_roles"]["Row"];
type ActivityRow = Database["public"]["Tables"]["activity_log"]["Row"];

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Administración — IGNOTO" }] }),
  component: Admin,
});

const TYPE_LABEL: Record<string, string> = {
  session_start: "Inició sesión de aprendizaje",
  lesson_done: "Completó una lección",
  xp: "Ganó XP",
  chat: "Habló con su compañero",
};

const fmtDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })
    : "—";
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

function Admin() {
  const auth = useAuth();
  const nav = useNavigate();
  const setSuspended = useServerFn(adminSetSuspended);
  const deleteUser = useServerFn(adminDeleteUser);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [learners, setLearners] = useState<LearnerRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.ready) return;
    if (!auth.session) nav({ to: "/auth" });
  }, [auth.ready, auth.session, nav]);

  const load = useCallback(async () => {
    setLoading(true);
    const since = new Date(Date.now() - 14 * 86_400_000).toISOString();
    const [p, l, r, a] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("learners").select("*").order("last_active_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
      supabase
        .from("activity_log")
        .select("*")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(5000),
    ]);
    setProfiles(p.data ?? []);
    setLearners(l.data ?? []);
    setRoles(r.data ?? []);
    setActivity(a.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (auth.isAdmin) void load();
  }, [auth.isAdmin, load]);

  const emailById = useMemo(
    () => new Map(profiles.map((p) => [p.id, p.email ?? p.display_name])),
    [profiles],
  );
  const learnerById = useMemo(() => new Map(learners.map((l) => [l.id, l])), [learners]);
  const adminIds = useMemo(
    () => new Set(roles.filter((r) => r.role === "admin").map((r) => r.user_id)),
    [roles],
  );

  const daily = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(Date.now() - (13 - i) * 86_400_000);
      return {
        key: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" }),
        lecciones: 0,
        sesiones: 0,
        chats: 0,
      };
    });
    const byKey = new Map(days.map((d) => [d.key, d]));
    for (const a of activity) {
      const d = byKey.get(a.created_at.slice(0, 10));
      if (!d) continue;
      if (a.type === "lesson_done") d.lecciones++;
      else if (a.type === "session_start") d.sesiones++;
      else if (a.type === "chat") d.chats++;
    }
    return days;
  }, [activity]);

  if (!auth.ready || (auth.session && !auth.account)) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-muted-foreground">Cargando…</div>
    );
  }
  if (!auth.isAdmin) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-center px-4">
        <div>
          <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="font-display text-2xl font-bold mt-3">Acceso restringido</h1>
          <p className="text-muted-foreground mt-1">Esta sección es solo para administradores.</p>
        </div>
      </div>
    );
  }

  const q = query.trim().toLowerCase();
  const filteredUsers = profiles.filter(
    (p) => !q || `${p.email} ${p.display_name}`.toLowerCase().includes(q),
  );
  const filteredLearners = learners.filter(
    (l) => !q || `${l.name} ${emailById.get(l.owner_id) ?? ""}`.toLowerCase().includes(q),
  );
  const kids = learners.filter((l) => l.kind !== "adult").length;
  const lessonsDone = learners.reduce((sum, l) => sum + l.completed_lessons.length, 0);
  const active7 = new Set(
    activity
      .filter((a) => Date.now() - new Date(a.created_at).getTime() < 7 * 86_400_000)
      .map((a) => a.owner_id),
  ).size;

  async function run(id: string, fn: () => Promise<unknown>) {
    setBusy(id);
    setError(null);
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  const toggleAdmin = (p: ProfileRow) =>
    run(p.id, async () => {
      if (adminIds.has(p.id)) {
        if (p.id === auth.user?.id)
          throw new Error("No puedes quitarte el rol de admin a ti mismo.");
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", p.id)
          .eq("role", "admin");
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: p.id, role: "admin" });
        if (error) throw error;
      }
    });

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 pb-24">
      <header className="flex flex-wrap items-end gap-4 mb-6">
        <div className="flex-1 min-w-[220px]">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
            Panel de administración
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight">IGNOTO</h1>
        </div>
        <label className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar usuarios o aprendices"
            className="w-full rounded-xl bg-card border border-border pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 ring-primary"
          />
        </label>
      </header>

      {error && (
        <p className="mb-4 rounded-xl bg-destructive/10 text-destructive text-sm px-3 py-2">
          {error}
        </p>
      )}

      <section className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <Kpi icon={<Users className="h-4 w-4" />} label="Cuentas" value={profiles.length} />
        <Kpi icon={<Baby className="h-4 w-4" />} label="Niños" value={kids} />
        <Kpi
          icon={<UserRound className="h-4 w-4" />}
          label="Adultos"
          value={learners.length - kids}
        />
        <Kpi
          icon={<BookOpen className="h-4 w-4" />}
          label="Lecciones completadas"
          value={lessonsDone}
        />
        <Kpi
          icon={<Activity className="h-4 w-4" />}
          label="Cuentas activas (7 días)"
          value={active7}
        />
      </section>

      <Tabs defaultValue="resumen">
        <TabsList className="mb-4">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
          <TabsTrigger value="aprendices">Aprendices</TabsTrigger>
          <TabsTrigger value="actividad">Actividad</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen">
          <div className="rounded-2xl bg-card border border-border p-4">
            <h2 className="font-bold mb-1">Actividad de los últimos 14 días</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Sesiones iniciadas, lecciones completadas y conversaciones con los compañeros.
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={daily} barGap={2}>
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    stroke="var(--muted-foreground)"
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    width={28}
                    stroke="var(--muted-foreground)"
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    cursor={{ fill: "var(--muted)" }}
                  />
                  <Bar dataKey="sesiones" name="Sesiones" fill="var(--sky)" radius={[4, 4, 0, 0]} />
                  <Bar
                    dataKey="lecciones"
                    name="Lecciones"
                    fill="var(--primary)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar dataKey="chats" name="Chats" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-4 rounded-2xl bg-card border border-border p-4">
            <h2 className="font-bold mb-3">Aprendices más activos</h2>
            <ol className="space-y-2">
              {[...learners]
                .sort((a, b) => b.xp - a.xp)
                .slice(0, 5)
                .map((l, i) => (
                  <li key={l.id} className="flex items-center gap-3 text-sm">
                    <span className="w-5 text-muted-foreground font-bold">{i + 1}</span>
                    <span className="text-xl">{l.avatar}</span>
                    <span className="font-semibold flex-1 truncate">{l.name}</span>
                    <span className="text-muted-foreground">{levelTitle(l.xp).name}</span>
                    <span className="font-bold tabular-nums">{l.xp} XP</span>
                  </li>
                ))}
              {learners.length === 0 && (
                <li className="text-sm text-muted-foreground">Aún no hay aprendices.</li>
              )}
            </ol>
          </div>
        </TabsContent>

        <TabsContent value="usuarios">
          <TableShell loading={loading} empty={filteredUsers.length === 0}>
            <thead>
              <tr>
                <Th>Cuenta</Th>
                <Th>Rol</Th>
                <Th>Perfiles</Th>
                <Th>Alta</Th>
                <Th>Última visita</Th>
                <Th>Estado</Th>
                <Th className="text-right">Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((p) => {
                const isAdmin = adminIds.has(p.id);
                const isMe = p.id === auth.user?.id;
                return (
                  <tr key={p.id} className="border-t border-border">
                    <Td>
                      <div className="font-semibold">{p.display_name || "—"}</div>
                      <div className="text-xs text-muted-foreground">{p.email}</div>
                    </Td>
                    <Td>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${isAdmin ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                      >
                        {isAdmin ? "Admin" : "Tutor"}
                      </span>
                    </Td>
                    <Td className="tabular-nums">
                      {learners.filter((l) => l.owner_id === p.id).length}
                    </Td>
                    <Td>{fmtDate(p.created_at)}</Td>
                    <Td>{fmtDate(p.last_seen_at)}</Td>
                    <Td>
                      {p.suspended ? (
                        <span className="text-destructive font-bold text-xs">Suspendida</span>
                      ) : (
                        <span className="text-xs font-bold text-mint-foreground">Activa</span>
                      )}
                    </Td>
                    <Td className="text-right whitespace-nowrap">
                      <div className="inline-flex gap-1">
                        <ActionBtn disabled={busy === p.id || isMe} onClick={() => toggleAdmin(p)}>
                          {isAdmin ? "Quitar admin" : "Hacer admin"}
                        </ActionBtn>
                        <ActionBtn
                          disabled={busy === p.id || isMe}
                          onClick={() =>
                            run(p.id, () =>
                              setSuspended({ data: { userId: p.id, suspended: !p.suspended } }),
                            )
                          }
                        >
                          {p.suspended ? "Reactivar" : "Suspender"}
                        </ActionBtn>
                        <ActionBtn
                          danger
                          disabled={busy === p.id || isMe}
                          onClick={() => {
                            if (
                              prompt(
                                `Escribe BORRAR para eliminar la cuenta ${p.email} y todos sus perfiles.`,
                              ) !== "BORRAR"
                            )
                              return;
                            void run(p.id, () => deleteUser({ data: { userId: p.id } }));
                          }}
                        >
                          Borrar
                        </ActionBtn>
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </TableShell>
        </TabsContent>

        <TabsContent value="aprendices">
          <TableShell loading={loading} empty={filteredLearners.length === 0}>
            <thead>
              <tr>
                <Th>Aprendiz</Th>
                <Th>Tipo</Th>
                <Th>Cuenta</Th>
                <Th>Nivel</Th>
                <Th>Lecciones</Th>
                <Th>Racha</Th>
                <Th>Última actividad</Th>
                <Th className="text-right">Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {filteredLearners.map((l) => (
                <tr key={l.id} className="border-t border-border">
                  <Td>
                    <span className="mr-1.5">{l.avatar}</span>
                    <span className="font-semibold">{l.name}</span>
                  </Td>
                  <Td>{l.kind === "adult" ? "Adulto" : `Niño · ${l.age}`}</Td>
                  <Td className="text-xs text-muted-foreground">
                    {emailById.get(l.owner_id) ?? "—"}
                  </Td>
                  <Td>
                    {levelTitle(l.xp).name}{" "}
                    <span className="text-muted-foreground tabular-nums">({l.xp} XP)</span>
                  </Td>
                  <Td className="tabular-nums">{l.completed_lessons.length}</Td>
                  <Td className="tabular-nums">{l.streak} 🔥</Td>
                  <Td>{fmtDate(l.last_active_at)}</Td>
                  <Td className="text-right">
                    <ActionBtn
                      danger
                      disabled={busy === l.id}
                      onClick={() => {
                        if (!confirm(`¿Borrar el perfil de ${l.name} y todo su progreso?`)) return;
                        void run(l.id, async () => {
                          const { error } = await supabase.from("learners").delete().eq("id", l.id);
                          if (error) throw error;
                        });
                      }}
                    >
                      Borrar
                    </ActionBtn>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </TabsContent>

        <TabsContent value="actividad">
          <div className="rounded-2xl bg-card border border-border divide-y divide-border">
            {activity.slice(0, 100).map((a) => {
              const l = a.learner_id ? learnerById.get(a.learner_id) : undefined;
              return (
                <div key={a.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  <span className="text-lg w-6 text-center">{l?.avatar ?? "👤"}</span>
                  <span className="font-semibold">
                    {l?.name ?? emailById.get(a.owner_id) ?? "—"}
                  </span>
                  <span className="text-muted-foreground flex-1 truncate">
                    {TYPE_LABEL[a.type] ?? a.type}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {fmtTime(a.created_at)}
                  </span>
                </div>
              );
            })}
            {activity.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">
                Sin actividad en los últimos 14 días.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}

function Kpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-4">
      <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="font-display text-3xl font-bold tabular-nums mt-1">{value}</div>
    </div>
  );
}

function TableShell({
  loading,
  empty,
  children,
}: {
  loading: boolean;
  empty: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-card border border-border overflow-x-auto">
      <table className="w-full text-sm">{children}</table>
      {loading ? (
        <p className="p-4 text-sm text-muted-foreground">Cargando…</p>
      ) : (
        empty && <p className="p-4 text-sm text-muted-foreground">Sin resultados.</p>
      )}
    </div>
  );
}
const Th = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <th
    className={`text-left text-xs font-bold uppercase tracking-wide text-muted-foreground px-4 py-2.5 ${className}`}
  >
    {children}
  </th>
);
const Td = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <td className={`px-4 py-2.5 align-middle ${className}`}>{children}</td>
);
function ActionBtn({
  children,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-2.5 py-1 text-xs font-bold border transition-colors disabled:opacity-40 ${danger ? "border-destructive/30 text-destructive hover:bg-destructive/10" : "border-border hover:bg-muted"}`}
    >
      {children}
    </button>
  );
}
