import { useState } from 'react'
import Head from 'next/head'
import axios from 'axios'

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
    description: 'Complete physics material for JEE Mains',
    telegramLink: 'https://t.me/Material_eduhubkmrbot?start=disha-144-jee-mains-physics'
  }
]

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleBuyNow = async (product) => {
    setSelectedProduct(product)
  }

  const initiatePayment = async () => {
    if (!customerName || !customerEmail || !customerPhone) {
      alert('Please fill all customer details')
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.post('/api/create-order', {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        amount: selectedProduct.price,
        customerName,
        customerEmail,
        customerPhone
      })

      if (response.data.paymentLink) {
        window.location.href = response.data.paymentLink
      }
    } catch (error) {
      console.error('Payment initiation failed:', error)
      alert('Payment initiation failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Study Material Store</title>
        <meta name="description" content="Purchase study materials" />
      </Head>

      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Study Material Store</h1>
        
        {!selectedProduct ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <p className="text-lg font-bold mb-4">₹{product.price}</p>
                <button
                  onClick={() => handleBuyNow(product)}
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Complete Your Purchase</h2>
            <div className="mb-4">
              <p className="font-medium">Product: {selectedProduct.name}</p>
              <p className="font-medium">Price: ₹{selectedProduct.price}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <button
                onClick={initiatePayment}
                disabled={isLoading}
                className={`w-full py-2 rounded-md ${isLoading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white transition`}
              >
                {isLoading ? 'Processing...' : 'Proceed to Payment'}
              </button>
              
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-full py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
              >
                Back to Products
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
