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
        'Beat leasing allows you to license a beat for your music project while TreeWater Studios retains ownership of the instrumental. Your usage rights depend on the license option you select through BeatStars.',
    },
    {
      question: 'Where do I preview and buy beats?',
      answer:
        'Beats can be previewed and licensed through the official TreeWater Studios BeatStars player on the Beat Leasing page. BeatStars handles beat playback, license options, secure checkout, and digital delivery.',
    },
    {
      question: 'What file formats do I receive?',
      answer:
        'File formats depend on the license option selected at checkout. Some licenses may include MP3, WAV, or trackout stems. Please review the license details shown in the BeatStars player before purchasing.',
    },
    {
      question: 'Can I use leased beats for commercial purposes?',
      answer:
        'Commercial use depends on the license you purchase. Review the license terms shown through BeatStars before checkout so you understand usage limits, distribution rights, and any restrictions.',
    },
    {
      question: 'How does digital delivery work?',
      answer:
        'After purchasing a beat license through BeatStars, your files and license information are delivered through the BeatStars purchase flow. Please use the email and account information connected to your BeatStars order.',
    },
    {
      question: 'What is your return & refund policy?',
      answer:
        'Digital beat/license purchases are generally final once delivered. If you experience a technical issue with a digital file, contact us and we will help resolve it. Merchandise returns or replacements are reviewed case by case for damaged, defective, or incorrect items.',
    },
    {
      question: 'How long does merchandise shipping take?',
      answer:
        'Merchandise shipping times may vary based on the product, fulfillment status, and delivery location. Tracking information will be provided once your order ships.',
    },
    {
      question: 'Can I purchase exclusive rights to a beat?',
      answer:
        'Exclusive rights may be available on select beats, but TreeWater Studios reserves the right not to sell exclusive rights at this time. If you are interested in exclusive licensing, please contact us directly and we will review availability on a case-by-case basis.',
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
              Find answers about beat licensing, merchandise, delivery, and support.
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
                Contact TreeWater
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