import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardClient from '@/components/admin/DashboardClient';

export default async function AdminDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Fetch existing audio samples and spectrograms
  const { data: audioSamples } = await supabase
    .from('audio_samples')
    .select('*')
    .order('artifact_type', { ascending: true })
    .order('version_type', { ascending: true });

  const { data: spectrograms } = await supabase
    .from('spectrograms')
    .select('*')
    .order('artifact_type', { ascending: true })
    .order('version_type', { ascending: true });

  return (
    <DashboardClient
      user={user}
      initialAudioSamples={audioSamples || []}
      initialSpectrograms={spectrograms || []}
    />
  );
}
