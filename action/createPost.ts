"use server";

import { Post } from "@/sanity.types";
import { adminClient } from "@/sanity/lib/adminClient";
import { getSubredditBySlug } from "@/sanity/lib/subreddit/getSubredditBySlug";
import { getUser } from "@/sanity/lib/user/getUser";
import { auth } from "@clerk/nextjs/server";
import { CoreMessage, generateText } from "ai";
import { createClerkToolkit } from "@clerk/agent-toolkit/ai-sdk";
import { openai } from "@ai-sdk/openai";
import { censorPost, reportUser } from "@/tools/tools";
import { systemPrompt } from "@/tools/prompt";

export type PostImageData = {
  base64: string;
  filename: string;
  contentType: string;
} | null;

export async function createPost({
  title,
  subredditSlug,
  body,
  imageBase64,
  imageFilename,
  imageContentType,
}: {
  title: string;
  subredditSlug: string;
  body?: string;
  imageBase64?: string | null;
  imageFilename?: string | null;
  imageContentType?: string | null;
}) {
  try {
    console.log("Starting post creation process");
    if (!title || !subredditSlug) {
      console.log("Missing required fields: title or subredditSlug");
      return { error: "Title and subreddit are required" };
    }

    console.log(
      `Creating post with title: "${title}" in subreddit: "${subredditSlug}"`
    );
    const user = await getUser();

    if ("error" in user) {
      console.log("User authentication error:", user.error);
      return { error: user.error };
    }
    console.log("User authenticated:", user._id);

    // Find the subreddit document by name
    console.log(`Looking up subreddit with slug: "${subredditSlug}"`);
    const subreddit = await getSubredditBySlug(subredditSlug);

    if (!subreddit?._id) {
      console.log(`Subreddit "${subredditSlug}" not found`);
      return { error: `Subreddit "${subredditSlug}" not found` };
    }
    console.log(`Found subreddit: ${subreddit._id}`);

    // Process image if provided
    let imageAsset = null;
    if (imageBase64 && imageFilename && imageContentType) {
      try {
        console.log("Processing image upload...");
        // Strip out the base64 prefix if it exists
        const base64WithoutPrefix = imageBase64.replace(
          /^data:image\/\w+;base64,/,
          ""
        );
        const imageBuffer = Buffer.from(base64WithoutPrefix, "base64");

        // Upload the image to Sanity
        imageAsset = await adminClient.assets.upload("image", imageBuffer, {
          filename: imageFilename,
          contentType: imageContentType,
        });

        console.log("Image uploaded successfully with ID:", imageAsset._id);
      } catch (error) {
        console.error("Failed to upload image:", error);
      }
    }

    // Create the post document with the image reference if we have one
    const postData = {
      _type: "post",
      title,
      body,
      // Add image reference if we uploaded one
      ...(imageAsset && {
        image: {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: imageAsset._id,
          },
        },
      }),
      publishedAt: new Date().toISOString(),
      author: {
        _type: "reference",
        _ref: user._id,
      },
      subreddit: {
        _type: "reference",
        _ref: subreddit._id,
      },
    };

    const post = await adminClient.create(postData);

    console.log(`Post created successfully with ID: ${post._id}`);

    // Call the content moderation API
    // ----- MOD STEP ----
    // TODO: Implement content moderation API call

    console.log("Starting content moderation process");
    const messages: CoreMessage[] = [
      {
        role: "user",
        content: `I posted this post -> Post ID: ${post._id}\nTitle: ${title}\nBody: ${body}`,
      },
    ];

    console.log("Prepared messages for moderation:", JSON.stringify(messages));

    try {
      const authContext = await auth.protect();
      const toolkit = await createClerkToolkit({ authContext });
      const result = await generateText({
        model: openai("gpt-4.1-mini"),
        messages: messages as CoreMessage[],
        // Conditionally inject session claims if we have auth context
        system: toolkit.injectSessionClaims(systemPrompt),
        tools: {
          ...toolkit.users(),
          censorPost,
          reportUser,
        },
      });

      console.log("AI moderation completed successfully", result);
    } catch (error) {
      console.error("Error in content moderation:", error);
      // Don't fail the whole post creation if moderation fails
      console.log("Continuing without content moderation");
    }

    // ----- END MOD STEP ----

    console.log("Post creation process completed successfully", post);

    return { post };
  } catch (error) {
    console.error("Error creating post:", error);
    return { error: "Failed to create post" };
  }
}
