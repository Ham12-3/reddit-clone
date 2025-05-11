import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";

export async function getSubredditBySlug(slug: string) {
  // First try with the slug as-is
  const query = groq`*[_type == "subreddit" && slug.current == $slug][0]`;
  const result = await client.fetch(query, { slug });

  if (result) return result;

  // If not found, try normalizing the slug (convert spaces to hyphens, lowercase)
  const normalizedSlug = slug.toLowerCase().replace(/\s+/g, "-");
  console.log(`Trying with normalized slug: "${normalizedSlug}"`);

  return client.fetch(query, { slug: normalizedSlug });
}
