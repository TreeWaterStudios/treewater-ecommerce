import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Send, Instagram, Music, Youtube, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

const ContactPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !message) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await pb.collection('contact_submissions').create({
        name,
        email,
        message,
      }, { $autoCancel: false });

      toast.success('Message sent successfully');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact - TREEWATER STUDIOS</title>
        <meta name="description" content="Get in touch with TREEWATER STUDIOS" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 neon-text">Contact Us</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have a question or want to collaborate? We'd love to hear from you.
            </p>
          </div>

          <Card className="neon-border bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
              <CardDescription>We'll get back to you as soon as possible</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background/50 text-foreground border-primary/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background/50 text-foreground border-primary/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us what's on your mind..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    className="bg-background/50 text-foreground resize-none border-primary/20 focus:border-primary"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_15px_rgba(0,255,255,0.5)] transition-all duration-300"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-muted/50 backdrop-blur-sm rounded-lg p-6 border border-white/5">
              <h3 className="font-semibold mb-2 text-white">Email</h3>
              <p className="text-sm text-muted-foreground">admin@treewater.com</p>
            </div>
            <div className="bg-muted/50 backdrop-blur-sm rounded-lg p-6 border border-white/5">
              <h3 className="font-semibold mb-2 text-white">Support</h3>
              <p className="text-sm text-muted-foreground">24/7 customer support</p>
            </div>
            <div className="bg-muted/50 backdrop-blur-sm rounded-lg p-6 border border-white/5">
              <h3 className="font-semibold mb-2 text-white">Response Time</h3>
              <p className="text-sm text-muted-foreground">Within 24 hours</p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-8 text-white">Follow Our Journey</h2>
            <div className="flex justify-center space-x-6">
              <a 
                href="https://www.tiktok.com/@treewaterstudios?_r=1&_t=ZP-94knl4mUXWA" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-card/80 p-4 rounded-full border border-primary/20 text-muted-foreground hover:text-primary hover:border-primary hover:shadow-[0_0_15px_rgba(0,255,255,0.5)] transition-all duration-300"
                aria-label="TikTok"
              >
                <Music className="w-6 h-6" />
              </a>
              <a 
                href="https://x.com/treewaterstudio?s=21&t=-kUKB0lv_FHY3bIB5HpCSw" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-card/80 p-4 rounded-full border border-primary/20 text-muted-foreground hover:text-primary hover:border-primary hover:shadow-[0_0_15px_rgba(0,255,255,0.5)] transition-all duration-300"
                aria-label="X (formerly Twitter)"
              >
                <X className="w-6 h-6" />
              </a>
              <a 
                href="https://www.instagram.com/tweewaterstudios?igsh=ODM1cjVwYTN1eTZu&utm_source=qr" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-card/80 p-4 rounded-full border border-primary/20 text-muted-foreground hover:text-primary hover:border-primary hover:shadow-[0_0_15px_rgba(0,255,255,0.5)] transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a 
                href="https://youtube.com/@treewater_studios?si=phl_JeuXsn9fVgJi" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-card/80 p-4 rounded-full border border-primary/20 text-muted-foreground hover:text-primary hover:border-primary hover:shadow-[0_0_15px_rgba(0,255,255,0.5)] transition-all duration-300"
                aria-label="YouTube"
              >
                <Youtube className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default ContactPage;