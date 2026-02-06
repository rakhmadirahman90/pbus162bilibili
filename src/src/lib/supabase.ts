import { createClient } from '@supabase/supabase-js';

// Ganti URL ini dengan 'Project URL' dari menu Settings > API di Supabase
const supabaseUrl = 'https://hykrsqsznmrtszhfywjz.supabase.co'; 

// Ganti ini dengan 'Anon Key' (Publishable key) dari gambar image_66c261.png
const supabaseAnonKey = 'sb_publishable_OY3la3o6yh7i0Ry-mzPhoQ_wo6faP2X'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);