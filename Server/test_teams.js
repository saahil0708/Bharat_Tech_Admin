import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
(async () => {
    const { data, error } = await supabase.from('teams').select('*').limit(1);
    console.log(JSON.stringify(data[0], null, 2));
    process.exit(0);
})();
