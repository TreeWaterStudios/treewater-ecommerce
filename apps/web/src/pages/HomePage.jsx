import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Play, Zap, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { motion } from 'framer-motion';

const HomePage = () => {

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
          <div className="absolute inset-0" style={{ backgroundColor: '#020607' }}>
            {/* Existing still image remains behind the video as the loading,
                playback-error, and reduced-motion fallback. */}
            <div
              className="absolute inset-0 bg-contain bg-center bg-no-repeat md:bg-contain md:bg-center md:bg-fixed"
              style={{
                backgroundImage: 'url(https://horizons-cdn.hostinger.com/e695e0dc-f8a7-43fd-a469-aa5a530eb903/40253a724b9b6ff595bd07dd6d28aa8a.jpg)',
                backgroundColor: '#020607',
              }}
            ></div>

            <video
              className="pointer-events-none absolute inset-x-0 top-[18%] h-[58%] w-full object-cover object-center motion-reduce:hidden md:inset-0 md:h-full md:w-full md:object-cover md:object-center"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="https://horizons-cdn.hostinger.com/e695e0dc-f8a7-43fd-a469-aa5a530eb903/40253a724b9b6ff595bd07dd6d28aa8a.jpg"
              aria-hidden="true"
            >
              <source
                src="https://res.cloudinary.com/dbkhaifkf/video/upload/f_mp4/treewater-home-loop-web_hcg1jz.mp4"
                type="video/mp4"
              />
            </video>

            {/* Dark semi-transparent overlay for text readability */}
            <div className="absolute inset-0 bg-black/50"></div>

            {/* Gradient to blend smoothly into the next section */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center -translate-y-28 md:translate-y-0">
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
              className="flex flex-col sm:flex-row gap-4 justify-center mt-56 md:mt-0"
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
            </motion.div>
          </div>
        </section>

        <section className="relative -mt-56 pt-56 pb-20 md:mt-0 md:py-20 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-[position:center_70%] bg-no-repeat md:bg-center md:bg-fixed"
            style={{
              backgroundImage: 'url(https://horizons-cdn.hostinger.com/e695e0dc-f8a7-43fd-a469-aa5a530eb903/2c5c78f3c7e5d9f03c4bd5b0afb617f8.jpg)',
            }}
          >
            <div className="absolute inset-0 bg-black/15 md:bg-black/60"></div>
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent"></div>
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white drop-shadow-md">
                Featured Beats
              </h2>

              <Card className="bg-card/45 md:bg-card/90 backdrop-blur-md border-primary/30 neon-border p-8 md:p-10 max-w-3xl mx-auto">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/40 mx-auto mb-6">
                  <Play className="w-10 h-10 text-primary" />
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Stream the official BeatStars player
                </h3>

                <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
                  Browse current TREEWATER beats, preview tagged tracks, compare lease options, and purchase securely through BeatStars.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/beat-leasing">
                    <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                      View Beat Leasing
                    </Button>
                  </Link>

                  <Link to="/contact">
                    <Button size="lg" variant="outline" className="border-primary/50 hover:border-primary bg-background/40 backdrop-blur-sm text-white">
                      Contact for Exclusive Rights
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
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