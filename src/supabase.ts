import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hykrsqsznmrtszmfywjz.supabase.co';
const supabaseAnonKey = 'sb_publishable_OY3la3o6yh7i0Ry-mzPhoQ_wo6fa3u2XfR9G';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);