# X (Twitter) API Setup for AkiliRisk Marketing

This guide explains how to set up the X API for automated social media posting as part of AkiliRisk's go-to-market strategy.

## Overview

The X posting scripts allow you to:
- Post individual tweets from the command line
- Schedule content for future publishing
- Post threads (multi-tweet content)
- Run automated campaigns via cron

## Prerequisites

1. **X Developer Account**: Sign up at [developer.x.com](https://developer.x.com)
2. **Paid API Tier**: The Free tier is read-only. You need **Basic tier ($200/month)** or higher for write access
3. **Node.js 22+**: Required for running the scripts

## Step 1: Create an X Developer App

1. Go to the [X Developer Portal](https://developer.x.com/en/portal/dashboard)
2. Create a new Project (or use an existing one)
3. Create a new App within the project
4. Configure the app settings:
   - **App Type**: Choose "Automated App or Bot"
   - **App permissions**: Select **Read and Write** (this is critical!)
   - **Callback URI**: Enter `https://akilirisk.com` (required but not used)
   - **Website URL**: Enter `https://akilirisk.com`

## Step 2: Generate API Credentials

After creating your app:

1. Navigate to **Keys and tokens** tab
2. Generate and copy:
   - **API Key** (Consumer Key)
   - **API Key Secret** (Consumer Secret)
3. Generate **Access Token and Secret** with Read and Write permissions:
   - **Access Token**
   - **Access Token Secret**

> **Important**: If you created tokens before setting Read and Write permissions, you must regenerate them after changing permissions.

## Step 3: Configure Environment Variables

Add these to your `.env.local`:

```bash
# X (Twitter) API Credentials
X_API_KEY="your_api_key_here"
X_API_SECRET="your_api_secret_here"
X_ACCESS_TOKEN="your_access_token_here"
X_ACCESS_TOKEN_SECRET="your_access_token_secret_here"

# Optional: Your X handle (defaults to "akilirisk")
X_HANDLE="akilirisk"
```

## Step 4: Verify Your Setup

Test that your credentials are working:

```bash
npm run x:verify
# or
npx tsx scripts/x-post.ts --verify
```

Expected output:
```
🔍 Verifying X API credentials...
✅ Credentials verified!
   Account: @akilirisk
   Name: AkiliRisk
   ID: 1234567890
   Profile: https://x.com/akilirisk
```

## Usage

### Post a Single Tweet

```bash
# Simple tweet
npm run x:post "Excited to share our latest risk assessment insights!"

# Dry run (test without posting)
npm run x:post -- --dry-run "Test tweet"
```

### Post a Thread

For longer content, use the thread option to automatically split text:

```bash
npm run x:post -- --thread "This is a comprehensive thread about household risk management. We'll cover cyber security, identity protection, family safety, and more. Each topic deserves attention in today's digital world..."
```

### Reply to a Tweet

```bash
npm run x:post -- --reply 1234567890 "Thanks for the great question!"
```

### Quote Tweet

```bash
npm run x:post -- --quote 1234567890 "Great insights from @partner!"
```

## Campaign Management

For scheduled content and campaign management:

### Add Scheduled Posts

```bash
# Schedule for immediate posting
npm run x:campaign -- --add "Check out our new features!"

# Schedule for a specific time
npm run x:campaign -- --add "Morning security tip!" --at "2024-01-15T09:00:00"

# Schedule a thread
npm run x:campaign -- --add "Long thread content..." --thread --at "2024-01-15T14:00:00"
```

### View Scheduled Content

```bash
# List all posts
npm run x:campaign -- --list

# Filter by status
npm run x:campaign -- --list scheduled

# View calendar
npm run x:campaign -- --preview
```

### Publish Scheduled Posts

```bash
# Post next due item
npm run x:campaign -- --post-next

# Post all due items
npm run x:campaign -- --post-due
```

### Delete a Scheduled Post

```bash
npm run x:campaign -- --delete post_1234567890_abc123
```

## Automated Publishing with Cron

Set up a cron job to automatically publish scheduled content:

```bash
# Edit crontab
crontab -e

# Add: Run every hour to post due content
0 * * * * cd /path/to/akilirisk && npx tsx scripts/x-campaign.ts --post-due >> /var/log/x-campaign.log 2>&1

# Or: Run every 15 minutes
*/15 * * * * cd /path/to/akilirisk && npx tsx scripts/x-campaign.ts --post-due >> /var/log/x-campaign.log 2>&1
```

## Campaign Data

Scheduled posts are stored in `data/x-campaign.json`. This file:
- Is created automatically on first use
- Should be backed up for production campaigns
- Can be edited manually if needed (JSON format)
- Is gitignored by default (contains campaign-specific data)

## Rate Limits

Be aware of X API rate limits:

| Tier | Monthly Posts | Cost |
|------|---------------|------|
| Free | Read-only | $0 |
| Basic | 3,000 | $200/mo |
| Pro | 100,000 | $5,000/mo |

Additional limits:
- Max tweet length: 280 characters
- Max media per tweet: 4 images
- Max thread length: 25 tweets (recommended)

## Content Best Practices

### Tweet Guidelines
1. Keep tweets under 280 characters
2. Use hashtags sparingly (1-2 per tweet)
3. Include calls-to-action when appropriate
4. Mix promotional content with value-add content

### Recommended Posting Schedule
- **B2B audience**: Weekdays, 9 AM - 5 PM local time
- **Optimal times**: Tuesday-Thursday, 10 AM - 12 PM
- **Frequency**: 1-3 posts per day to start

### Content Mix (80/20 Rule)
- 80% educational, valuable content
- 20% promotional content

### Example Tweets

```bash
# Educational
npm run x:post "5 signs your household may be vulnerable to cyber threats: 1) Weak passwords 2) No MFA 3) Outdated software 4) Public WiFi usage 5) No security awareness training. Protect your family today."

# Promotional
npm run x:post "Ready to understand your family's risk profile? AkiliRisk provides comprehensive assessments covering cyber, identity, and physical security. Start your free assessment today: https://akilirisk.com"

# Engagement
npm run x:post "What's your biggest concern when it comes to digital security for your family? Reply below!"
```

## Troubleshooting

### "Missing credentials" error
Ensure all four environment variables are set in `.env.local`:
- `X_API_KEY`
- `X_API_SECRET`
- `X_ACCESS_TOKEN`
- `X_ACCESS_TOKEN_SECRET`

### "Forbidden" or "401 Unauthorized" error
1. Verify your app has **Read and Write** permissions
2. Regenerate Access Token after changing permissions
3. Ensure you're on Basic tier or higher (Free tier is read-only)

### "Rate limit exceeded" error
You've hit the monthly posting limit. Wait for the limit to reset or upgrade your tier.

### "Duplicate content" error
X rejects duplicate tweets. Modify the content slightly before retrying.

## Security Notes

1. **Never commit credentials** - Keep them in `.env.local` only
2. **Use environment variables** - Don't hardcode credentials
3. **Rotate tokens periodically** - Especially if compromised
4. **Monitor API usage** - Check the developer dashboard for unusual activity

## Support

For issues with the X API:
- [X API Documentation](https://developer.x.com/en/docs)
- [X Developer Community](https://twittercommunity.com/)
- [X API Status](https://api.twitterstat.us/)

For issues with these scripts:
- Check the [AkiliRisk repository](https://github.com/your-org/akilirisk/issues)
