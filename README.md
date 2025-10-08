# Audio Enhancement Demo - Subtractive vs. Generative

Interactive demo page showcasing audio enhancement technology by comparing subtractive AI approaches with generative AI solutions through visual spectrograms and audio playback.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Version Control**: GitHub

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn
- Supabase account (free tier works)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Supabase Setup

See [SETUP.md](./SETUP.md) for detailed Supabase configuration instructions.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
aic-audio-benchmarks/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── AudioPlayer.tsx     # Audio playback component
│   └── SpectrogramCard.tsx # Spectrogram display card
├── public/
│   ├── spectrograms/       # Spectrogram images (PNG)
│   └── audio/              # Audio samples (WAV/MP3)
├── PRD.md                  # Product Requirements Document
└── original-ui-reference.png # Original UI design reference
```

## Adding Audio Assets

Audio files and spectrograms are managed through the **Admin Panel**, not directly in the codebase.

### Using the Admin Panel

1. Navigate to `/admin/login`
2. Sign in with your admin credentials
3. Upload files for each combination of:
   - **Artifact Type**: distortion, reverb, or bandlimit
   - **Version Type**: original, subtractive, or generative
4. Files are automatically stored in Supabase Storage
5. The homepage will fetch and display them automatically

### Manual Upload (Alternative)

If you prefer to add files directly to Supabase:
1. Go to Storage in Supabase Dashboard
2. Upload to the appropriate bucket (`audio` or `spectrograms`)
3. Manually insert records in the database tables

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com/new)
3. Vercel will auto-detect Next.js and configure the build settings
4. Deploy!

Vercel will automatically deploy updates when you push to the main branch.

### Manual Deployment

```bash
npm run build
```

Upload the `.next` folder and `package.json` to your hosting provider.

## Features

### Public Demo
- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Interactive audio playback
- ✅ Visual spectrogram comparisons
- ✅ Three artifact type demonstrations:
  - Distortion and Clipping
  - Reverb and Room
  - Strong Bandlimited Signal
- ✅ Accessibility features (ARIA labels, keyboard navigation)
- ✅ Dynamic content loading from Supabase

### Admin Panel
- ✅ Secure authentication
- ✅ File upload interface for audio and spectrograms
- ✅ Organized by artifact type and version
- ✅ Real-time preview of uploaded content
- ✅ Automatic file management in Supabase Storage

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## License

ISC

## Repository

https://github.com/jcoustics/aic-audio-benchmarks
