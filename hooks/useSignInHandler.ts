"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "@/lib/auth-client"

type SubmitOptions = {
    captchaToken?: string
}

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

export function useSignInHandler() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent, options?: SubmitOptions) => {
        e.preventDefault()
        setError(null)

        if (TURNSTILE_SITE_KEY && !options?.captchaToken) {
            setError("Selesaikan verifikasi keamanan dulu ya.")
            return
        }

        setLoading(true)

        try {
            const result = await signIn.email({
                email,
                password,
                fetchOptions: {
                    headers: options?.captchaToken
                        ? {
                            "x-captcha-response": options.captchaToken,
                        }
                        : undefined,
                },
            })

            if (result?.error) {
                const rawMessage = result.error.message?.toLowerCase() ?? ""
                const message =
                    rawMessage.includes("not found") || rawMessage.includes("invalid")
                        ? "Email atau password salah. Silakan coba lagi."
                        : rawMessage.includes("too many") || rawMessage.includes("429")
                            ? "Terlalu banyak percobaan login. Coba lagi beberapa menit lagi."
                            : rawMessage.includes("captcha") || rawMessage.includes("verification")
                                ? "Verifikasi keamanan gagal. Coba ulang lagi."
                                : "Terjadi kesalahan saat login."

                setError(message)
                return
            }

            setSuccess(true)
            setTimeout(() => {
                router.push("/calendar")
            }, 1000)
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
