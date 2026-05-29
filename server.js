const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// Helper function to validate analysis response structure
function validateAnalysisResponse(data) {
  const requiredFields = ['nome_estudo', 'codigo', 'data', 'scores', 'analise', 'tercos', 'recomendacoes', 'assinatura'];
  const missingFields = requiredFields.filter(field => !(field in data));
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
  
  if (!data.scores.atratividade || !data.scores.harmonia) {
    throw new Error('Invalid scores structure');
  }
  
  return true;
}

// API endpoint para análise facial
app.post('/api/analyze', async (req, res) => {
  try {
    const { imageBase64, mime } = req.body;

    if (!imageBase64 || !mime) {
      return res.status(400).json({ error: 'Image data missing' });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const SYSTEM = `Você é uma IA especializada em análise estética facial premium. Ao receber uma imagem, analise a face e retorne SOMENTE um JSON válido com a estrutura abaixo. Sem texto adicional.

{
  "nome_estudo": "FACIAL AESTHETIC STUDY",
  "codigo": "string 8 chars alfanumérico",
  "data": "data formatada dd/mm/aaaa",
  "scores": {
    "atratividade": number 0-10 uma casa decimal,
    "harmonia": integer 0-100,
    "simetria": integer 0-100,
    "fotogenico": integer 0-100,
    "classificacao": "Alta Harmonia Facial"
  },
  "analise": {
    "olhos":       { "nota": number 1-10, "descricao": "frase técnica e sofisticada" },
    "sobrancelhas":{ "nota": number 1-10, "descricao": "frase técnica" },
    "nariz":       { "nota": number 1-10, "descricao": "frase técnica" },
    "labios":      { "nota": number 1-10, "descricao": "frase técnica" },
    "mandibula":   { "nota": number 1-10, "descricao": "frase técnica" },
    "macacas":     { "nota": number 1-10, "descricao": "frase técnica" },
    "pele":        { "nota": number 1-10, "descricao": "frase técnica" },
    "proporcoes":  { "nota": number 1-10, "descricao": "frase técnica" }
  },
  "tercos": {
    "superior": { "equilibrio": integer 0-100, "descricao": "string curta" },
    "medio":    { "equilibrio": integer 0-100, "descricao": "string curta" },
    "inferior": { "equilibrio": integer 0-100, "descricao": "string curta" }
  },
  "recomendacoes": [
    { "titulo": "string", "descricao": "frase elegante 1-2 linhas" }
  ],
  "assinatura": "frase poética curta e elegante"
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: SYSTEM,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mime,
                  data: imageBase64
                }
              },
              {
                type: 'text',
                text: 'Analise esta face e retorne o JSON premium.'
              }
            ]
          }
        ]
      })
    });

    const jsonResponse = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', jsonResponse);
      return res.status(response.status).json({
        error: 'Failed to analyze image',
        details: jsonResponse.error || jsonResponse
      });
    }

    // Validate response has content
    if (!jsonResponse.content || !Array.isArray(jsonResponse.content) || jsonResponse.content.length === 0) {
      console.error('Empty response from Anthropic API:', jsonResponse);
      return res.status(500).json({
        error: 'Empty response from analysis API',
        details: 'No content returned'
      });
    }

    // Extract JSON from response
    const textContent = (jsonResponse.content || [])
      .filter(c => c.type === 'text')
      .map(c => c.text)
      .join('')
      .replace(/```json\n?|```\n?/g, '') // Better regex handling
      .trim();

    if (!textContent) {
      console.error('No text content in API response:', jsonResponse);
      return res.status(500).json({
        error: 'No analysis text in response',
        details: 'Failed to extract text content'
      });
    }

    // Parse and validate JSON
    let analysisData;
    try {
      analysisData = JSON.parse(textContent);
    } catch (parseError) {
      console.error('JSON Parse error:', parseError.message);
      console.error('Raw content:', textContent.substring(0, 500)); // Log first 500 chars
      return res.status(500).json({
        error: 'Invalid JSON response from analysis API',
        details: parseError.message,
        hint: 'The AI response could not be parsed as valid JSON'
      });
    }

    // Validate analysis data structure
    try {
      validateAnalysisResponse(analysisData);
    } catch (validationError) {
      console.error('Validation error:', validationError.message);
      return res.status(500).json({
        error: 'Invalid analysis response structure',
        details: validationError.message
      });
    }

    res.json(analysisData);

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
