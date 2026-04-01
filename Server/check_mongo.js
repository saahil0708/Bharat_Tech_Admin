import 'dotenv/config';
import mongoose from 'mongoose';

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));
        
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`Collection ${col.name} has ${count} documents`);
            if (count > 0) {
                const sample = await db.collection(col.name).findOne();
                console.log(`Sample from ${col.name}:`, sample);
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

check();
