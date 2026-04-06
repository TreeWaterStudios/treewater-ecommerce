import React, { useState } from 'react';
import { X, Download, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

const PurchaseModal = ({ isOpen, onClose, tier, price }) => {
  const [loading, setLoading] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [leaseRecord, setLeaseRecord] = useState(null);

  const tierFeatures = {
    Starter: ['Basic lease agreement', '1 beat download', 'MP3 format', 'Non-exclusive rights'],
    Standard: ['Extended lease agreement', '3 beat downloads', 'WAV + MP3 formats', 'Commercial use allowed'],
    Premium: ['Unlimited lease agreement', 'All beats access', 'WAV + stems', 'Exclusive rights', 'Priority support'],
  };

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const record = await pb.collection('beat_leases').create({
        userId: pb.authStore.model.id,
        tier,
        price,
      }, { $autoCancel: false });

      setLeaseRecord(record);
      setPurchased(true);
      toast.success('Lease purchased successfully');
    } catch (error) {
      console.error('Purchase failed:', error);
      toast.error('Purchase failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (fileType) => {
    if (!leaseRecord) return;
    
    if (fileType === 'contract' && leaseRecord.contractFile) {
      const url = pb.files.getUrl(leaseRecord, leaseRecord.contractFile);
      window.open(url, '_blank');
    } else if (fileType === 'beat' && leaseRecord.beatFile) {
      const url = pb.files.getUrl(leaseRecord, leaseRecord.beatFile);
      window.open(url, '_blank');
    } else {
      toast.error('File not available yet. Please check your dashboard later.');
    }
  };

  const handleClose = () => {
    setPurchased(false);
    setLeaseRecord(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{purchased ? 'Purchase Complete' : 'Confirm Purchase'}</DialogTitle>
          <DialogDescription>
            {purchased ? 'Your lease has been activated' : `${tier} Lease - $${price}`}
          </DialogDescription>
        </DialogHeader>

        {!purchased ? (
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4">
              <p className="font-semibold mb-2">{tier} Lease</p>
              <ul className="space-y-2">
                {tierFeatures[tier]?.map((feature, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start">
                    <CheckCircle className="w-4 h-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="font-semibold">Total</span>
              <span className="text-2xl font-bold text-primary">${price}</span>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handlePurchase}
                disabled={loading}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? 'Processing...' : 'Confirm Purchase'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-accent/10 border border-accent rounded-lg p-4 text-center">
              <CheckCircle className="w-12 h-12 text-accent mx-auto mb-2" />
              <p className="font-semibold">Lease Activated</p>
              <p className="text-sm text-muted-foreground mt-1">
                Download your files below or access them anytime from your dashboard
              </p>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleDownload('contract')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Contract
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleDownload('beat')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Beat Files
              </Button>
            </div>

            <Button onClick={handleClose} className="w-full bg-primary text-primary-foreground">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseModal;