# Firebase Storage CORS Configuration Guide

This guide will help you set up CORS (Cross-Origin Resource Sharing) for Firebase Storage, which is necessary for uploading files from your local development environment.

## Why CORS Configuration is Needed

When developing locally, your application at `http://localhost:3000` is considered a different origin than Firebase Storage (`firebasestorage.googleapis.com`). By default, browsers block cross-origin requests for security reasons. To allow these requests, you need to configure CORS in Firebase Storage.

## Option 1: Using the Firebase CLI (Recommended)

1. Make sure you have the Firebase CLI installed:
   ```
   npm install -g firebase-tools
   ```

2. Log in to Firebase:
   ```
   firebase login
   ```

3. Set the Firebase project:
   ```
   firebase use workout-tracker-263c1
   ```

4. Use the following command to set CORS configuration using the cors.json file:
   ```
   firebase storage:cors update --config=cors.json
   ```

## Option 2: Using gsutil

If you prefer using Google Cloud Storage's gsutil:

1. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install

2. Login with your Google account:
   ```
   gcloud auth login
   ```

3. Set CORS configuration:
   ```
   gsutil cors set cors.json gs://workout-tracker-263c1.appspot.com
   ```

## Temporary Solution (If You Can't Configure CORS)

If you're unable to configure CORS settings (perhaps due to permission issues), the application has been updated to handle upload failures gracefully. When a profile picture upload fails due to CORS issues, the onboarding process will continue without the profile picture, and you'll be able to upload one later from your profile page.

## Verifying CORS Configuration

After applying the CORS configuration, you can check if it's effective by:

1. Restarting your development server
2. Trying to upload a profile picture during onboarding
3. Looking for any CORS errors in the browser's developer console

If you still encounter CORS issues after configuring, make sure your Firebase project ID and storage bucket names are correct in the commands above. 