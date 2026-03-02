import { supabase } from '../lib/supabase';

interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export async function submitContactForm(data: ContactFormData): Promise<void> {
  // Insert into database
  const { data: submission, error } = await supabase
    .from('contact_submissions')
    .insert({
      name: data.name,
      email: data.email,
      subject: data.subject || null,
      message: data.message
    })
    .select()
    .single();

  if (error) {
    console.error('Error submitting contact form:', error);
    throw new Error('Failed to submit contact form');
  }

  // Send notification email via Edge Function
  try {
    await supabase.functions.invoke('notify-contact', {
      body: {
        id: submission.id,
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message
      }
    });
  } catch (emailError) {
    // Don't fail the submission if email fails
    console.error('Failed to send notification email:', emailError);
  }
}
