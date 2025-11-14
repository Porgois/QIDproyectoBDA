import express from 'express';
import { SearchService } from '../services/searchService.js';

const router = express.Router();
const searchService = new SearchService();

// MOCK DATA
const exampleData = [
  { id: 1, title: 'React Official Documentation', url: 'https://reactjs.org/', description: 'A site with all the documentation you could need.' },
  { id: 2, title: 'Mozilla Developer Network (MDN)', url: 'https://developer.mozilla.org/', description: 'A network for Mozilla developers.' },
  { id: 3, title: 'Stack Overflow', url: 'https://stackoverflow.com/', description: 'Ask anything you need.' },
  { id: 4, title: 'GitHub', url: 'https://github.com/', description: 'Connect with githubbies.' },
  { id: 5, title: 'npm', url: 'https://www.npmjs.com/', description: 'npm explained.' },
  { id: 6, title: 'Stack Overflow', url: 'https://stackoverflow.com/', description: 'Ask anything you need.' },
  { id: 7, title: 'Stack Overflow', url: 'https://stackoverflow.com/', description: 'Ask anything you need.' },
  { id: 8, title: 'Stack Overflow', url: 'https://stackoverflow.com/', description: 'Ask anything you need.' },
  { id: 9, title: 'Stack Overflow', url: 'https://stackoverflow.com/', description: 'Ask anything you need.' },
  { id: 10, title: 'Stack Overflow', url: 'https://stackoverflow.com/', description: 'Ask anything you need.' },
  { id: 11, title: 'Stack Overflow', url: 'https://stackoverflow.com/', description: 'Ask anything you need.' },
  { id: 12, title: 'Stack Overflow', url: 'https://stackoverflow.com/', description: 'Ask anything you need.' },
  { id: 13, title: 'Stack Overflow', url: 'https://stackoverflow.com/', description: 'Ask anything you need.' },
  { id: 14, title: 'Stack Overflow', url: 'https://stackoverflow.com/', description: 'Ask anything you need.' },
  { id: 15, title: 'Stack Overflow', url: 'https://stackoverflow.com/', description: 'Ask anything you need.' },
  { id: 16, title: 'Stack Overflow', url: 'https://stackoverflow.com/', description: 'Ask anything you need.' },
  { id: 17, title: 'Stack Overflow', url: 'https://stackoverflow.com/', description: 'Ask anything you need.' },
  { id: 18, title: 'Stack Overflow', url: 'https://stackoverflow.com/', description: 'Ask anything you need.' },
  { id: 19, title: 'Stack Overflow', url: 'https://stackoverflow.com/', description: 'Ask anything you need.' },
  { id: 20, title: 'Stack Overflow', url: 'https://stackoverflow.com/', description: 'Ask anything you need.' },
  { id: 21, title: 'Stack Overflow', url: 'https://stackoverflow.com/', description: 'Ask anything you need.' },
  { id: 22, title: 'Stack Overflow', url: 'https://stackoverflow.com/', description: 'Ask anything you need.' }
];


router.post('/search', async (req, res) => {
  console.log("Mock search route hit.");

  try {
    const { query } = req.body;

    if (!query || query.trim() === '') {
      return res.json({
        success: true,
        results: [],
        total: 0
      });
    }

    // Simular una búsqueda real (filter básico)
    const normalized = query.toLowerCase();

    const filtered = exampleData.filter(item =>
      item.title.toLowerCase().includes(normalized) ||
      item.description.toLowerCase().includes(normalized) ||
      item.url.toLowerCase().includes(normalized)
    );

    // Formato estándar de tu API
    const results = filtered.map(r => ({
      id: r.id,
      title: r.title,
      url: r.url,
      description: r.description,
      score: Math.random(),             // mock scoring
      sources: ["mock-node-1", "mock-node-2"]
    }));

    return res.json({
      success: true,
      results,
      total: results.length
    });

  } catch (error) {
    console.error('Mock search error:', error);

    return res.status(500).json({
      success: false,
      error: 'Mock backend failure',
      results: []
    });
  }
});

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;