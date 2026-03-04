"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import Image from "next/image";
import Link from "next/link";
import LogoVca from "../../../../public/assets/logo-vca.png";

import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";

import { useUser } from "@/hooks/use-user";
import { useState } from "react";

const NEXT_PUBLIC_GOOGLE_SITE_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_KEY || "";

const formSchema = z.object({
  email: z.string().email("Informe um e-mail válido!"),
  senha: z.string().min(1, "Utilize uma senha válida!"),
  recaptcha: z.boolean().refine((captcha) => captcha === true, {
    message: "Validação reCAPTCHA necessária. Tente novamente.",
  }),
});

type FormType = z.infer<typeof formSchema>;

export function LoginForm() {
  const {
    register,
    formState: { errors, isSubmitting },
    setError,
    handleSubmit,
    setValue,
  } = useForm<FormType>({
    resolver: zodResolver(formSchema),
  });
  const { login } = useUser();
  const router = useRouter();
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = async (data: FormType) => {
    try {
      const isLogged = await login(data.email, data.senha);

      if (isLogged) {
        router.refresh();
        router.push("/dashboard");
        return;
      }

      setError("senha", {
        message: "Credenciais inválidas",
      });
    } catch (error) {
      setError("senha", {
        message: error instanceof Error ? error.message : "Erro inesperado",
      });
    }
  };

  return (
    <div className="w-full max-w-[440px] animate-slide-up">
      {/* Glass card */}
      <div className="glass rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/20">
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/25">
            <Image
              width={40}
              src={LogoVca}
              alt="Logo da VCA"
              className="brightness-0 invert"
            />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Bem-vindo de volta
          </h1>
          <p className="text-white/50 text-sm mt-2">
            Acesse a Plataforma de Soluções
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleLogin)} className="space-y-5">
          {/* Email field */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-xs font-medium text-white/70 uppercase tracking-wider"
            >
              E-mail
            </label>
            <div
              className={`relative rounded-xl transition-all duration-300 ${
                focusedField === "email"
                  ? "ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/10"
                  : ""
              }`}
            >
              <input
                {...register("email")}
                placeholder="email@vcaconstrutora.com.br"
                required
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                className="w-full h-12 px-4 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white placeholder:text-white/25 text-sm focus:outline-none transition-all duration-300 hover:bg-white/[0.08]"
              />
            </div>
            {errors.email && (
              <span className="text-xs text-rose-400 flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-xs font-medium text-white/70 uppercase tracking-wider"
              >
                Senha
              </label>
              <Link
                href="https://teams.microsoft.com/l/chat/0/0?users=felipe.santos@vcaconstrutora.com.br"
                target="_blank"
                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <div
              className={`relative rounded-xl transition-all duration-300 ${
                focusedField === "senha"
                  ? "ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/10"
                  : ""
              }`}
            >
              <input
                {...register("senha")}
                type="password"
                required
                placeholder="••••••••"
                onFocus={() => setFocusedField("senha")}
                onBlur={() => setFocusedField(null)}
                className="w-full h-12 px-4 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white placeholder:text-white/25 text-sm focus:outline-none transition-all duration-300 hover:bg-white/[0.08]"
              />
            </div>
            {errors.senha && (
              <span className="text-xs text-rose-400 flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.senha.message}
              </span>
            )}
          </div>

          {/* reCAPTCHA */}
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="rounded-xl overflow-hidden">
              <ReCAPTCHA
                onChange={() =>
                  setValue("recaptcha", true, { shouldValidate: true })
                }
                onExpired={() =>
                  setValue("recaptcha", false, { shouldValidate: true })
                }
                sitekey={NEXT_PUBLIC_GOOGLE_SITE_KEY}
                theme="dark"
              />
            </div>
            {errors.recaptcha?.message && (
              <span className="text-xs text-rose-400">
                {errors.recaptcha.message}
              </span>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 text-white font-semibold text-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-sky-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center justify-center gap-2">
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Entrando...
                </>
              ) : (
                <>
                  Acessar
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </>
              )}
            </span>
          </button>
        </form>

        {/* Footer link */}
        <div className="mt-8 text-center">
          <span className="text-white/40 text-sm">
            Não tem acesso?{" "}
            <Link
              target="_blank"
              href="https://ac6oxj9qarv.typeform.com/to/J3FeBlEQ"
              className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
            >
              Solicite aqui
            </Link>
          </span>
        </div>
      </div>

      {/* Bottom branding */}
      <div className="flex items-center justify-center gap-2 mt-8 animate-fade-in">
        <span className="text-white/30 text-xs">Desenvolvido por</span>
        <span className="text-white/50 text-xs font-semibold tracking-wide">
          VCA Tech
        </span>
      </div>
    </div>
  );
}
