import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ProductsList from '@/components/ProductsList.jsx';

const ProductsPage = () => {
  return (
    <>
      <Helmet>
        <title>Store - TREEWATER STUDIOS</title>
        <meta name="description" content="Shop premium merchandise, apparel, and accessories from TREEWATER STUDIOS" />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 neon-text text-white">Official Store</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto drop-shadow-md">
              Exclusive merchandise, apparel, and accessories.
            </p>
          </div>

          <ProductsList />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ProductsPage;