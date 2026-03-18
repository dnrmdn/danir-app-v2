"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { signUp } from "@/lib/auth-client"

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
const HONEYPOT_VALUE = ""
const MIN_SUBMIT_DELAY_MS = 1500

type SubmitOptions = {
    captchaToken?: string
    honeyField?: string
}

export function useSignUpHandler() {
    const router = useRouter()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null)
    const [startedAt, setStartedAt] = useState<number>(0)

    useEffect(() => {
        setStartedAt(Date.now())
    }, [])

    const handleSubmit = async (e: React.FormEvent, options?: SubmitOptions) => {
        e.preventDefault()
        setError(null)

        if (password !== confirmPassword) {
            setError("Password dan konfirmasi password tidak cocok")
            return
        }

        if ((options?.honeyField ?? HONEYPOT_VALUE).trim() !== "") {
            setError("Permintaan tidak valid.")
            return
        }

        if (Date.now() - startedAt < MIN_SUBMIT_DELAY_MS) {
            setError("Terlalu cepat. Coba kirim lagi sebentar.")
            return
        }

        if (TURNSTILE_SITE_KEY && !options?.captchaToken) {
            setError("Selesaikan verifikasi keamanan dulu ya.")
            return
        }

        setLoading(true)

        try {
            const result = await signUp.email({
                name,
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

            if (result.error) {
                const rawMessage = result.error.message?.toLowerCase() ?? ""
                const message =
                    rawMessage.includes("already") || rawMessage.includes("exists")
                        ? "Email sudah terdaftar. Silakan login."
                        : rawMessage.includes("too many") || rawMessage.includes("429")
                            ? "Terlalu banyak percobaan daftar. Coba lagi beberapa menit lagi."
                            : rawMessage.includes("captcha") || rawMessage.includes("verification")
                                ? "Verifikasi keamanan gagal. Coba ulang lagi."
                                : "Gagal membuat akun. Silakan coba lagi."

                setError(message)
                return
            }

            setSuccess(true)
            setTimeout(() => {
                router.push("/calendar")
            }, 1000)
        } catch (error) {
            console.error(error)
            setError("Terjadi kesalahan pada server. Silakan coba lagi nanti.")
        } finally {
            setLoading(false)
        }
    }

    return {
        name,
        email,
        password,
        confirmPassword,
        setName,
        setEmail,
        setPassword,
        setConfirmPassword,
        loading,
        success,
        error,
        handleSubmit,
    }
}
