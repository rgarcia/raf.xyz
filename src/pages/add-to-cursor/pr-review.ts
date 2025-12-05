import type { APIRoute } from "astro";

const GIST_RAW_URL =
  "https://gist.githubusercontent.com/rgarcia/742d8a91b051a57c51dcab8aba6d352e/raw/pr-review.md";

let cachedPrompt: string | null = null;
let cacheTime: number = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function getPrompt(): Promise<string> {
  const now = Date.now();
  if (cachedPrompt && now - cacheTime < CACHE_TTL) {
    return cachedPrompt;
  }

  const response = await fetch(GIST_RAW_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch gist: ${response.status}`);
  }

  cachedPrompt = await response.text();
  cacheTime = now;
  return cachedPrompt;
}

export const GET: APIRoute = async () => {
  try {
    const prompt = await getPrompt();
    const encodedPrompt = encodeURIComponent(prompt);
    const cursorUrl = `https://cursor.com/link/command?name=pr-review&text=${encodedPrompt}`;

    return new Response(null, {
      status: 302,
      headers: {
        Location: cursorUrl,
      },
    });
  } catch (error) {
    return new Response(`Error: ${error}`, { status: 500 });
  }
};

