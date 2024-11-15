import { createClient } from 'redis';

const client = createClient({
    url: process.env.REDIS_URL,
});

client.on('error', (err) => console.error('Redis Client Error', err));

async function connectClient() {
    if (!client.isOpen) await client.connect();
    return client;
}

export default connectClient;