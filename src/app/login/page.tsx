"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Card from "@/components/ui/Card"
import { WaterButton } from "@/components/ui/WaterButton"
import BackgroundFX from "@/components/ui/BackgroundFX"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate login
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert("Connexion simulée réussie")
      router.push("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      alert("Erreur de connexion")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      // Simulate Google sign in
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert("Connexion Google simulée réussie")
      router.push("/dashboard")
    } catch (error) {
      console.error("Google sign in error:", error)
      setIsLoading(false)
    }
  }

  return (
    <>
      <BackgroundFX />
      <div className="min-h-screen flex items-center justify-center px-6">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Connexion</h1>
            <p className="text-neutral-400">Accédez à votre compte MiraiVPN</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/20"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/20"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Téléphone (optionnel)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/20"
                placeholder="+33 6 XX XX XX XX"
              />
            </div>

            <WaterButton
              type="submit"
              variant="primary"
              full
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Connexion..." : "Se connecter"}
            </WaterButton>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-neutral-400">Ou</span>
              </div>
            </div>

            <div className="mt-6">
              <WaterButton
                onClick={handleGoogleSignIn}
                variant="ghost"
                full
                disabled={isLoading}
                className="w-full"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continuer avec Google
              </WaterButton>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-neutral-400">
              Pas encore de compte ?{" "}
              <Link href="/register" className="text-white hover:underline">
                S'inscrire
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </>
  )
}
