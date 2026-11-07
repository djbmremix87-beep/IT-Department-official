# IT Department Pro

Comprehensive management system for CCTV installations, repairs, and maintenance.

## Production Deployment Guide

### Prerequisites
- Node.js (v22+)
- Firebase Project
- Netlify Site

### 1. Environment Variables (Netlify Dashboard)
Configure the following environment variables in your Netlify site settings (do not hardcode these in the repository):

| Variable Name | Description |
| :--- | :--- |
| `TELEGRAM_BOT_TOKEN` | Your Telegram Bot API Token. |
| `TELEGRAM_CHAT_ID` | The ID of the Telegram chat or channel. |
| `GEMINI_API_KEY` | Your Gemini API Key. |
| `FIREBASE_API_KEY` | Firebase Web API Key. |
| `FIREBASE_PROJECT_ID` | Your Firebase Project ID. |
| `FIREBASE_STORAGE_BUCKET` | Your Firebase Storage Bucket. |
| `FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain. |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID. |
| `FIREBASE_APP_ID` | Firebase App ID. |

### 2. Firebase Setup
- Enable **Google** and **Email/Password** authentication in the Firebase Console.
- Deploy Firestore Security Rules:
  `firebase deploy --only firestore:rules`
- Ensure the Firestore database is properly provisioned with the ID configured in `firebase-applet-config.json`.

### 3. Running Locally
1. Copy `.env.example` to `.env.local` and fill in required values.
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

### 4. Deployment
- The project is configured for automated deployment via Netlify. Connect your GitHub repository to your Netlify site, and pushes to the main branch will trigger automatic deployments.
- Ensure all environment variables are correctly set in the Netlify dashboard before deployment.
