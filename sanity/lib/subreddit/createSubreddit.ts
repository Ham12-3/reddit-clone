import { ImageData } from "@/action/createCommunity";
import { defineQuery } from "groq";
import { sanityFetch } from "../live";
import { adminClient } from "../adminClient";
import { Subreddit } from "@/sanity.types";

// Helper function to generate slug
function generateSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .slice(0, 50);
}

// Define the type for the Sanity document
interface SubredditData {
  _type: string;
  title: string;
  slug: {
    _type: string;
    current: string;
  };
  description?: string;
  moderator: {
    _type: string;
    _ref: string;
  };
  createdAt: string;
  image?: {
    _type: string;
    asset: {
      _type: string;
      _ref: string;
    };
  };
}

export async function createSubreddit(
  name: string,
  userId: string,
  imageData: ImageData,
  slug?: string,
  description?: string
) {
  try {
    console.log("Creating subreddit with imageData:", imageData);

    // First, upload the image separately if provided
    let imageAssetId = null;
    if (imageData && imageData.base64) {
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64Data = imageData.base64.split(",")[1] || imageData.base64;

      try {
        const imageAsset = await adminClient.assets.upload(
          "image",
          Buffer.from(base64Data, "base64"),
          {
            filename: imageData.filename,
            contentType: imageData.contentType,
          }
        );

        console.log("Image uploaded successfully:", imageAsset._id);
        imageAssetId = imageAsset._id;
      } catch (imageError) {
        console.error("Failed to upload image:", imageError);
      }
    }

    // Then create the subreddit document with all properties included
    const subredditData: SubredditData = {
      _type: "subreddit",
      title: name,
      slug: {
        _type: "slug",
        current: slug || generateSlug(name),
      },
      description,
      moderator: {
        _type: "reference",
        _ref: userId,
      },
      createdAt: new Date().toISOString(),
      // Conditionally include the image
      ...(imageAssetId && {
        image: {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: imageAssetId,
          },
        },
      }),
    };

    const subreddit = await adminClient.create(subredditData);
    console.log("Created subreddit:", subreddit);

    return { subreddit };
  } catch (error) {
    console.error("Error in createSubreddit:", error);
    return { error: "Failed to create subreddit" };
  }
}
