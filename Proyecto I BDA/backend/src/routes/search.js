import express from 'express';
import { SearchService } from '../services/searchService.js';

const router = express.Router();
const searchService = new SearchService();

router.post('/search', async (req, res) => {
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

router.get('/stats', async (req, res) => {
  try {
    const stats = await searchService.getStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

export default router;