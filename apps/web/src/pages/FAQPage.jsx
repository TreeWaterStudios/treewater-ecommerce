import React from 'react';
import { Helmet } from 'react-helmet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const FAQPage = () => {
  const faqs = [
    {
      question: 'What is beat leasing?',
      answer:
        'Beat leasing allows you to license a beat for your music project while the producer retains ownership. You get the rights to use the beat according to your lease tier (Starter, Standard, or Premium), which determines usage limits, file formats, and distribution rights.',
    },
    {
      question: 'What file formats do I receive?',
      answer:
        'File formats depend on your lease tier. Starter includes MP3 (320kbps), Standard includes WAV + MP3, and Premium includes WAV + trackout stems for full mixing control.',
    },
    {
      question: 'Can I use leased beats for commercial purposes?',
      answer:
        'Yes! Standard and Premium tiers include commercial use rights. Starter tier is for non-commercial projects only. All tiers come with a legal contract specifying your usage rights.',
    },
    {
      question: 'How does instant delivery work?',
      answer:
        'After purchase, you can immediately download your beat files and contract from your dashboard. Files are available for re-download anytime from your account.',
    },
    {
      question: 'What is your return policy?',
      answer:
        'Due to the digital nature of our products, all sales are final. However, if you experience technical issues with your files, please contact support and we\'ll resolve it promptly.',
    },
    {
      question: 'How long does merchandise shipping take?',
      answer:
        'Standard shipping takes 5-7 business days within the US. International orders may take 10-14 business days. You\'ll receive tracking information once your order ships.',
    },
    {
      question: 'Can I purchase exclusive rights to a beat?',
      answer:
        'Yes! Premium tier includes the option for exclusive rights. Contact us directly for exclusive licensing arrangements, which remove the beat from our store and grant you full ownership.',
    },
    {
      question: 'Do you offer refunds on beat purchases?',
      answer:
        'We stand behind the quality of our beats. If you\'re not satisfied with your purchase, contact us within 48 hours and we\'ll work with you to find a solution.',
    },
  ];

  return (
    <>
      <Helmet>
        <title>FAQ - TREEWATER STUDIOS</title>
        <meta name="description" content="Frequently asked questions about TREEWATER STUDIOS" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 neon-text">Frequently Asked Questions</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about our services
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
            <p className="text-muted-foreground mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <a href="/contact">
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
                Contact Support
              </button>
            </a>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default FAQPage;