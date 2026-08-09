"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);


  async function handleLogin() {

    if (!email || !password) {
      setMessage("Please enter your email and password.");
      return;
    }


    setLoading(true);
    setMessage("Logging in...");


    const { error } = await supabase.auth.signInWithPassword({

      email,
      password,

    });


    setLoading(false);


    if (error) {

      setMessage(error.message);
      return;

    }


    setMessage("Login successful!");

    router.push("/dashboard");

  }
  async function signInWithGoogle(){

    const { error } = await supabase.auth.signInWithOAuth({

      provider: "google",

      options: {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "http://localhost:3000/auth/callback",
      },

    });


    if(error){

      console.error(error);
      setMessage(error.message);

    }

  }

  return (

    <main className="flex min-h-screen items-center justify-center bg-[#0B1020] px-6">

      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">


        <h1 className="text-3xl font-bold text-white">
          Welcome back
        </h1>


        <p className="mt-2 text-gray-400">
          Continue improving your copywriting skills.
        </p>


        <input
          className="mt-6 w-full rounded-lg border border-white/10 bg-white/10 p-3 text-white outline-none placeholder:text-gray-500 focus:border-[#5B5CEB]"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />


        <input
          className="mt-4 w-full rounded-lg border border-white/10 bg-white/10 p-3 text-white outline-none placeholder:text-gray-500 focus:border-[#5B5CEB]"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={signInWithGoogle}
          className="mt-6 w-full rounded-lg border border-white/20 bg-white py-3 font-semibold text-black transition hover:opacity-90"
        >
          Continue with Google
        </button>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-[#5B5CEB] py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>


        <p className="mt-4 text-sm text-gray-400">
          {message}
        </p>


        <p className="mt-6 text-center text-sm text-gray-400">

          Don't have an account?{" "}

          <Link
            href="/auth/signup"
            className="text-[#7CFFB2] hover:underline"
          >
            Create one
          </Link>

        </p>


      </div>

    </main>

  );

}