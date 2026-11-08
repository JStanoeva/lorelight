import { supabase } from "../../../lib/supabase.js";

function onAuthChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));

  return () => data.subscription.unsubscribe();
}

async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw error;
  }

  return data;
}

async function signUp({ email, password, username }) {
  // A database trigger creates the user's profile from this username.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username: username.toLowerCase() } },
  });

  if (error) {
    throw error;
  }

  return data;
}

async function signOut() {
  // "local" ends only this browser's session, not the account's sessions elsewhere.
  const { error } = await supabase.auth.signOut({ scope: "local" });

  if (!error) {
    return;
  }

  // Supabase clears the stored session even when the request fails, so report the error only
  // if this browser is still logged in (e.g. offline with an expired token).
  const { data, error: sessionError } = await supabase.auth.getSession();

  if (data.session || sessionError) {
    throw error;
  }
}

async function isUsernameTaken(username) {
  // Usernames are saved in lowercase, so this check ignores letter case.
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username.toLowerCase())
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data !== null;
}

export const authService = { onAuthChange, signIn, signUp, signOut, isUsernameTaken };
