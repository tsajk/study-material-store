import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function PaymentSuccess() {
  const router = useRouter();
  const { order_id, product_id } = router.query;

  // Products mapping
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

  useEffect(() => {
    if (product_id && products[product_id]) {
      // Redirect to Telegram after 5 seconds
      const timer = setTimeout(() => {
        window.location.href = products[product_id].telegramLink;
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [product_id]);

  return (
    <div className="container">
      <Head>
        <title>Payment Successful</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="/styles.css" />
      </Head>

      <main className="success-page">
        <h1>Payment Successful!</h1>
        <div className="success-icon">✓</div>
        
        {product_id && products[product_id] ? (
          <>
            <p>Thank you for purchasing {products[product_id].name}.</p>
            <p>You will be redirected to the download page shortly...</p>
            <p>If you are not redirected automatically, <a href={products[product_id].telegramLink}>click here</a>.</p>
          </>
        ) : (
          <p>Thank you for your purchase!</p>
        )}
        
        <p>Order ID: {order_id}</p>
      </main>
    </div>
  );
}
