import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hykrsqsznmrtszhfywjz.supabase.co';
const supabaseAnonKey = 'sb_publishable_OY3la3o6yh7i0Ry-mzPhoQ_wo6faP2X';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);