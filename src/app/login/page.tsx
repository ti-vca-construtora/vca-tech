import { LoginForm } from "./_components/login-form";

export default function Login() {
  return (
    <main className="relative flex w-full min-h-screen items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-emerald-950/80 to-sky-950 animate-gradient" />

      {/* Mesh gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-600/15 blur-[120px] animate-float" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-sky-600/15 blur-[120px] animate-float-delayed" />
      <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-teal-500/10 blur-[100px] animate-pulse-glow" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating particles */}
      <div className="absolute top-20 left-20 w-2 h-2 bg-emerald-400/40 rounded-full animate-orbit" />
      <div className="absolute top-40 right-40 w-1.5 h-1.5 bg-sky-400/30 rounded-full animate-orbit-reverse" />
      <div className="absolute bottom-32 left-[40%] w-1 h-1 bg-teal-400/40 rounded-full animate-float" />

      {/* Content */}
      <div className="z-10 w-full flex items-center justify-center px-4">
        <LoginForm />
      </div>
    </main>
  );
}
