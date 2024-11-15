import connectClient from '../lib/redis';

export default async function handler(req, res) {
    const { id } = req.query;

    try {
        const client = await connectClient();
        const highlights = JSON.parse(await client.get('highlights')) || [];

        if (req.method === 'PUT') {
            const { text } = req.body;
            const highlight = highlights.find((item) => item.id === parseInt(id));

            if (highlight) {
                highlight.text = text;
                await client.set('highlights', JSON.stringify(highlights));
                res.status(200).json(highlight);
            } else {
                res.status(404).json({ message: 'Highlight not found' });
            }
        } else if (req.method === 'DELETE') {
            const updatedHighlights = highlights.filter((item) => item.id !== parseInt(id));
            await client.set('highlights', JSON.stringify(updatedHighlights));
            res.status(204).end();
        } else {
            res.setHeader('Allow', ['PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error("API Error in /api/highlights/[id]:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}