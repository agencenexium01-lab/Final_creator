import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-15',
});

// Middleware
app.use(cors({
  origin: [process.env.APP_URL || 'http://localhost:3000', 'https://localhost:3000'],
  credentials: true,
}));
app.use(express.json());

// Initialize Firebase Admin
let db: any;
try {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_ADMIN_SDK || '{}')),
  });
  db = getFirestore();
} catch (error) {
  console.log('Firebase Admin not configured, using mock database');
}

// Create Checkout Session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { credits, priceInCents, userId, userEmail, packageId } = req.body;

    if (!priceInCents || !userId || !userEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${credits} Crédits Creator Booster`,
              description: `Recharge de ${credits} crédits pour générer du contenu viral`,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/recharge-credits`,
      customer_email: userEmail,
      metadata: {
        userId,
        credits: credits.toString(),
        packageId,
      },
    });

    res.json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify Payment Status
app.get('/api/verify-payment/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid' && db) {
      const userId = session.metadata?.userId;
      const credits = parseInt(session.metadata?.credits || '0', 10);

      if (userId && credits > 0) {
        // Update user credits in Firestore
        const userRef = db.collection('profiles').doc(userId);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
          const currentCredits = userDoc.data().credits || 0;
          await userRef.update({
            credits: currentCredits + credits,
            last_recharge: new Date().toISOString(),
          });
        }

        res.json({
          success: true,
          credits,
          message: 'Crédits ajoutés avec succès',
        });
      } else {
        res.status(400).json({ error: 'Invalid session metadata' });
      }
    } else {
      res.status(400).json({ error: 'Payment not completed' });
    }
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook Handler
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const credits = parseInt(session.metadata?.credits || '0', 10);

      if (userId && credits > 0 && db) {
        const userRef = db.collection('profiles').doc(userId);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
          const currentCredits = userDoc.data().credits || 0;
          await userRef.update({
            credits: currentCredits + credits,
            last_recharge: new Date().toISOString(),
          });

          console.log(`✅ Credits added for user ${userId}: ${credits} credits`);
        }
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Stripe server running on port ${PORT}`);
});
