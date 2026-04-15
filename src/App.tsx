import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function App() {
  const [status, setStatus] = useState("Starting...");

  useEffect(() => {
    const run = async () => {
      setStatus("Checking session...");

      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr) {
        setStatus(`Session error: ${sessionErr.message}`);
        return;
      }

      if (!sessionData.session) {
        setStatus("No session, signing in anonymously...");
        const { error: anonErr } = await supabase.auth.signInAnonymously();
        if (anonErr) {
          setStatus(`Anon sign-in error: ${anonErr.message}`);
          return;
        }
      }
      
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) {
        setStatus(`User check error: ${userErr.message}`);
        return;
      }
      if (!userData.user) {
        setStatus("No authenticated user found after session setup.");
        return;
      }
      
      console.log("Authenticated user id:", userData.user.id);

      setStatus("Reading tasks...");
      const { data, error } = await supabase.from("tasks").select("*").limit(1);

      if (error) {
        setStatus(`Tasks query error: ${error.message}`);
        return;
      }

      setStatus(`Supabase OK. Query success. Rows returned: ${data?.length ?? 0}`);
    };

    run();
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Supabase Sanity Check</h1>
      <p>{status}</p>
    </main>
  );
}