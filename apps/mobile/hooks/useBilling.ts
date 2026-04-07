import { useState, useCallback, useEffect } from 'react';
import RazorpayCheckout from 'react-native-razorpay';
import { config } from '../config';
import { Alert } from 'react-native';
import { getStoredSession } from '../lib/nativeAuth';

export interface Product {
  id: string;
  name: string;
  key: string;
  price: number;
  description: string;
  currency: string;
}

export interface ActiveSubscription {
  product?: { id: string; name: string; key: string };
  currentPeriodEnd?: string;
  status?: string;
}

export interface UsageStats {
  ai: { used: number; limit: number; remaining: number };
  plans: { used: number; limit: number };
  habits: { used: number; limit: number };
  study: {
    youtube: { used: number; limit: number };
    courses: { used: number; limit: number };
    projects: { used: number; limit: number };
  };
}

export function useBilling() {
  const [products, setProducts] = useState<Product[]>([]);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [buyingKey, setBuyingKey] = useState<string | null>(null);

  const fetchBillingData = useCallback(async () => {
    try {
      setLoading(true);
      const session = await getStoredSession();
      if (!session) return;

      const [prodRes, subRes] = await Promise.all([
        fetch(`${config.apiUrl}/api/billing/products`),
        fetch(`${config.apiUrl}/api/billing/subscription`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })
      ]);

      const products = await prodRes.json();
      const subscription = await subRes.json();

      setProducts(products);
      setData(subscription);
    } catch (error) {
      console.error("Failed to fetch billing data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  const handleBuy = async (productKey: string) => {
    try {
      setBuyingKey(productKey);
      const session = await getStoredSession();
      if (!session) {
        Alert.alert("Error", "You must be logged in to upgrade.");
        return;
      }

      // 1. Create Order
      const res = await fetch(`${config.apiUrl}/api/billing/create-order`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ productKey }),
      });
      const order = await res.json();

      if (!res.ok) throw new Error(order.error ?? "Order creation failed");

      // 2. Open Razorpay
      const options = {
        description: `Upgrade to ${productKey}`,
        image: 'https://i.imgur.com/3g7nmJC.png',
        currency: order.currency,
        key: order.keyId,
        amount: order.amount,
        name: 'DO GRIT',
        order_id: order.orderId,
        prefill: {
          email: session.user.email ?? undefined,
          contact: '',
          name: session.user.email?.split('@')[0]
        },
        theme: { color: '#0EA5E9' }
      };

      RazorpayCheckout.open(options).then(async (data: any) => {
        // 3. Verify Payment
        const verifyRes = await fetch(`${config.apiUrl}/api/billing/verify`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            razorpay_order_id: data.razorpay_order_id,
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_signature: data.razorpay_signature
          }),
        });

        if (verifyRes.ok) {
          Alert.alert("Success", "Subscription activated! Your neural limits have been expanded.");
          fetchBillingData();
        } else {
          Alert.alert("Error", "Payment verification failed.");
        }
      }).catch((error: any) => {
        console.log("Razorpay Error:", error);
        Alert.alert("Payment Cancelled", error.description);
      });

    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setBuyingKey(null);
    }
  };

  return {
    products,
    data,
    loading,
    buyingKey,
    handleBuy,
    refresh: fetchBillingData
  };
}
