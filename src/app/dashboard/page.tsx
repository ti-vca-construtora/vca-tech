"use client";

export default function App() {
  return (
    <section className="w-full h-full flex items-center justify-center relative overflow-hidden p-8">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-white to-sky-50/50" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-56 h-56 bg-sky-200/20 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 animate-slide-up">
        {/* Gradient icon */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-sky-600 flex items-center justify-center shadow-xl shadow-emerald-500/20">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
            />
          </svg>
        </div>

        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-emerald-700 bg-clip-text text-transparent">
            Plataforma de Soluções
          </h1>
          <p className="text-slate-500 text-sm max-w-md">
            Selecione um setor no menu lateral para acessar as ferramentas
            disponíveis para sua equipe.
          </p>
        </div>

        {/* Quick stats badges */}
        <div className="flex items-center gap-3 mt-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-emerald-700">
              Sistema Online
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 border border-sky-100">
            <div className="w-2 h-2 rounded-full bg-sky-500" />
            <span className="text-xs font-medium text-sky-700">
              Todos os serviços ativos
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
