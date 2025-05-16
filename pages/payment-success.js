import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Head from 'next/head';

const products = {
  'master-the-ncert-bio-12th': {
    name: 'Master the NCERT Biology 12th',
    telegramLink: 'https://t.me/Material_eduhubkmrbot?start=master-the-ncert-bio-12th'
  },
  'master-the-ncert-bio-11th': {
    name: 'Master the NCERT Biology 11th',
    telegramLink: 'https://t.me/Material_eduhubkmrbot?start=master-the-ncert-bio-11th'
  },
  'disha-144-jee-mains-physics': {
    name: 'Disha 144 JEE Mains Physics',
    telegramLink: 'https://t.me/Material_eduhubkmrbot?start=disha-144-jee-mains-physics'
  }
};

export default function PaymentSuccess() {
  const router = useRouter();
  const { product_id, order_id } = router.query;
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!order_id || !product_id) return;

    const verifyPayment = async () => {
      try {
        // In a real app, you would verify the payment with your backend
        // For this example, we'll simulate verification
        setIsVerified(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Payment verification failed:', error);
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [order_id, product_id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Head>
          <title>Verifying Payment</title>
        </Head>
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4">Verifying Your Payment</h1>
          <p>Please wait while we verify your payment...</p>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Head>
          <title>Payment Verification Failed</title>
        </Head>
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4">Payment Verification Failed</h1>
          <p className="mb-4">We couldn't verify your payment. Please contact support.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  const product = products[product_id];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Head>
        <title>Payment Successful</title>
      </Head>
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
        <p className="mb-6">Thank you for purchasing {product.name}.</p>
        
        <p className="mb-6">Your order ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{order_id}</span></p>
        
        <a
          href={product.telegramLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 transition mb-4"
        >
          Access Your Study Material
        </a>
        
        <button
          onClick={() => router.push('/')}
          className="text-blue-600 hover:text-blue-800 transition"
        >
          Return to Store
        </button>
      </div>
    </div>
  );
}
