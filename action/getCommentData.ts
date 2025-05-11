"use server";

import { getCommentReplies } from "@/sanity/lib/comment/getCommentReplies";

export async function getCommentRepliesAction(
  commentId: string,
  userId: string | null
) {
  return await getCommentReplies(commentId, userId);
}
