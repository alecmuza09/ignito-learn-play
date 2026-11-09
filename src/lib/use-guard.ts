import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { loadProfile, useProfile } from "@/lib/profile";

/** Signed-in account required; sends guests to /auth. */
export function useRequireAuth() {
  const auth = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    if (auth.ready && !auth.session) nav({ to: "/auth" });
  }, [auth.ready, auth.session, nav]);
  return auth;
}

/** Signed-in account and an active learner required; otherwise go pick one in /familia. */
export function useRequireLearner() {
  const auth = useRequireAuth();
  const profile = useProfile();
  const nav = useNavigate();
  useEffect(() => {
    if (auth.ready && auth.session && !loadProfile()) nav({ to: "/familia" });
  }, [auth.ready, auth.session, profile, nav]);
  return profile;
}
