import { supabase } from './supabase';

/**
 * Sends an email using the Supabase Edge Function 'send-email'.
 * @param {Object} params
 * @param {string} params.to - The recipient's email address.
 * @param {string} params.subject - The subject of the email.
 * @param {string} params.html - The data to be sent in the email.
 * @returns {Promise<{data: any, error: any}>}
 */
export const sendEmail = async ({ to, subject, html }) => {
  if (!supabase) {
    console.error("Supabase client not initialized cannot send email");
    return { error: "Supabase client not initialized" };
  }

  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, html },
    });

    if (error) {
        console.error('Error invoking send-email function:', error);
        return { error };
    }

    return { data };

  } catch (err) {
      console.error('Unexpected error sending email:', err);
      return { error: err };
  }
};
