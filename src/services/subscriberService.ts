import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  verified: boolean;
  subscribedAt: string;
}

// Subscribe a new email
export const subscribe = async (email: string, name?: string): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Newsletter service not configured' };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Please enter a valid email address' };
  }

  const { error } = await supabase
    .from('subscribers')
    .insert({
      email: email.toLowerCase().trim(),
      name: name?.trim() || null,
      verified: true, // Auto-verify for now (can add email verification later)
    });

  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      return { success: false, error: 'This email is already subscribed!' };
    }
    console.error('Error subscribing:', error);
    return { success: false, error: 'Failed to subscribe. Please try again.' };
  }

  return { success: true };
};

// Unsubscribe an email
export const unsubscribe = async (email: string): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Newsletter service not configured' };
  }

  const { error } = await supabase
    .from('subscribers')
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq('email', email.toLowerCase().trim());

  if (error) {
    console.error('Error unsubscribing:', error);
    return { success: false, error: 'Failed to unsubscribe. Please try again.' };
  }

  return { success: true };
};

// Get subscriber count (for display)
export const getSubscriberCount = async (): Promise<number> => {
  if (!isSupabaseConfigured) {
    return 0;
  }

  const { data, error } = await supabase
    .rpc('get_subscriber_count');

  if (error) {
    console.error('Error getting subscriber count:', error);
    return 0;
  }

  return data || 0;
};

// Notify subscribers about new content (called from Edge Function)
export const notifySubscribers = async (
  contentType: 'article' | 'course',
  contentId: string,
  title: string,
  description: string,
  url: string
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Service not configured' };
  }

  try {
    // Call the Edge Function
    const { error } = await supabase.functions.invoke('send-newsletter', {
      body: {
        contentType,
        contentId,
        title,
        description,
        url,
      },
    });

    if (error) {
      console.error('Error sending newsletter:', error);
      return { success: false, error: 'Failed to send notifications' };
    }

    return { success: true };
  } catch (err) {
    console.error('Error invoking Edge Function:', err);
    return { success: false, error: 'Failed to send notifications' };
  }
};
