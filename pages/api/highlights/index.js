import connectClient from '../lib/redis';

export default async function handler(req, res) {
    try {
        const client = await connectClient();

        if (req.method === 'GET') {
            const highlights = await client.get('highlights');
            res.status(200).json(highlights ? JSON.parse(highlights) : []);
        } else if (req.method === 'POST') {
            const { text } = req.body;
            const highlights = JSON.parse(await client.get('highlights')) || [];
            const newHighlight = { id: Date.now(), text };
            highlights.push(newHighlight);
            await client.set('highlights', JSON.stringify(highlights));
            res.status(201).json(newHighlight);
        } else {
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error("API Error in /api/highlights:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}