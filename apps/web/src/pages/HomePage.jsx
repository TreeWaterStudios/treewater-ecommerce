import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Play, Zap, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import pb from '@/lib/pocketbaseClient';
import { motion } from 'framer-motion';

const HomePage = () => {
  const [featuredBeats, setFeaturedBeats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBeats = async () => {
      try {
        const records = await pb.collection('beats').getList(1, 3, {
          sort: '-created',
          $autoCancel: false,
        });
        setFeaturedBeats(records.items);
      } catch (error) {
        console.error('Failed to fetch beats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBeats();
  }, []);

  const features = [
    {
      icon: Zap,
      title: 'Premium Quality',
      description: 'Studio-grade beats crafted by professional producers with years of experience',
    },
    {
      icon: Shield,
      title: 'Secure Licensing',
      description: 'Clear, legally binding contracts that protect your rights and creative freedom',
    },
    {
      icon: Sparkles,
      title: 'Instant Delivery',
      description: 'Download your beats and contracts immediately after purchase, no waiting',
    },
  ];

  return (
    <>
      <Helmet>
        <title>TREEWATER STUDIOS - Premium Beats & Merchandise</title>
        <meta name="description" content="Discover premium beats, exclusive merchandise, and professional music production services at TREEWATER STUDIOS" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat md:bg-fixed"
            style={{
              backgroundImage: 'url(https://horizons-cdn.hostinger.com/e695e0dc-f8a7-43fd-a469-aa5a530eb903/40253a724b9b6ff595bd07dd6d28aa8a.jpg)',
            }}
          >
            {/* Dark semi-transparent overlay for text readability */}
            <div className="absolute inset-0 bg-black/60"></div>
            {/* Gradient to blend smoothly into the next section */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 neon-text-subtle"
              style={{ letterSpacing: '-0.02em' }}
            >
              TREEWATER STUDIOS
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto drop-shadow-md"
            >
              Where creativity flows like water through the roots of innovation
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/beat-leasing">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 animate-glowPulse">
                  Explore Beat Leasing
                </Button>
              </Link>
              <Link to="/merchandise">
                <Button size="lg" variant="outline" className="border-primary/50 hover:border-primary bg-background/20 backdrop-blur-sm text-white">
                  Shop Merchandise
                </Button>
              </Link>
              <Link to="/play-store">
                <Button size="lg" variant="outline" className="border-secondary/50 hover:border-secondary bg-background/20 backdrop-blur-sm text-white">
                  Browse Play Store
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        <section className="relative py-20 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat md:bg-fixed"
            style={{
              backgroundImage: 'url(https://horizons-cdn.hostinger.com/e695e0dc-f8a7-43fd-a469-aa5a530eb903/2c5c78f3c7e5d9f03c4bd5b0afb617f8.jpg)',
            }}
          >
            <div className="absolute inset-0 bg-black/60"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white drop-shadow-md">Featured Beats</h2>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="bg-muted/80 backdrop-blur-sm animate-pulse border-none">
                    <CardContent className="p-6">
                      <div className="h-40 bg-background/50 rounded mb-4"></div>
                      <div className="h-6 bg-background/50 rounded mb-2"></div>
                      <div className="h-4 bg-background/50 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredBeats.map((beat, index) => (
                  <motion.div
                    key={beat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="bg-card/90 backdrop-blur-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 neon-border">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-center h-40 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg mb-4">
                          <Play className="w-16 h-16 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-white">{beat.name}</h3>
                        <p className="text-sm text-gray-300 mb-2">{beat.artist}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-accent">{beat.genre}</span>
                          <span className="text-lg font-bold text-primary">${beat.price}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="text-center mt-12">
              <Link to="/play-store">
                <Button variant="outline" size="lg" className="border-primary/50 hover:border-primary bg-background/40 backdrop-blur-sm text-white">
                  View All Beats
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="relative py-24 overflow-hidden">
          <div
            className="absolute inset-0 bg-treewater-parallax"
            style={{
              backgroundImage: 'url(https://horizons-cdn.hostinger.com/e695e0dc-f8a7-43fd-a469-aa5a530eb903/aa180b400f27cb818b5b6d96ea23f644.png)',
            }}
          >
            <div className="absolute inset-0 overlay-treewater"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white drop-shadow-md">Why TREEWATER</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={index % 2 === 0 ? 'md:order-1' : 'md:order-2'}
                >
                  <Card className="bg-card/80 backdrop-blur-md border-primary/20 p-8 hover:border-primary/50 transition-colors duration-300 neon-border">
                    <feature.icon className="w-12 h-12 text-primary mb-6 drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]" />
                    <h3 className="text-2xl font-semibold mb-4 text-white">{feature.title}</h3>
                    <p className="text-gray-300 leading-relaxed text-lg">{feature.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to elevate your sound?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of artists who trust TREEWATER STUDIOS for their music production needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Get Started Today
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-primary/50 hover:border-primary">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default HomePage;