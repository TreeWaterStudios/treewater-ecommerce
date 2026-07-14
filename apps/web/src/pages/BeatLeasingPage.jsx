import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const BEATSTARS_PLAYER_URL =
  'https://player.beatstars.com/?storeId=152401&v=20260714';

const BeatLeasingPage = () => {
  return (
    <>
      <Helmet>
        <title>Beat Leasing - TREEWATER STUDIOS</title>
        <meta
          name="description"
          content="Preview, lease, and purchase TreeWater Studios beats through the official BeatStars player."
        />
      </Helmet>

      <div className="min-h-screen relative flex flex-col">
        {/* Full-page fixed background */}
        <div
          className="fixed inset-0 bg-treewater-parallax z-0"
          style={{
            backgroundImage:
              'url(https://horizons-cdn.hostinger.com/e695e0dc-f8a7-43fd-a469-aa5a530eb903/0e7eb4525461f9ea0b68e9f579890b19.png)',
          }}
        >
          <div className="absolute inset-0 bg-black/55"></div>
        </div>

        {/* Content Layer */}
        <div className="relative z-10 flex flex-col flex-grow">
          <Header />

          <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 neon-text text-white">
                Beat Leasing
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto drop-shadow-md">
                Preview tagged beats, compare lease options, and complete secure checkout through the official TreeWater Studios BeatStars player.
              </p>
            </div>

            <section className="bg-card/70 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-primary/20 neon-border shadow-[0_0_30px_rgba(0,255,255,0.12)]">
              <div className="mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">TreeWater Beats</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Beat previews, lease options, checkout, and download delivery are handled securely by BeatStars.
                  </p>
                </div>

                <a
                  href={BEATSTARS_PLAYER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-[0_0_15px_rgba(0,255,255,0.6)]"
                >
                  Open BeatStars Player
                </a>
              </div>

              <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-black/70">
                <iframe
                  title="TreeWater Studios BeatStars Blaze Player"
                  src={BEATSTARS_PLAYER_URL}
                  width="100%"
                  height="800"
                  className="block w-full h-[720px] sm:h-[760px] lg:h-[800px]"
                  allow="autoplay; encrypted-media"
                  loading="eager"
                />
              </div>
            </section>
          </main>

          <Footer />
        </div>
      </div>
    </>
  );
};

export default BeatLeasingPage;