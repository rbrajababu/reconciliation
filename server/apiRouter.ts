import express, { Request, Response } from 'express';
import {
  explainException,
  processNaturalLanguageSearch,
  askTaxKnowledge,
  generateAiReconciliationReport,
  chatWithReconciliationAi,
} from './gemini';

export const apiRouter = express.Router();

apiRouter.use(express.json({ limit: '10mb' }));

apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'Reconciliation With RB',
    version: '1.0.0',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

apiRouter.post('/ai/explain', async (req: Request, res: Response) => {
  try {
    const { type, record, enableThinking } = req.body;
    if (!record) {
      return res.status(400).json({ error: 'Record is required' });
    }
    const result = await explainException({ type: type || 'GST', record, enableThinking });
    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/ai/explain:', error);
    res.status(500).json({ error: error.message || 'Failed to explain exception' });
  }
});

apiRouter.post('/ai/query', async (req: Request, res: Response) => {
  try {
    const { query, enableThinking } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query string is required' });
    }
    const result = await processNaturalLanguageSearch(query, enableThinking);
    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/ai/query:', error);
    res.status(500).json({ error: error.message || 'Failed to parse natural language query' });
  }
});

apiRouter.post('/ai/knowledge', async (req: Request, res: Response) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    const result = await askTaxKnowledge(question);
    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/ai/knowledge:', error);
    res.status(500).json({ error: error.message || 'Failed to answer tax query' });
  }
});

apiRouter.post('/ai/report', async (req: Request, res: Response) => {
  try {
    const { summaryData } = req.body;
    const result = await generateAiReconciliationReport(summaryData || {});
    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/ai/report:', error);
    res.status(500).json({ error: error.message || 'Failed to generate report' });
  }
});

apiRouter.post('/ai/clean', async (req: Request, res: Response) => {
  try {
    const { rawVendors, rawInvoices } = req.body;
    // Suggest cleaning without overwriting source
    const suggestions: any[] = [];
    if (Array.isArray(rawVendors)) {
      rawVendors.slice(0, 10).forEach((v: string) => {
        const cleaned = v
          .replace(/\s+(Pvt\.?|Private)\s+(Ltd\.?|Limited)/gi, ' Pvt Ltd')
          .replace(/\s+/g, ' ')
          .trim();
        if (cleaned !== v) {
          suggestions.push({
            type: 'Vendor Name Standardization',
            original: v,
            suggested: cleaned,
            confidence: 0.95,
          });
        }
      });
    }
    res.json({ suggestions });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to clean data' });
  }
});

apiRouter.post('/ai/chat', async (req: Request, res: Response) => {
  try {
    const { messages, model, rolePreset, reconciliationContext } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required for multi-turn chat' });
    }
    const result = await chatWithReconciliationAi({
      messages,
      model,
      rolePreset,
      reconciliationContext,
    });
    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/ai/chat:', error);
    res.status(500).json({ error: error.message || 'Failed to process chat with Reconciliation AI' });
  }
});
