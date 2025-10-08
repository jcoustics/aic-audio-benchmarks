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

  // Fetch page settings, examples, audio samples, and spectrograms
  const { data: pageSettings } = await supabase
    .from('page_settings')
    .select('*')
    .limit(1)
    .single();

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
      pageSettings={pageSettings || null}
      examples={examples || []}
      audioSamples={audioSamples || []}
      spectrograms={spectrograms || []}
    />
  );
}
