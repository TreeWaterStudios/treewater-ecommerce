import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import PurchaseModal from '@/components/PurchaseModal.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const BeatLeasingPage = () => {
  const [selectedTier, setSelectedTier] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const tiers = [
    {
      name: 'Starter',
      price: 49.99,
      description: 'Perfect for getting started',
      features: [
        'Basic lease agreement',
        '1 beat download',
        'MP3 format (320kbps)',
        'Non-exclusive rights',
        'Up to 5,000 streams',
        'Email support',
      ],
    },
    {
      name: 'Standard',
      price: 149.99,
      description: 'Most popular for serious artists',
      features: [
        'Extended lease agreement',
        '3 beat downloads',
        'WAV + MP3 formats',
        'Commercial use allowed',
        'Up to 50,000 streams',
        'Unlimited music videos',
        'Priority email support',
      ],
      popular: true,
    },
    {
      name: 'Premium',
      price: 499.99,
      description: 'Unlimited creative freedom',
      features: [
        'Unlimited lease agreement',
        'All beats access',
        'WAV + trackout stems',
        'Exclusive rights option',
        'Unlimited streams',
        'Radio broadcasting rights',
        'Priority support + consultation',
      ],
    },
  ];

  const handlePurchase = (tier) => {
    if (!isAuthenticated) {
      toast.error('Please login to purchase a lease');
      navigate('/login');
      return;
    }

    setSelectedTier(tier);
    setModalOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Beat Leasing - TREEWATER STUDIOS</title>
        <meta name="description" content="Choose the perfect beat lease tier for your music career" />
      </Helmet>

      <div className="min-h-screen relative flex flex-col">
        {/* Full-page fixed background */}
        <div
          className="fixed inset-0 bg-treewater-parallax z-0"
          style={{
            backgroundImage: 'url(https://horizons-cdn.hostinger.com/e695e0dc-f8a7-43fd-a469-aa5a530eb903/0e7eb4525461f9ea0b68e9f579890b19.png)',
          }}
        >
          <div className="absolute inset-0 bg-black/75"></div>
        </div>

        {/* Content Layer */}
        <div className="relative z-10 flex flex-col flex-grow">
          <Header />

          <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 neon-text text-white">Beat Leasing</h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto drop-shadow-md">
                Choose the perfect license for your next hit. All tiers include instant delivery and legal protection.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              {tiers.map((tier) => (
                <Card
                  key={tier.name}
                  className={`relative backdrop-blur-md border-primary/20 transition-all duration-300 ${
                    tier.popular
                      ? 'scale-105 neon-border shadow-[0_0_30px_rgba(0,255,255,0.15)] ring-2 ring-primary bg-card/90'
                      : 'bg-card/70 hover:shadow-[0_0_20px_rgba(0,255,255,0.1)] hover:border-primary/50 hover:-translate-y-1'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
                      <span className="bg-primary text-primary-foreground px-5 py-1.5 rounded-full text-sm font-bold tracking-wider shadow-[0_0_15px_rgba(0,255,255,0.6)] whitespace-nowrap border border-primary/50 uppercase">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center pb-8 pt-8">
                    <CardTitle className="text-2xl mb-2 text-white">{tier.name}</CardTitle>
                    <CardDescription className="text-gray-400">{tier.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-primary drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]">${tier.price}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col h-[calc(100%-160px)]">
                    <ul className="space-y-4 mb-8 flex-grow">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-accent mr-3 mt-0.5 flex-shrink-0 drop-shadow-[0_0_5px_rgba(0,255,100,0.5)]" />
                          <span className="text-sm text-gray-200">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => handlePurchase(tier)}
                      className={`w-full mt-auto transition-all duration-300 ${
                        tier.popular
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_15px_rgba(0,255,255,0.6)]'
                          : 'bg-muted/80 text-white hover:bg-primary/20 hover:text-primary border border-transparent hover:border-primary/50'
                      }`}
                    >
                      Purchase {tier.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-20 bg-card/60 backdrop-blur-lg rounded-2xl p-8 border border-primary/20 neon-border">
              <h2 className="text-2xl font-bold mb-8 text-white text-center">What's included in every lease</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-start bg-background/40 p-4 rounded-xl border border-white/5">
                  <CheckCircle className="w-6 h-6 text-accent mr-4 mt-1 drop-shadow-[0_0_5px_rgba(0,255,100,0.5)]" />
                  <div>
                    <p className="font-semibold text-white text-lg">Instant Download</p>
                    <p className="text-sm text-gray-400 mt-1">Get your files immediately after purchase</p>
                  </div>
                </div>
                <div className="flex items-start bg-background/40 p-4 rounded-xl border border-white/5">
                  <CheckCircle className="w-6 h-6 text-accent mr-4 mt-1 drop-shadow-[0_0_5px_rgba(0,255,100,0.5)]" />
                  <div>
                    <p className="font-semibold text-white text-lg">Legal Contract</p>
                    <p className="text-sm text-gray-400 mt-1">Professionally drafted license agreement</p>
                  </div>
                </div>
                <div className="flex items-start bg-background/40 p-4 rounded-xl border border-white/5">
                  <CheckCircle className="w-6 h-6 text-accent mr-4 mt-1 drop-shadow-[0_0_5px_rgba(0,255,100,0.5)]" />
                  <div>
                    <p className="font-semibold text-white text-lg">Untagged Files</p>
                    <p className="text-sm text-gray-400 mt-1">Clean audio without watermarks</p>
                  </div>
                </div>
                <div className="flex items-start bg-background/40 p-4 rounded-xl border border-white/5">
                  <CheckCircle className="w-6 h-6 text-accent mr-4 mt-1 drop-shadow-[0_0_5px_rgba(0,255,100,0.5)]" />
                  <div>
                    <p className="font-semibold text-white text-lg">Lifetime Access</p>
                    <p className="text-sm text-gray-400 mt-1">Re-download anytime from your dashboard</p>
                  </div>
                </div>
              </div>
            </div>
          </main>

          <Footer />
        </div>
      </div>

      {selectedTier && (
        <PurchaseModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          tier={selectedTier.name}
          price={selectedTier.price}
        />
      )}
    </>
  );
};

export default BeatLeasingPage;