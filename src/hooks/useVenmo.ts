import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export const useVenmo = () => {
  const { user } = useAuth();
  const [venmoUsername, setVenmoUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsername = async () => {
    if (!user) {
      setVenmoUsername(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/venmo/get-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.uid }),
      });

      const data = await response.json();
      if (response.ok) {
        setVenmoUsername(data.username);
      } else {
        console.error('Error fetching Venmo username:', data.error);
      }
    } catch (error) {
      console.error('Error fetching Venmo username:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUsername = async (username: string) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/venmo/save-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          username,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setVenmoUsername(data.username);
        return { success: true };
      } else {
        throw new Error(data.error || 'Failed to save username');
      }
    } catch (error: any) {
      console.error('Error saving Venmo username:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const generatePaymentLink = async (
    amount: number,
    recipientUserId: string | null,
    recipientName: string,
    note?: string
  ) => {
    try {
      const response = await fetch('/api/venmo/generate-payment-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          recipientUserId,
          recipientName,
          note: note || `Payment to ${recipientName}`,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        return data;
      } else {
        throw new Error(data.error || 'Failed to generate payment link');
      }
    } catch (error: any) {
      console.error('Error generating Venmo link:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsername();
    }
  }, [user]);

  return {
    venmoUsername,
    isLoading,
    fetchUsername,
    saveUsername,
    generatePaymentLink,
  };
};

