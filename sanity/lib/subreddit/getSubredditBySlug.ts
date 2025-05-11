import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";

export async function getSubredditBySlug(slug: string) {
  // First try with the slug as-is
  const query = groq`*[_type == "subreddit" && slug.current == $slug][0] {
    ...,
    "slug": slug.current,
    "moderator": moderator->,
    image {
      _type,
      asset->{
        _id,
        url
      }
    }
  }`;

  const result = await client.fetch(query, { slug });

  console.log("Fetched subreddit by slug:", slug, result);

  if (result) {
    return result;
  }

  // If not found, try normalizing the slug
  const normalizedSlug = slug.toLowerCase().replace(/\s+/g, "-");
  console.log(`Trying with normalized slug: "${normalizedSlug}"`);

  return client.fetch(query, { slug: normalizedSlug });
}
