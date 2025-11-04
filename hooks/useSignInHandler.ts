"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "@/lib/auth-client"

export function useSignInHandler() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const result = await signIn.email({ email, password })

            // Kalau ada error dari API auth
            if (result?.error) {
                const message =
                    result.error.message?.toLowerCase().includes("not found") ||
                        result.error.message?.toLowerCase().includes("invalid")
                        ? "Email atau password salah. Silakan coba lagi."
                        : "Terjadi kesalahan saat login."

                setError(message)
                return
            } else {
                setSuccess(true);
                setTimeout(() => {
                    router.push("/calender");
                }, 1000);
            }

        } catch (err) {
            console.error(err)
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return {
        email,
        password,
        setEmail,
        setPassword,
        loading,
        success,
        error,
        handleSubmit,
    }
}
