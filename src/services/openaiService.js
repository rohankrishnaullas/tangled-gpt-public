const AZURE_ENDPOINT = process.env.REACT_APP_AZURE_OPENAI_ENDPOINT;
const AZURE_API_KEY = process.env.REACT_APP_AZURE_OPENAI_API_KEY;
const DEPLOYMENT_NAME = process.env.REACT_APP_AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';
const API_VERSION = '2024-02-15-preview';

/**
 * Stream chat completion from Azure OpenAI
 * @param {Array} messages - Array of message objects with role and content (including system)
 * @param {function} onChunk - Callback for each streamed chunk
 * @param {AbortSignal} signal - AbortController signal for cancellation
 */
export async function streamChatCompletion(messages, onChunk, signal) {
  console.log('🔍 OpenAI Service Config:', {
    endpoint: AZURE_ENDPOINT,
    deployment: DEPLOYMENT_NAME,
    apiVersion: API_VERSION,
    hasApiKey: !!AZURE_API_KEY
  });
  
  console.log('📤 Sending messages:', messages);
  
  const url = `${AZURE_ENDPOINT}openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=${API_VERSION}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': AZURE_API_KEY
    },
    body: JSON.stringify({
      messages: messages,
      max_tokens: 2000,
      temperature: 0.8,
      stream: true
    }),
    signal
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ API Error:', response.status, errorText);
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }
  
  console.log('✅ Response OK, starting stream...');
  

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let chunkCount = 0;

  while (true) {
    const { done, value } = await reader.read();
    
    if (done) {
      console.log('📦 Stream ended. Total chunks received:', chunkCount);
      break;
    }

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        
        if (data === '[DONE]') {
          console.log('🏁 Received [DONE] signal');
          return;
        }

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          
          if (content) {
            chunkCount++;
            console.log(`📝 Chunk #${chunkCount}:`, content);
            onChunk(content);
          }
        } catch (e) {
          console.warn('⚠️ Failed to parse chunk:', data);
          // Skip invalid JSON lines
        }
      }
    }
  }
  
  console.log('✅ Stream processing complete');
}

export const openaiService = {
  /**
   * Send a chat completion request with streaming
   * @param {Array} messages - Array of message objects with role and content
   * @param {string} systemPrompt - The system prompt for personality
   * @param {function} onChunk - Callback for each streamed chunk
   * @param {function} onComplete - Callback when streaming is complete
   * @param {function} onError - Callback for errors
   */
  async streamChat(messages, systemPrompt, onChunk, onComplete, onError) {
    const url = `${AZURE_ENDPOINT}openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=${API_VERSION}`;

    const requestMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    ];

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': AZURE_API_KEY
        },
        body: JSON.stringify({
          messages: requestMessages,
          max_tokens: 2000,
          temperature: 0.8,
          stream: true
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          onComplete(fullContent);
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              onComplete(fullContent);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              
              if (content) {
                fullContent += content;
                onChunk(content, fullContent);
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }
    } catch (error) {
      console.error('OpenAI API Error:', error);
      onError(error);
    }
  },

  /**
   * Non-streaming chat completion (fallback)
   */
  async chat(messages, systemPrompt) {
    const url = `${AZURE_ENDPOINT}openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=${API_VERSION}`;

    const requestMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    ];

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_API_KEY
      },
      body: JSON.stringify({
        messages: requestMessages,
        max_tokens: 2000,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
};
