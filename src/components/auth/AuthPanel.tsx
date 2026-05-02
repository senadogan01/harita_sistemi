"use client";

import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function AuthPanel() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const submit = async () => {
    setMessage(null);
    setIsLoading(true);

    const authCall =
      mode === "login"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });

    const { error } = await authCall;
    setIsLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (mode === "register") {
      setMessage("Kayıt oluşturuldu. Email doğrulama açıksa gelen kutunu kontrol et.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050711] text-white">
      <div className="mx-auto grid min-h-screen max-w-6xl place-items-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
          <div className="mb-6">
            <div className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200/70">Stratejik Harita</div>
            <h1 className="mt-3 text-2xl font-semibold text-white/95">
              {mode === "login" ? "Hesabına giriş yap" : "Yeni hesap oluştur"}
            </h1>
            <p className="mt-2 text-sm text-white/55">Verilerin hesabına bağlı saklanır ve sadece sen görebilirsin.</p>
          </div>

          <div className="space-y-3">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-200/35"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Şifre"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-200/35"
            />
          </div>

          {message ? <div className="mt-4 rounded-2xl border border-amber-200/15 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">{message}</div> : null}

          <button
            type="button"
            onClick={submit}
            disabled={isLoading || !email.trim() || password.length < 6}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mode === "login" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {isLoading ? "İşleniyor..." : mode === "login" ? "Giriş yap" : "Kayıt ol"}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setMessage(null);
            }}
            className="mt-4 w-full text-center text-sm text-white/60 hover:text-white/85"
          >
            {mode === "login" ? "Hesabın yok mu? Kayıt ol" : "Zaten hesabın var mı? Giriş yap"}
          </button>
        </div>
      </div>
    </div>
  );
}
