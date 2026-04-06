import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Play, Pause, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const PlayStorePage = () => {
  const [beats, setBeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genreFilter, setGenreFilter] = useState('all');
  const [playingId, setPlayingId] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBeats = async () => {
      try {
        const filter = genreFilter === 'all' ? '' : `genre = "${genreFilter}"`;
        const records = await pb.collection('beats').getFullList({
          filter,
          sort: '-created',
          $autoCancel: false,
        });
        setBeats(records);
      } catch (error) {
        console.error('Failed to fetch beats:', error);
        toast.error('Failed to load beats');
      } finally {
        setLoading(false);
      }
    };

    fetchBeats();
  }, [genreFilter]);

  const handlePurchase = async (beat) => {
    if (!isAuthenticated) {
      toast.error('Please login to purchase beats');
      navigate('/login');
      return;
    }

    try {
      await pb.collection('beat_purchases').create({
        userId: pb.authStore.model.id,
        beatId: beat.id,
        downloadCount: 0,
      }, { $autoCancel: false });

      toast.success('Beat purchased successfully');

      if (beat.beatFile) {
        const url = pb.files.getUrl(beat, beat.beatFile);
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      toast.error('Purchase failed. Please try again.');
    }
  };

  return (
    <>
      <Helmet>
        <title>Play Store - TREEWATER STUDIOS</title>
        <meta name="description" content="Browse and purchase premium beats" />
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

          <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-6 bg-card/40 backdrop-blur-md p-6 rounded-2xl border border-primary/20">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white neon-text-subtle">Play Store</h1>
                <p className="text-gray-300">Browse our collection of premium beats</p>
              </div>

              <Select value={genreFilter} onValueChange={setGenreFilter}>
                <SelectTrigger className="w-[200px] bg-background/60 border-primary/30 text-white focus:ring-primary">
                  <SelectValue placeholder="Filter by genre" />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-xl border-primary/30">
                  <SelectItem value="all">All Genres</SelectItem>
                  <SelectItem value="Hip-Hop">Hip-Hop</SelectItem>
                  <SelectItem value="Trap">Trap</SelectItem>
                  <SelectItem value="R&B">R&B</SelectItem>
                  <SelectItem value="Electronic">Electronic</SelectItem>
                  <SelectItem value="Pop">Pop</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="bg-card/60 backdrop-blur-md border-white/10">
                    <CardContent className="p-6">
                      <Skeleton className="h-40 w-full mb-4 bg-white/10" />
                      <Skeleton className="h-6 w-3/4 mb-2 bg-white/10" />
                      <Skeleton className="h-4 w-1/2 bg-white/10" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : beats.length === 0 ? (
              <div className="text-center py-32 bg-card/40 backdrop-blur-md rounded-2xl border border-white/10">
                <Play className="w-16 h-16 text-primary/50 mx-auto mb-4 drop-shadow-[0_0_8px_rgba(0,255,255,0.3)]" />
                <p className="text-xl text-gray-300">No beats found for this genre</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {beats.map((beat) => (
                  <BeatCard
                    key={beat.id}
                    beat={beat}
                    isPlaying={playingId === beat.id}
                    onPlayToggle={() => setPlayingId(playingId === beat.id ? null : beat.id)}
                    onPurchase={handlePurchase}
                  />
                ))}
              </div>
            )}
          </main>

          <Footer />
        </div>
      </div>
    </>
  );
};

const BeatCard = ({ beat, isPlaying, onPlayToggle, onPurchase }) => {
  const [audio] = useState(new Audio());

  useEffect(() => {
    if (beat.previewFile) {
      audio.src = pb.files.getUrl(beat, beat.previewFile);
    }

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [beat, audio]);

  useEffect(() => {
    if (isPlaying) {
      audio.play();
    } else {
      audio.pause();
    }
  }, [isPlaying, audio]);

  return (
    <Card className="bg-card/70 backdrop-blur-md border-primary/20 hover:border-primary/60 hover:shadow-[0_0_20px_rgba(0,255,255,0.15)] transition-all duration-300 flex flex-col h-full">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-center h-48 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl mb-6 relative border border-white/5 group overflow-hidden">
          {/* Decorative background glow */}
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <button
            onClick={onPlayToggle}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
              isPlaying 
                ? 'bg-secondary text-white shadow-[0_0_20px_rgba(200,100,255,0.6)] scale-110' 
                : 'bg-primary text-primary-foreground hover:scale-110 hover:shadow-[0_0_20px_rgba(0,255,255,0.6)]'
            }`}
          >
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </button>
          
          {/* Audio visualizer placeholder when playing */}
          {isPlaying && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1 px-4 h-8 items-end opacity-50">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-2 bg-secondary rounded-t-sm animate-pulse" 
                  style={{ 
                    height: `${Math.random() * 100}%`,
                    animationDuration: `${0.5 + Math.random() * 0.5}s`
                  }}
                ></div>
              ))}
            </div>
          )}
        </div>

        <h3 className="text-xl font-bold mb-1 text-white truncate">{beat.name}</h3>
        <p className="text-sm text-gray-400 mb-4 truncate">{beat.artist}</p>
        
        <div className="flex items-center justify-between mb-4 bg-background/40 p-3 rounded-lg border border-white/5">
          <span className="text-xs font-medium px-2 py-1 rounded-md bg-accent/20 text-accent border border-accent/30">
            {beat.genre}
          </span>
          <span className="text-xl font-bold text-primary drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]">
            ${beat.price}
          </span>
        </div>

        {beat.description && (
          <p className="text-sm text-gray-400 mb-6 line-clamp-2 flex-grow">{beat.description}</p>
        )}

        <Button
          onClick={() => onPurchase(beat)}
          className="w-full mt-auto bg-primary/90 text-primary-foreground hover:bg-primary hover:shadow-[0_0_15px_rgba(0,255,255,0.5)] transition-all duration-300"
        >
          <Download className="w-4 h-4 mr-2" />
          Purchase & Download
        </Button>
      </CardContent>
    </Card>
  );
};

export default PlayStorePage;