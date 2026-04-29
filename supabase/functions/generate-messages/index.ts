// Neon API Route - Generate Messages with AI
// Uses OpenRouter API to generate personalized messages
// This runs as a frontend API route (not Edge Function since Neon doesn't have those)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  source: string;
  observations: string;
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  context: string;
  prompt_instructions: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY')!;

    const { lead, campaign } = await req.json();

    if (!lead || !campaign) {
      return new Response(
        JSON.stringify({ error: 'Lead e campanha são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the prompt for OpenRouter
    const prompt = buildPrompt(lead, campaign);

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://sdr-crm.app',
        'X-Title': 'SDR CRM Message Generator',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku-20240307', // Fast and cheap
        messages: [
          {
            role: 'system',
            content: `You are an expert sales copywriter for B2B outbound. You write personalized, engaging cold messages that feel human-written. You understand Brazilian Portuguese business context.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API error:', errorData);
      throw new Error('Erro ao gerar mensagens com IA');
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content || '';

    // Parse the generated messages (expecting 2-3 messages separated by ---)
    const messages = parseGeneratedMessages(generatedText);

    return new Response(
      JSON.stringify({ messages }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating messages:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildPrompt(lead: Lead, campaign: Campaign): string {
  // Replace template variables with lead data
  const context = campaign.context
    .replace(/\{\{name\}\}/g, lead.name || '')
    .replace(/\{\{company\}\}/g, lead.company || '')
    .replace(/\{\{job_title\}\}/g, lead.job_title || '')
    .replace(/\{\{email\}\}/g, lead.email || '');

  const prompt = `${campaign.prompt_instructions}

Contexto da Campanha:
${context}

Dados do Lead:
- Nome: ${lead.name}
- Empresa: ${lead.company || 'N/A'}
- Cargo: ${lead.job_title || 'N/A'}
- Email: ${lead.email || 'N/A'}
- Telefone: ${lead.phone || 'N/A'}
- Origem: ${lead.source || 'N/A'}

 gere exatamente 3 mensagens diferentes, cada uma com no máximo 150 caracteres. Separe cada mensagem com "---" na linha单独. Não inclua numeração ou títulos.`;

  return prompt;
}

function parseGeneratedMessages(text: string): { id: string; text: string }[] {
  // Split by --- separator
  const parts = text.split('---').map(s => s.trim()).filter(s => s.length > 0);

  // If no separator found, try to split by newlines or take the whole text as one message
  if (parts.length === 0) {
    return [{ id: crypto.randomUUID(), text: text.trim() }];
  }

  // Take up to 3 messages
  const messages = parts.slice(0, 3).map(part => ({
    id: crypto.randomUUID(),
    text: part.replace(/^\d+[).]\s*/, '').trim(), // Remove any numbering
  }));

  return messages;
}
