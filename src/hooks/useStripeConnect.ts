import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface StripeAccountStatus {
  hasAccount: boolean;
  accountId?: string;
  status: 'none' | 'pending' | 'active';
  detailsSubmitted?: boolean;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
}

export const useStripeConnect = () => {
  const { user } = useAuth();
  const [accountStatus, setAccountStatus] = useState<StripeAccountStatus>({
    hasAccount: false,
    status: 'none',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const checkAccountStatus = async () => {
    if (!user) {
      setAccountStatus({ hasAccount: false, status: 'none' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/check-account-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.uid }),
      });

      const data = await response.json();
      if (response.ok) {
        setAccountStatus(data);
      } else {
        console.error('Error checking account status:', data.error);
      }
    } catch (error) {
      console.error('Error checking account status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createAccount = async () => {
    if (!user) return null;

    setIsCreatingAccount(true);
    try {
      const response = await fetch('/api/stripe/create-connect-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          email: user.email || '',
          name: user.displayName || user.email || 'User',
        }),
      });

      const data = await response.json();
      if (response.ok) {
        await checkAccountStatus(); // Refresh status
        return data.accountId;
      } else {
        throw new Error(data.error || 'Failed to create account');
      }
    } catch (error: any) {
      console.error('Error creating account:', error);
      throw error;
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const getAccountLink = async (accountId: string) => {
    if (!user) return null;

    try {
      const response = await fetch('/api/stripe/get-account-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          accountId,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        return data.url;
      } else {
        throw new Error(data.error || 'Failed to get account link');
      }
    } catch (error: any) {
      console.error('Error getting account link:', error);
      throw error;
    }
  };

  const connectAccount = async () => {
    try {
      let accountId = accountStatus.accountId;

      // Create account if it doesn't exist
      if (!accountId) {
        accountId = await createAccount();
        if (!accountId) {
          throw new Error('Failed to create account');
        }
      }

      // Get account link for onboarding
      const linkUrl = await getAccountLink(accountId);
      if (!linkUrl) {
        throw new Error('Failed to get account link');
      }

      // Redirect to Stripe onboarding
      window.location.href = linkUrl;
    } catch (error: any) {
      console.error('Error connecting account:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      checkAccountStatus();
    }
  }, [user]);

  return {
    accountStatus,
    isLoading,
    isCreatingAccount,
    checkAccountStatus,
    createAccount,
    connectAccount,
  };
};

