"use client"

import * as React from "react"
import { useState } from "react"
import { UserPlus, Lock, Mail, User } from "lucide-react"

interface CleanMinimalSignUpProps {
  onSignUp?: (name: string, email: string, password: string) => void;
  onGoogleSignIn?: () => void;
  onSignIn?: () => void;
  loading?: boolean;
  error?: string;
}

const CleanMinimalSignUp = ({
  onSignUp,
  onGoogleSignIn,
  onSignIn,
  loading = false,
  error = "",
}: CleanMinimalSignUpProps) => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const handleSubmit = () => {
    onSignUp?.(name, email, password)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-8 backdrop-blur-xl shadow-2xl shadow-black/50">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 mb-6">
          <UserPlus className="w-7 h-7 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-semibold mb-2 text-center text-white">
          Create your account
        </h2>
        <p className="text-gray-400 text-sm mb-6 text-center">
          Start improving your copywriting skills with AI
        </p>
        <div className="w-full flex flex-col gap-3 mb-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <User className="w-4 h-4" />
            </span>
            <input
              placeholder="Full name"
              type="text"
              value={name}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 bg-white/5 text-white text-sm placeholder:text-gray-500"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <Mail className="w-4 h-4" />
            </span>
            <input
              placeholder="Email"
              type="email"
              value={email}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 bg-white/5 text-white text-sm placeholder:text-gray-500"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <Lock className="w-4 h-4" />
            </span>
            <input
              placeholder="Password"
              type="password"
              value={password}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 bg-white/5 text-white text-sm placeholder:text-gray-500"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {password.length > 0 && (
            <div className="w-full flex flex-col gap-1 text-[11px] px-1">
              <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-400" : "text-gray-500"}`}>
                <span>{hasMinLength ? "✓" : "•"}</span>
                <span>At least 6 characters</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasUppercase ? "text-emerald-400" : "text-gray-500"}`}>
                <span>{hasUppercase ? "✓" : "•"}</span>
                <span>1 uppercase letter</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasSpecialChar ? "text-emerald-400" : "text-gray-500"}`}>
                <span>{hasSpecialChar ? "✓" : "•"}</span>
                <span>1 special character</span>
              </div>
            </div>
          )}
          {error && (
            <div className="text-sm text-red-400 text-left">{error}</div>
          )}
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium py-2.5 rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 mb-4 mt-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Creating account..." : "Get Started"}
        </button>
        <div className="flex items-center w-full my-2">
          <div className="flex-grow border-t border-dashed border-white/10"></div>
          <span className="mx-2 text-xs text-gray-500">Or sign up with</span>
          <div className="flex-grow border-t border-dashed border-white/10"></div>
        </div>
        <div className="flex gap-3 w-full justify-center mt-2">
          <button
            onClick={onGoogleSignIn}
            disabled={loading}
            className="flex items-center justify-center w-12 h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 grow disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </button>
          <button className="flex items-center justify-center w-12 h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 grow">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </button>
          <button className="flex items-center justify-center w-12 h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 grow">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#ffffff" d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
          </button>
        </div>
        <p className="mt-6 text-center text-xs text-gray-500">
          Already have an account?{" "}
          <button onClick={onSignIn} className="text-indigo-400 hover:text-indigo-300 hover:underline font-medium">
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}

export { CleanMinimalSignUp }
