import { useState } from 'react';
import Head from 'next/head';
import axios from 'axios';

const products = [
  {
    id: 'master-the-ncert-bio-12th',
    name: 'Master the NCERT Biology 12th',
    price: 299,
    description: 'Complete study material for NCERT Biology Class 12',
    telegramLink: 'https://t.me/Material_eduhubkmrbot?start=master-the-ncert-bio-12th'
  },
  {
    id: 'master-the-ncert-bio-11th',
    name: 'Master the NCERT Biology 11th',
    price: 299,
    description: 'Complete study material for NCERT Biology Class 11',
    telegramLink: 'https://t.me/Material_eduhubkmrbot?start=master-the-ncert-bio-11th'
  },
  {
    id: 'disha-144-jee-mains-physics',
    name: 'Disha 144 JEE Mains Physics',
    price: 399,
    description: '144 important questions for JEE Mains Physics',
    telegramLink: 'https://t.me/Material_eduhubkmrbot?start=disha-144-jee-mains-physics'
  }
];

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setError('');
  };

  const initiatePayment = async () => {
    if (!customerName || !customerEmail || !customerPhone) {
      setError('Please fill all customer details');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/create-order', {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        amount: selectedProduct.price,
        customerName,
        customerEmail,
        customerPhone
      });

      if (response.data.paymentLink) {
        window.location.href = response.data.paymentLink;
      } else {
        setError('Failed to generate payment link');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment initiation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>Study Material Store</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="/styles.css" />
      </Head>

      <main>
        <h1>Study Material Store</h1>
        
        {!selectedProduct ? (
          <div className="product-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card" onClick={() => handleProductSelect(product)}>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p className="price">₹{product.price}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="checkout-form">
            <h2>Checkout: {selectedProduct.name}</h2>
            <p>Price: ₹{selectedProduct.price}</p>
            
            <div className="form-group">
              <label>Your Name</label>
              <input 
                type="text" 
                value={customerName} 
                onChange={(e) => setCustomerName(e.target.value)} 
                placeholder="Enter your full name" 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                value={customerEmail} 
                onChange={(e) => setCustomerEmail(e.target.value)} 
                placeholder="Enter your email" 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Phone Number</label>
              <input 
                type="tel" 
                value={customerPhone} 
                onChange={(e) => setCustomerPhone(e.target.value)} 
                placeholder="Enter your phone number" 
                required 
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="button-group">
              <button onClick={() => setSelectedProduct(null)}>Back to Products</button>
              <button 
                onClick={initiatePayment} 
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        )}
      </main>

      <footer>
        <p>© {new Date().getFullYear()} Study Material Store</p>
      </footer>
    </div>
  );
}
