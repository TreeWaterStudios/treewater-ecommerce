import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube, Music, X } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span className="text-2xl font-bold neon-text">TREEWATER</span>
            <p className="text-sm text-muted-foreground mt-2">
              Premium beats and merchandise for artists worldwide
            </p>
          </div>

          <div>
            <span className="text-sm font-semibold text-foreground mb-4 block">Quick Links</span>
            <div className="space-y-2">
              <Link to="/beat-leasing" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Beat Leasing
              </Link>
              <Link to="/merchandise" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Merchandise
              </Link>
              <Link to="/play-store" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Play Store
              </Link>
              <Link to="/contact" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>

          <div>
            <span className="text-sm font-semibold text-foreground mb-4 block">Connect</span>
            <div className="flex space-x-4">
              <a 
                href="https://www.tiktok.com/@treewaterstudios?_r=1&_t=ZP-94knl4mUXWA" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-primary transition-colors hover:drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]"
                aria-label="TikTok"
              >
                <Music className="w-5 h-5" />
              </a>
              <a 
                href="https://x.com/treewaterstudio?s=21&t=-kUKB0lv_FHY3bIB5HpCSw" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-primary transition-colors hover:drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]"
                aria-label="X (formerly Twitter)"
              >
                <X className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/tweewaterstudios?igsh=ODM1cjVwYTN1eTZu&utm_source=qr" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-primary transition-colors hover:drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://youtube.com/@treewater_studios?si=phl_JeuXsn9fVgJi" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-primary transition-colors hover:drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} TREEWATER STUDIOS. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;