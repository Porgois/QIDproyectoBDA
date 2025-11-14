import express from 'express';
import { SearchService } from '../services/searchService.js';

const router = express.Router();
const searchService = new SearchService();

router.post('/search', async (req, res) => {
  console.log("Search route hit.", req.body);
  try {
    const { query } = req.body;

    if (!query || query.trim() === '') {
      return res.json({
        success: true,
        results: [],
        total: 0
      });
    }

    const result = await searchService.search(query);
    res.json(result);
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      results: []
    });
  }
});

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;