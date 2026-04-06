import React from 'react';
import { Helmet } from 'react-helmet';
import { Music, Droplet, TreePine } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>About - TREEWATER STUDIOS</title>
        <meta name="description" content="Learn about TREEWATER STUDIOS and our mission" />
      </Helmet>

      <div className="min-h-screen relative flex flex-col">
        {/* Full-page fixed background */}
        <div
          className="fixed inset-0 bg-treewater-parallax z-0"
          style={{
            backgroundImage: 'url(https://horizons-cdn.hostinger.com/e695e0dc-f8a7-43fd-a469-aa5a530eb903/aa180b400f27cb818b5b6d96ea23f644.png)',
          }}
        >
          <div className="absolute inset-0 bg-black/75"></div>
        </div>

        {/* Content Layer */}
        <div className="relative z-10 flex flex-col flex-grow">
          <Header />

          <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center neon-text">About TREEWATER STUDIOS</h1>
            <p className="text-xl text-gray-200 text-center mb-16 max-w-2xl mx-auto drop-shadow-md">
              Where creativity flows like water through the roots of innovation
            </p>

            <div className="prose prose-invert max-w-none">
              <section className="mb-16 bg-background/40 backdrop-blur-md p-8 rounded-2xl border border-primary/20 neon-border">
                <h2 className="text-3xl font-bold mb-4 text-white">Our Story</h2>
                <p className="text-gray-300 leading-relaxed mb-4 text-lg">
                  Founded in 2024, TREEWATER STUDIOS emerged from a simple vision: to create a space where music
                  production meets artistic freedom. Like water nourishing the roots of a tree, we believe in
                  nurturing creativity at its source.
                </p>
                <p className="text-gray-300 leading-relaxed text-lg">
                  Our name represents the natural flow of creativity - water sustaining life, trees growing strong,
                  and music branching out to touch hearts worldwide. We're more than a beat store; we're a community
                  of artists, producers, and dreamers.
                </p>
              </section>

              <section className="mb-16">
                <h2 className="text-3xl font-bold mb-8 text-center text-white drop-shadow-md">Our Mission</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-card/60 backdrop-blur-md rounded-xl p-6 border border-primary/20 hover:border-primary/50 transition-colors duration-300">
                    <Music className="w-12 h-12 text-primary mb-4 drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]" />
                    <h3 className="text-xl font-semibold mb-2 text-white">Quality First</h3>
                    <p className="text-sm text-gray-300">
                      Every beat is crafted with precision and passion by experienced producers
                    </p>
                  </div>
                  <div className="bg-card/60 backdrop-blur-md rounded-xl p-6 border border-secondary/20 hover:border-secondary/50 transition-colors duration-300">
                    <Droplet className="w-12 h-12 text-secondary mb-4 drop-shadow-[0_0_8px_rgba(200,100,255,0.5)]" />
                    <h3 className="text-xl font-semibold mb-2 text-white">Creative Flow</h3>
                    <p className="text-sm text-gray-300">
                      We facilitate the natural flow of creativity from producer to artist
                    </p>
                  </div>
                  <div className="bg-card/60 backdrop-blur-md rounded-xl p-6 border border-accent/20 hover:border-accent/50 transition-colors duration-300">
                    <TreePine className="w-12 h-12 text-accent mb-4 drop-shadow-[0_0_8px_rgba(0,255,100,0.5)]" />
                    <h3 className="text-xl font-semibold mb-2 text-white">Growth Together</h3>
                    <p className="text-sm text-gray-300">
                      Building a community where artists and producers grow side by side
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-16">
                <h2 className="text-3xl font-bold mb-8 text-center text-white drop-shadow-md">What We Offer</h2>
                <div className="space-y-6">
                  <div className="bg-card/60 backdrop-blur-md border border-primary/20 rounded-xl p-6 hover:shadow-[0_0_15px_rgba(0,255,255,0.1)] transition-all duration-300">
                    <h3 className="text-xl font-semibold mb-2 text-primary">Premium Beat Leasing</h3>
                    <p className="text-gray-300">
                      Flexible licensing options from starter to exclusive rights, all with instant delivery and
                      legal protection
                    </p>
                  </div>
                  <div className="bg-card/60 backdrop-blur-md border border-secondary/20 rounded-xl p-6 hover:shadow-[0_0_15px_rgba(200,100,255,0.1)] transition-all duration-300">
                    <h3 className="text-xl font-semibold mb-2 text-secondary">Exclusive Merchandise</h3>
                    <p className="text-gray-300">
                      Represent the TREEWATER brand with our carefully designed apparel and accessories
                    </p>
                  </div>
                  <div className="bg-card/60 backdrop-blur-md border border-accent/20 rounded-xl p-6 hover:shadow-[0_0_15px_rgba(0,255,100,0.1)] transition-all duration-300">
                    <h3 className="text-xl font-semibold mb-2 text-accent">Play Store</h3>
                    <p className="text-gray-300">
                      Browse our extensive catalog of beats across multiple genres, all available for instant purchase
                    </p>
                  </div>
                </div>
              </section>

              <section className="bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-lg rounded-2xl p-10 text-center border border-white/10 shadow-2xl">
                <h2 className="text-3xl font-bold mb-4 text-white neon-text-subtle">Join Our Community</h2>
                <p className="text-gray-200 mb-0 max-w-2xl mx-auto text-lg">
                  Whether you're an established artist or just starting your journey, TREEWATER STUDIOS is here to
                  support your creative vision. Let's make music that matters.
                </p>
              </section>
            </div>
          </main>

          <Footer />
        </div>
      </div>
    </>
  );
};

export default AboutPage;