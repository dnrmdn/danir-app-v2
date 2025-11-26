"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signUp } from "@/lib/auth-client"

export function useSignUpHandler() {
    const router = useRouter()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)


        if (password !== confirmPassword) {
            setError("Password dan konfirmasi password tidak cocok")
            return
        }
        setLoading(true)

        try {
            const result = await signUp.email({
                name, email, password
            })
            if (result.error) {
                // 🔍 Deteksi error spesifik
                const message =
                    result.error.message?.toLowerCase().includes("already") ||
                        result.error.message?.toLowerCase().includes("exists")
                        ? "Email sudah terdaftar. Silakan login."
                        : "Gagal membuat akun. Silakan coba lagi."

                setError(message)
                return
            } else { // ✅ Berhasil daftar → redirect ke login
                setSuccess(true);
                setTimeout(() => {
                    router.push("/calender");
                }, 1000);
            }

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
