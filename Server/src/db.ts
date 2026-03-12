import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from 'path';

// Force load the .env file from the server root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || "https://gisakevgasfjnxlxmlqv.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY || "";

if (!supabaseUrl || !supabaseKey) {
    console.error("--- Environment Check ---");
    console.log("CWD:", process.cwd());
    console.log("DIR:", __dirname);
    console.log("ENV Path:", path.resolve(__dirname, '../.env'));
    console.log("Keys found:", Object.keys(process.env).filter(k => k.includes('SUPABASE')));
    throw new Error("Missing SUPABASE_URL or SUPABASE_KEY in Server environment.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
