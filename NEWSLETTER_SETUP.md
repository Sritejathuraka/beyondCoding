# Newsletter Setup Guide

This guide explains how to set up the newsletter feature with automatic email notifications.

## Overview

When you publish an article or course:
1. Subscribers automatically receive an email notification
2. The email contains the title, description, and a link to read

## Setup Steps

### 1. Run the Newsletter SQL Schema

In your Supabase SQL Editor, run the contents of:
```
supabase/newsletter.sql
```

This creates:
- `subscribers` table - stores newsletter subscribers
- `notification_log` table - prevents duplicate notifications
- RLS policies for security

### 2. Sign Up for Resend (Free)

1. Go to [resend.com](https://resend.com) and create a free account
2. Free tier: 100 emails/day, 3,000 emails/month
3. Get your API key from the Resend dashboard

### 3. Configure Your Domain (Optional but Recommended)

By default, you can send from `onboarding@resend.dev` for testing.

For production:
1. In Resend, go to **Domains** → **Add Domain**
2. Add your domain (e.g., `beyondcoding.dev`)
3. Add the DNS records Resend provides
4. Wait for verification

### 4. Deploy the Edge Function

#### Option A: Using Supabase CLI (Recommended)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   cd beyondcode-blog
   supabase link --project-ref dstanvinudwiyptjyotl
   ```

4. Set secrets:
   ```bash
   supabase secrets set RESEND_API_KEY=re_XXXXX
   supabase secrets set SITE_URL=https://yourdomain.com
   supabase secrets set FROM_EMAIL=hello@yourdomain.com
   ```

5. Deploy the function:
   ```bash
   supabase functions deploy send-newsletter
   ```

#### Option B: Via Supabase Dashboard

1. Go to your Supabase project → **Edge Functions**
2. Click **Deploy a new function**
3. Name it `send-newsletter`
4. Paste the contents of `supabase/functions/send-newsletter/index.ts`
5. Go to **Settings** → **Edge Functions** → **Secrets**
6. Add these secrets:
   - `RESEND_API_KEY`: Your Resend API key
   - `SITE_URL`: Your production URL (e.g., `https://beyondcoding.dev`)
   - `FROM_EMAIL`: Your sender email (e.g., `hello@beyondcoding.dev`)

### 5. Test the Setup

1. Subscribe via the newsletter form on your homepage
2. Check Supabase → Table Editor → `subscribers` to confirm it was saved
3. Publish an article
4. Check your email!

## How It Works

```
User subscribes → Email saved to Supabase subscribers table
                          ↓
Admin publishes article → notifySubscribers() called
                          ↓
                   Edge Function triggered
                          ↓
              Fetches all verified subscribers
                          ↓
              Sends email via Resend API
                          ↓
              Logs notification to prevent duplicates
```

## Environment Variables

For the Edge Function:
| Variable | Description | Example |
|----------|-------------|---------|
| `RESEND_API_KEY` | Your Resend API key | `re_123abc...` |
| `SITE_URL` | Your production website URL | `https://beyondcoding.dev` |
| `FROM_EMAIL` | Email sender address | `hello@beyondcoding.dev` |

## Troubleshooting

### "Failed to send notifications" error
- Check Edge Function logs in Supabase Dashboard
- Verify RESEND_API_KEY is set correctly
- Make sure Resend domain is verified (or use `onboarding@resend.dev` for testing)

### Subscribers not receiving emails
- Check if subscriber is `verified = true` in the database
- Check if `unsubscribed_at` is NULL
- Check Resend dashboard for delivery status

### Duplicate notifications
- The `notification_log` table prevents sending the same notification twice
- If you need to resend, delete the entry from `notification_log`

## Unsubscribe Feature

Users can unsubscribe via the link in each email. You'll need to create an `/unsubscribe` page:

```tsx
// pages/Unsubscribe.tsx
import { useSearchParams } from 'react-router-dom';
import { unsubscribe } from '../services/subscriberService';

const Unsubscribe = () => {
  const [params] = useSearchParams();
  const email = params.get('email');
  
  // Call unsubscribe(email) and show confirmation
};
```

## Security Notes

- Subscribers can only insert (anyone can subscribe)
- Only admins can view the subscriber list
- RLS policies protect all data
- Edge Functions run with service role for full access
