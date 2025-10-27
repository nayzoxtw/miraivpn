import Link from "next/link";
import BackgroundFX from "@/components/ui/BackgroundFX";
import Card from "@/components/ui/Card";
import { WaterButton } from "@/components/ui/WaterButton";

export default function Home() {
  return (
    <>
      <BackgroundFX />
      <section className="mx-auto max-w-6xl px-6 py-28 text-center">
        <h1 className="text-[56px] leading-none font-extrabold text-white tracking-tight">未来VPN</h1>
        <p className="mt-3 text-xl text-neutral-300">Le VPN du futur</p>
        <p className="mt-2 text-neutral-400">VPN à la carte dès 2€/mois. Ultra-rapide, sécurisé et privé.</p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <WaterButton asChild>
            <Link href="/pricing">Commencer</Link>
          </WaterButton>
          <WaterButton variant="ghost" asChild>
            <Link href="/servers">Voir les serveurs</Link>
          </WaterButton>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="p-5 hover:scale-105 transition-transform duration-300 animate-water-drop" style={{ animationDelay: '0.2s' }}>
            <div className="text-white font-semibold">Ultra-rapide</div>
            <div className="text-neutral-400 text-sm mt-1">Débit jusqu'à 50 Mbps</div>
          </Card>
          <Card className="p-5 hover:scale-105 transition-transform duration-300 animate-water-drop" style={{ animationDelay: '0.4s' }}>
            <div className="text-white font-semibold">Sécurisé</div>
            <div className="text-neutral-400 text-sm mt-1">WireGuard + chiffrement</div>
          </Card>
          <Card className="p-5 hover:scale-105 transition-transform duration-300 animate-water-drop" style={{ animationDelay: '0.6s' }}>
            <div className="text-white font-semibold">Global</div>
            <div className="text-neutral-400 text-sm mt-1">Serveurs mondiaux</div>
          </Card>
        </div>

        <div className="mt-8 space-y-2 animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <p className="text-lg font-semibold text-white">2€ sans engagement !!</p>
          <p className="text-neutral-300">VPN à la carte</p>
        </div>
      </section>
    </>
  );
}
