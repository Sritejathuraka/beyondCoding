import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  verified: boolean;
  subscribedAt: string;
}

// Subscribe a new email
// NOTE: Enable after creating 'subscribers' table (run supabase/newsletter.sql)
export const subscribe = async (email: string, name?: string): Promise<{ success: boolean; error?: string }> => {
  // Return friendly message until table is created
  return { success: false, error: 'Newsletter coming soon! Check back later.' };
  
  /* Uncomment after creating the subscribers table:
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Newsletter service not configured' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Please enter a valid email address' };
  }

  try {
    const { error } = await supabase
      .from('subscribers')
      .insert({
        email: email.toLowerCase().trim(),
        name: name?.trim() || null,
        verified: true,
      });

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'This email is already subscribed!' };
      }
      console.error('Error subscribing:', error);
      return { success: false, error: 'Failed to subscribe. Please try again.' };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Failed to subscribe. Please try again.' };
  }
  */
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
// NOTE: Enable this after creating the 'subscribers' table in Supabase
// Run supabase/newsletter.sql to create the table
export const getSubscriberCount = async (): Promise<number> => {
  // Return 0 until subscribers table is created
  // Remove this line after running newsletter.sql in Supabase
  return 0;
  
  /* Uncomment after creating the subscribers table:
  if (!isSupabaseConfigured) {
    return 0;
  }

  try {
    const { count, error } = await supabase
      .from('subscribers')
      .select('*', { count: 'exact', head: true })
      .is('unsubscribed_at', null);

    if (error) {
      return 0;
    }

    return count || 0;
  } catch {
    return 0;
  }
  */
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
