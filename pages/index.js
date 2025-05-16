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
    description: 'Complete physics material for JEE Mains',
    telegramLink: 'https://t.me/Material_eduhubkmrbot?start=disha-144-jee-mains-physics'
  }
];

export default function Home() {
  // ... (keep the same component logic as before)
}
