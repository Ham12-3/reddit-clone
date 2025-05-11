import { sanityFetch } from "../live";
import { defineQuery } from "groq";

export async function getPosts() {
  const getAllPostsQuery =
    defineQuery(`*[_type == "post" && isDeleted != true] {
    _id,
    title,
    "slug": slug.current,
    body,
    publishedAt,
    "author": author->,
    "subreddit": subreddit->,
    image {
      _type,
      asset->{
        _id,
        url
      },
      alt
    },
    isDeleted,
    isInappropriate,
    moderationReason
  } | order(publishedAt desc)`);

  const posts = await sanityFetch({ query: getAllPostsQuery });
  return posts.data;
}
