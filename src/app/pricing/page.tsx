import Card from "@/components/ui/Card";
import { CardColumn } from "@/components/ui/CardColumn";
import { WaterButton } from "@/components/ui/WaterButton";

const plans = [
  {
    id: 'basic',
    title: 'Basic',
    price: '2€',
    badge: 'Parfait pour débuter',
    features: [
      '200 GB de données',
      'Débit jusqu\'à 20 Mbps',
      '1 connexion simultanée',
      'WireGuard protocol',
      'Support Discord'
    ]
  },
  {
    id: 'premium',
    title: 'Premium',
    price: '4€',
    badge: 'Le plus populaire',
    features: [
      '500 GB de données',
      'Débit jusqu\'à 33 Mbps',
      '3 connexions simultanées',
      'WireGuard protocol',
      'Support prioritaire',
      'Serveurs premium'
    ]
  },
  {
    id: 'vip',
    title: 'VIP',
    price: '6€',
    badge: 'Maximum performance',
    features: [
      '1 TB de données',
      'Débit jusqu\'à 50 Mbps',
      '5 connexions simultanées',
      'WireGuard protocol',
      'Support 24/7',
      'Serveurs dédiés',
      'Configuration personnalisée'
    ]
  }
];

export default function Pricing() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <h1 className="text-4xl font-bold text-white text-center mb-4">Choisissez votre plan</h1>
      <p className="text-center text-neutral-400 mb-12">Des tarifs transparents, sans engagement, et sans frais cachés.</p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
        {plans.map((p) => (
          <Card key={p.id} className="p-6">
            <CardColumn
              children={
                <>
                  <div className="mb-4 text-neutral-300">{p.badge}</div>
                  <h3 className="text-2xl font-semibold text-white">{p.title}</h3>
                  <div className="mt-2 text-4xl font-bold text-white">
                    {p.price} <span className="text-base font-medium text-neutral-400">/ mois</span>
                  </div>
                  <ul className="mt-6 space-y-3 text-neutral-300">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </>
              }
              footer={
                <WaterButton variant="primary" full>Choisir {p.title}</WaterButton>
              }
            />
          </Card>
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-neutral-500">
        Besoin d'aide ? <a className="underline hover:text-neutral-300" href="https://discord.gg/xYas5XFmMD" target="_blank" rel="noreferrer">Support via Discord</a>
      </p>
    </div>
  );
}
