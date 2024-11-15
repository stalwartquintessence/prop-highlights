import connectClient from '../lib/redis';

export default async function handler(req, res) {
    try {
        const client = await connectClient();

        if (req.method === 'PUT') {
            const { highlights } = req.body;
            await client.set('highlights', JSON.stringify(highlights));
            res.status(200).json({ message: 'Highlights reordered successfully' });
        } else {
            res.setHeader('Allow', ['PUT']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error("API Error in /api/highlights/reorder:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}