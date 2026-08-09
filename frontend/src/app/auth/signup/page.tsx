"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);


  async function handleSignup() {

    if (!name || !email || !password) {
      setMessage("Please fill in all fields.");
      return;
    }


    setLoading(true);
    setMessage("Creating account...");


    const { error } = await supabase.auth.signUp({

      email,
      password,

      options: {
        data: {
          full_name: name,
        },
      },

    });


    setLoading(false);


    if (error) {
      setMessage(error.message);
      return;
    }


    setMessage(
      "Account created successfully! You can now log in."
    );

  }


  return (

    <main className="flex min-h-screen items-center justify-center bg-[#0B1020] px-6">

      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">


        <h1 className="text-3xl font-bold text-white">
          Create your account
        </h1>


        <p className="mt-2 text-gray-400">
          Start improving your copywriting skills with AI.
        </p>


        <input
          className="mt-6 w-full rounded-lg border border-white/10 bg-white/10 p-3 text-white outline-none placeholder:text-gray-500 focus:border-[#5B5CEB]"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />


        <input
          className="mt-4 w-full rounded-lg border border-white/10 bg-white/10 p-3 text-white outline-none placeholder:text-gray-500 focus:border-[#5B5CEB]"
          placeholder="Email address"
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


        <p className="mt-2 text-xs text-gray-500">
          Use at least 6 characters.
        </p>


        <button
          onClick={handleSignup}
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-[#5B5CEB] py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>


        <p className="mt-4 text-sm text-gray-400">
          {message}
        </p>


        <p className="mt-6 text-center text-sm text-gray-400">

          Already have an account?{" "}

          <Link
            href="/auth/login"
            className="text-[#7CFFB2] hover:underline"
          >
            Login
          </Link>

        </p>


      </div>

    </main>

  );

}