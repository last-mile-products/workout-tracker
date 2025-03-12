# Fitness Tracker - Angela's Wedding Countdown

A family fitness tracking application to help everyone reach their fitness goals before Angela's wedding on May 24, 2026.

## Features

- **User Authentication**: Secure email/password authentication with Firebase
- **Onboarding Flow**: Guided setup for new users to set username, profile picture, and fitness goals
- **Dashboard**: Track your progress towards weight, running, and healthy eating goals
- **Profile Management**: Update your profile information and goals
- **Real-time Chat**: Connect with family members for motivation and support
- **Leaderboard**: See how everyone is progressing towards their goals

## Tech Stack

- **Frontend**: Next.js 14 with App Router, React, TypeScript
- **UI Components**: Shadcn UI for a modern, accessible interface
- **Styling**: Tailwind CSS for responsive design
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **State Management**: React Context API
- **Form Handling**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn
- Firebase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```
3. Configure Firebase (see below)
4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

### Firebase Configuration

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Authentication (Email/Password), Firestore, and Storage
3. Create a `.env.local` file in the root directory with your Firebase configuration:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

### Firebase Storage CORS Configuration

If you encounter CORS errors when uploading profile pictures during development, you need to configure CORS settings for Firebase Storage:

1. Use the provided script to automatically configure CORS:
   ```bash
   chmod +x setup-cors.sh
   ./setup-cors.sh
   ```
   
   This will ask for your Firebase project ID and set up CORS properly.

2. Alternatively, follow the manual instructions in the `FIREBASE_CORS_SETUP.md` file.

The application is designed to gracefully handle upload failures, so you can still complete the onboarding process even if image uploads fail. Profile pictures can be added later from the profile page once CORS is properly configured.

## Project Structure

```
workout-tracker/
├── public/                  # Static assets
├── src/
│   ├── app/                 # App Router pages
│   │   ├── auth/            # Authentication pages
│   │   │   ├── login/       # Login page
│   │   │   ├── signup/      # Signup page
│   │   │   └── onboarding/  # Onboarding flow
│   │   ├── dashboard/       # Dashboard page
│   │   ├── profile/         # Profile page
│   │   ├── chat/            # Chat page
│   │   ├── leaderboard/     # Leaderboard page
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/          # React components
│   │   ├── layout/          # Layout components
│   │   ├── ui/              # UI components (shadcn)
│   │   └── providers/       # Context providers
│   └── lib/                 # Utility functions
│       ├── firebase/        # Firebase configuration and hooks
│       └── utils/           # Helper functions
├── .env.local.example       # Example environment variables
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

## Deployment

1. Build the application:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. Deploy to Firebase Hosting:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   firebase deploy
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Firebase](https://firebase.google.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
# workout-tracker
