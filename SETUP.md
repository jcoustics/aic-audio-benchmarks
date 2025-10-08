# Supabase Setup Guide

This guide will help you set up Supabase for the Audio Enhancement Demo.

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - **Name**: aic-audio-benchmarks
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your users
5. Click "Create new project"

## 2. Get Your API Keys

1. Go to Project Settings > API
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## 3. Configure Environment Variables

1. Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and add your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 4. Run Database Migration

1. Go to the SQL Editor in Supabase Dashboard
2. Create a new query
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and run the SQL

This will create:
- `audio_samples` table
- `spectrograms` table
- Storage buckets for audio and images
- Row Level Security policies

## 5. Create Storage Buckets (if not auto-created)

If the buckets weren't created by the migration:

1. Go to Storage in Supabase Dashboard
2. Create two buckets:
   - **Name**: `audio`, **Public**: ✅ Yes
   - **Name**: `spectrograms`, **Public**: ✅ Yes

## 6. Create Admin User

1. Go to Authentication > Users in Supabase Dashboard
2. Click "Add user" > "Create new user"
3. Fill in:
   - **Email**: your-admin@email.com
   - **Password**: (secure password)
   - **Auto Confirm User**: ✅ Yes
4. Click "Create user"

## 7. Test the Setup

1. Start the development server:

```bash
npm run dev
```

2. Navigate to `http://localhost:3000/admin/login`
3. Log in with your admin credentials
4. You should see the admin dashboard

## 8. Upload Your First Files

1. In the admin dashboard, select:
   - **Artifact Type**: distortion
   - **Version Type**: original
2. Upload an audio file and a spectrogram image
3. Click "Upload File"
4. Refresh the homepage to see your uploads

## 9. Deploy to Vercel

1. Push your code to GitHub:

```bash
git add .
git commit -m "Add Supabase integration"
git push origin main
```

2. Go to [Vercel](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

## Troubleshooting

### "Invalid API key" error
- Double-check your `.env.local` file
- Ensure the anon key is correct
- Restart the dev server after changing env vars

### Files not uploading
- Check storage bucket policies in Supabase Dashboard
- Ensure buckets are set to public
- Check browser console for errors

### Authentication not working
- Verify admin user was created in Supabase
- Check "Auto Confirm User" is enabled
- Try resetting the password

### Images/Audio not displaying
- Check the file URLs in the database
- Verify storage buckets are public
- Check browser network tab for 404s

## Database Schema Reference

### audio_samples table
- `id` (uuid, primary key)
- `artifact_type` (enum: distortion, reverb, bandlimit)
- `version_type` (enum: original, subtractive, generative)
- `file_url` (text)
- `file_name` (text)
- `file_size` (bigint)
- `mime_type` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### spectrograms table
- Same structure as audio_samples
- Uses `image_url` instead of `file_url`

## Storage Structure

```
audio/
├── distortion/
│   ├── original-timestamp-filename.wav
│   ├── subtractive-timestamp-filename.wav
│   └── generative-timestamp-filename.wav
├── reverb/
│   └── ...
└── bandlimit/
    └── ...

spectrograms/
├── distortion/
│   ├── original-timestamp-filename.png
│   ├── subtractive-timestamp-filename.png
│   └── generative-timestamp-filename.png
├── reverb/
│   └── ...
└── bandlimit/
    └── ...
```
