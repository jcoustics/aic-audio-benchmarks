import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardClient from '@/components/admin/DashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Fetch examples, audio samples, and spectrograms
  const { data: examples } = await supabase
    .from('examples')
    .select('*')
    .order('display_order', { ascending: true });

  const { data: audioSamples } = await supabase
    .from('audio_samples')
    .select('*');

  const { data: spectrograms } = await supabase
    .from('spectrograms')
    .select('*');

  return (
    <DashboardClient
      user={user}
      examples={examples || []}
      audioSamples={audioSamples || []}
      spectrograms={spectrograms || []}
    />
  );
}
