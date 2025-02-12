// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { ChatOpenAI } from "npm:@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage } from "npm:@langchain/core/messages";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const requestSchema = z.object({
  language: z.string(),
  messages: z.array(z.object({
    text: z.string(),
    isUser: z.boolean(),
  })),
  subtitleContext: z.string().optional(),
  videoTitle: z.string().optional(),
  videoDescription: z.string().optional(),
});

const createSystemPrompt = (language: string) => `
You are a supportive ${language} tutor who helps learners through natural immersion. Your goal is to help learners understand and enjoy their immersion experience without breaking the flow of learning.

You will be provided with subtitles from a video that may contain dialogue from multiple speakers. Note that speaker identification is not available, so you'll need to infer context from the content itself.

When learners ask questions:
- Give brief, clear explanations that focus on meaning and usage
- Use simple examples to illustrate points
- Avoid lengthy grammar explanations unless specifically requested
- Encourage pattern recognition over memorizing rules
- If applicable and appropriate, point out common expressions they can listen for in the future

Remember that most language acquisition happens naturally through exposure and repetition. Your role is to provide just enough support to keep learners engaged and comprehending, while letting them discover the language through immersion.
`;

const langMap: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
};

Deno.serve(async (req) => {
  try {
    const { language, messages, subtitleContext, videoTitle, videoDescription } = requestSchema.parse(await req.json());

    const chat = new ChatOpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
      modelName: 'gpt-4o', // DO NOT CHANGE THIS
      temperature: 0.8,
    });

    // Convert message history to LangChain format
    const messageHistory = [
      new SystemMessage(createSystemPrompt(langMap[language] ?? 'unknown')),
    ];

    // Add video context if available
    if (videoTitle || videoDescription) {
      messageHistory.push(
        new SystemMessage(
          `Video Context:\n<video>${
            videoTitle ? `\nTitle: ${videoTitle}` : ''
          }${
            videoDescription ? `\nDescription: ${videoDescription}` : ''
          }\n</video>`
        )
      );
    }

    // Add context from subtitles if available
    if (subtitleContext) {
      messageHistory.push(
        new SystemMessage(`Latest Subtitles:\n<subtitles>\n${subtitleContext}\n</subtitles>`)
      );
    }

    // Add message history
    messageHistory.push(
      ...messages.map((msg) =>
        msg.isUser
          ? new HumanMessage(msg.text)
          : new AIMessage(msg.text)
      )
    );

    // Get AI response
    const response = await chat.invoke(messageHistory);

    return new Response(
      JSON.stringify({ response: response.content }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        } 
      }
    );
  } catch (error) {
    console.error('Error in AI tutor:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred while processing your request' }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        } 
      }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/ai-tutor' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
