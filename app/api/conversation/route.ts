import { OpenAI } from 'openai';
import { auth } from "@clerk/nextjs";
import { NextResponse } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
      const { userId } = auth();

      if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
      }

      if (!openai.apiKey) {
        return new NextResponse("OpenAI API Key not configured", { status: 500 });
      }

      // Extract the `prompt` from the body of the request
      const { prompt } = await req.json();
      console.log(prompt);

      if (!prompt) {
        return new NextResponse("A prompt is required", { status: 400 });
      }
     
      // Ask OpenAI for a streaming completion given the prompt
      const completion = await openai.chat.completions.create({
        messages: [
          {"role": "system", "content": "Você é especialista em apresentar um resumo bem elaborada sobre temas que lhe são pedidos e nada além disso."},
          {"role": "user", "content": `${prompt}`}
        ],
        model: "gpt-3.5-turbo",
        });

      return NextResponse.json(completion.choices[0]);
    } catch (error) {
      console.log(error);
      return new NextResponse("Internal error", { status: 500 })
    }
  }