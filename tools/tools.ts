import { adminClient } from "@/sanity/lib/adminClient";
import { z } from "zod";
import { tool } from "ai";

export const censorPost = tool({
  description: "Mark inappropriate content without changing the original text",
  parameters: z.object({
    postId: z.string().describe("The ID of the post to mark"),
    isInappropriate: z
      .boolean()
      .describe("Whether this post contains inappropriate content"),
    reason: z
      .string()
      .optional()
      .describe("The reason this content is flagged"),
  }),
  execute: async ({ postId, isInappropriate, reason }) => {
    console.log(
      `>>>>>> Processing post ${postId}, inappropriate: ${isInappropriate}`
    );

    if (!isInappropriate) {
      return {
        success: true,
        message: `Post ${postId} is appropriate and visible`,
      };
    }

    // Instead of censoring, just mark the post as inappropriate
    const patch = adminClient.patch(postId);
    patch.set({
      isInappropriate: true,
      moderationReason: reason || "Contains sensitive content",
      isReported: true, // Keep this for consistency
    });
    await patch.commit();

    return {
      postId,
      success: true,
      message: "Content has been marked as sensitive but preserved",
    };
  },
});

export const reportUser = tool({
  description: "Report a user for violating community guidelines",
  parameters: z.object({
    userId: z.string().describe("The ID of the user to report"),
  }),
  execute: async ({ userId }) => {
    console.log(`>>>>>> Reporting user ${userId}`);

    const patch = adminClient.patch(userId);
    patch.set({ isReported: true });
    await patch.commit();

    console.log("User reported successfully");

    return {
      success: true,
      message: `User ${userId} reported successfully`,
    };
  },
});
