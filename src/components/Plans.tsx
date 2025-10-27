import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Users, Globe } from 'lucide-react';
import { plans } from '@/lib/plans';

export function Plans() {
  const handleSelectPlan = async (planId: string) => {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: planId }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        console.error('Erreur lors de la création de la session de paiement');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getPlanFeatures = (planId: string) => {
    const features = {
      basic: [
        'Jusqu\'à 200 GB/mois',
        'Vitesse jusqu\'à 20 Mbps',
        '1 connexion simultanée',
        'WireGuard protocol',
        'Support email',
      ],
      premium: [
        'Jusqu\'à 300 GB/mois',
        'Vitesse jusqu\'à 33 Mbps',
        '3 connexions simultanées',
        'WireGuard protocol',
        'Support prioritaire',
        'Accès à tous les serveurs',
      ],
      vip: [
        'Jusqu\'à 300 GB/mois',
        'Vitesse jusqu\'à 50 Mbps',
        '5 connexions simultanées',
        'WireGuard protocol',
        'Support 24/7',
        'Accès à tous les serveurs',
        'Configuration personnalisée',
      ],
    };
    return features[planId as keyof typeof features] || [];
  };

  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {Object.entries(plans).map(([planId, plan]) => (
        <Card
          key={planId}
          className={`relative bg-neutral-900/50 border-neutral-800 hover:bg-neutral-800/50 transition-colors ${
            planId === 'premium' ? 'ring-2 ring-neutral-600' : ''
          }`}
        >
          {planId === 'premium' && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-neutral-600 text-neutral-100 px-3 py-1">
                Recommandé
              </Badge>
            </div>
          )}

          <CardHeader className="text-center pb-8">
            <CardTitle className="text-2xl text-neutral-100 mb-2">
              {planId.charAt(0).toUpperCase() + planId.slice(1)}
            </CardTitle>
            <div className="text-4xl font-bold text-neutral-100 mb-2">
              {plan.priceMonthly}€
              <span className="text-lg font-normal text-neutral-400">/mois</span>
            </div>
            <CardDescription className="text-neutral-400">
              Facturation mensuelle, annulation à tout moment
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Zap className="w-4 h-4 text-neutral-400" />
                <span className="text-neutral-300">
                  Vitesse jusqu'à {plan.speedMbps} Mbps
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Globe className="w-4 h-4 text-neutral-400" />
                <span className="text-neutral-300">
                  {plan.quotaGB} GB de données
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Users className="w-4 h-4 text-neutral-400" />
                <span className="text-neutral-300">
                  {planId === 'basic' ? '1' : planId === 'premium' ? '3' : '5'} connexion{planId === 'basic' ? '' : 's'} simultanée{planId === 'basic' ? '' : 's'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-neutral-200">Fonctionnalités incluses :</h4>
              <ul className="space-y-2">
                {getPlanFeatures(planId).map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-neutral-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              onClick={() => handleSelectPlan(planId)}
              className="w-full bg-neutral-700 hover:bg-neutral-600 text-neutral-100 border border-neutral-600"
              size="lg"
            >
              Commencer maintenant
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
