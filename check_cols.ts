import { supabase } from './src/lib/supabaseClient';

async function check() {
    const { data, error } = await supabase.from('mentors').select('*').limit(1);
    if (error) {
        console.error("Error:", error.message);
    } else {
        if (data && data.length > 0) {
            console.log("Columns:", Object.keys(data[0]));
        } else {
            console.log("No data, but table exists.");
            // Try to insert a dummy to see failure/columns
            const { error: insError } = await supabase.from('mentors').insert([{name: 'test'}]).select();
            if (insError) console.error("Insert error:", insError.message);
        }
    }
}
check();
