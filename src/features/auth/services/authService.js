import { supabase } from "../../../lib/supabase.js";

// Calls `callback(session)` for the stored session first, then after every login, logout
// and token refresh. Returns a function that stops listening.
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
  // "local" ends only this browser's session. Several people may share the public demo
  // account, and the default ("global") would log every one of them out.
  const { error } = await supabase.auth.signOut({ scope: "local" });

  if (!error) {
    return;
  }

  // Supabase clears the stored session even when the server request fails, so most errors
  // still mean "logged out". Report the error only if this browser is still logged in,
  // e.g. when the session couldn't even be loaded (offline with an expired token).
  const { data, error: sessionError } = await supabase.auth.getSession();

  if (data.session || sessionError) {
    throw error;
  }
}

async function isUsernameTaken(username) {
  // Usernames are saved in lowercase, so comparing the lowercase form ignores letter case.
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
