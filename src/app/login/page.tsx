import bannerDesktop from "../../../public/assets/banner-vca-tech.jpg";
import { LoginForm } from "./_components/login-form";

export default function Login() {
  return (
    <main className="relative flex p-4 w-full h-screen justify-center md:justify-end bg-[#151515] md:bg-[#0e0e0e] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-left z-0 hidden md:block"
        style={{
          backgroundImage: `url(${bannerDesktop.src})`,
        }}
      />

      {/* Conteúdo */}
      <div className="z-10">
        <LoginForm />
      </div>
    </main>
  );
}
