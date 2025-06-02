import Image from 'next/image'

export default function App() {
  return (
    <section className="w-full h-full flex items-center justify-center relative">
      <Image
        src="/assets/tela-dashboard.jpg"
        alt="Banner VCA Tech"
        fill
        className="rounded-xl hidden md:block"
      />
      <Image
        src="/assets/tela-dashboard-mobile.jpg"
        alt="Banner VCA Tech"
        fill
        className="rounded-xl block md:hidden"
      />
    </section>
  )
}
