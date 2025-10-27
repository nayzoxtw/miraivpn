import { Card } from '@/components/ui/Card';

const faqs = [
  {
    question: "Qu'est-ce que MiraiVPN ?",
    answer: "MiraiVPN est un service VPN premium qui vous permet de naviguer en toute sécurité et confidentialité sur internet. Nous utilisons la technologie WireGuard pour des connexions ultra-rapides et sécurisées."
  },
  {
    question: "Comment fonctionne le paiement ?",
    answer: "Nous acceptons les paiements via Stripe, une plateforme de paiement sécurisée. Vous pouvez payer mensuellement ou annuellement. Toutes les transactions sont chiffrées et sécurisées."
  },
  {
    question: "Puis-je annuler mon abonnement à tout moment ?",
    answer: "Oui, vous pouvez annuler votre abonnement à tout moment depuis votre compte client. L'annulation prendra effet à la fin de votre période de facturation en cours."
  },
  {
    question: "Quels sont les protocoles utilisés ?",
    answer: "Nous utilisons exclusivement WireGuard, le protocole VPN le plus moderne et performant. Il offre des vitesses exceptionnelles et une sécurité de niveau militaire."
  },
  {
    question: "Gardez-vous des logs de mes activités ?",
    answer: "Non, nous avons une politique de no-logs stricte. Nous ne conservons aucune donnée sur vos activités en ligne, vos connexions ou votre trafic."
  },
  {
    question: "Combien de serveurs proposez-vous ?",
    answer: "Notre réseau compte plus de 50 serveurs répartis dans plus de 20 pays. Tous nos serveurs sont dédiés et optimisés pour les performances."
  },
  {
    question: "Puis-je utiliser MiraiVPN sur plusieurs appareils ?",
    answer: "Oui, selon votre plan : Basic (1 appareil), Premium (5 appareils), VIP (appareils illimités). Vous pouvez connecter tous vos appareils simultanément."
  },
  {
    question: "Quelle est la vitesse de connexion ?",
    answer: "Nos serveurs offrent des débits allant jusqu'à 1 Gbps. La vitesse réelle dépend de votre connexion internet et de la distance au serveur choisi."
  },
  {
    question: "Proposez-vous un essai gratuit ?",
    answer: "Nous proposons une garantie satisfait ou remboursé de 30 jours. Si vous n'êtes pas satisfait, nous vous remboursons intégralement."
  },
  {
    question: "Comment contacter le support ?",
    answer: "Notre équipe de support est disponible 24/7 via email à support@miraivpn.com. Nous répondons généralement sous 24 heures."
  }
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#0B0F12] text-neutral-200">
      <div className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Questions fréquentes
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Trouvez rapidement les réponses à vos questions sur MiraiVPN.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <Card key={index} className="p-6 bg-neutral-900/50 border-neutral-800">
              <h3 className="text-lg font-semibold mb-3 text-neutral-100">
                {faq.question}
              </h3>
              <p className="text-neutral-400 leading-relaxed">
                {faq.answer}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
