"use server";

import { getPostComments } from "@/sanity/lib/vote/getPostComments";

export async function getPostCommentsAction(
  postId: string,
  userId: string | null
) {
  return await getPostComments(postId, userId);
}
