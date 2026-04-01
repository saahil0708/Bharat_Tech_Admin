import 'dotenv/config';
import mongoose from 'mongoose';
import { createClient } from '@supabase/supabase-js';

// Configuration
const MONGO_URI = process.env.MONGO_URI;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const COLLECTION_NAME = 'teams'; // MongoDB Collection
const TABLE_NAME = 'teams';      // Supabase Table

// Initialize Supabase Client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function syncData() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        const db = mongoose.connection.db;
        
        console.log(`📡 Fetching documents from MongoDB collection: ${COLLECTION_NAME}`);
        const documents = await db.collection(COLLECTION_NAME).find({}).toArray();
        if (documents.length === 0) {
            console.log('⚠️ No documents found in MongoDB to sync.');
            return;
        }
        
        console.log(`✅ Found ${documents.length} documents. Preparing to sync to Supabase...`);

        // Transform MongoDB documents before pushing to Supabase
        const transformedData = documents.map(doc => {
            // Remove MongoDB's unique _id field so Supabase can autogenerate its own integer/uuid ID
            const { _id, ...rest } = doc;
            
            // Map any other specific fields if the schemas differ
            // Example: if MongoDB has `leaderPhone` but Supabase has `leader_phone`
            // return { ...rest, leader_phone: rest.leaderPhone };
            
            return rest;
        });

        console.log(`🚀 Upserting data into Supabase table: ${TABLE_NAME}`);
        // Insert data into Supabase
        // Upsert behavior: If rows with existing primary keys/unique constraints exist, it updates them.
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .upsert(transformedData, { onConflict: 'team_code' }); // Make sure 'team_code' or your unique field is correct here!
            
        if (error) {
            console.error('❌ Supabase Sync Error:', error.message);
            throw error;
        }

        console.log(`🎉 Successfully synced ${documents.length} records to Supabase!`);

    } catch (e) {
        console.error('❌ Sync Failed:', e);
    } finally {
        console.log('🔌 Disconnecting from MongoDB...');
        await mongoose.disconnect();
        process.exit(0);
    }
}

syncData();
