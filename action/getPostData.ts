"use server";

import { getPostVotes } from "@/sanity/lib/vote/getPostVotes";
import { getUserPostVoteStatus } from "@/sanity/lib/vote/getUserPostVoteStatus";
import { getPostComments } from "@/sanity/lib/vote/getPostComments";

export async function getPostData(postId: string, userId: string | null) {
  const votes = await getPostVotes(postId);
  const vote = userId ? await getUserPostVoteStatus(postId, userId) : null;
  const comments = await getPostComments(postId, userId);

  return {
    votes,
    vote,
    comments,
  };
}
