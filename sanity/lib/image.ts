import imageUrlBuilder from "@sanity/image-url";
import { client } from "./client";

// Create a pre-configured url builder
const builder = imageUrlBuilder(client);

// Export the urlFor function with better debugging
export function urlFor(source: any) {
  if (!source) {
    console.warn("No image source provided to urlFor");
    return {
      url: () => "https://placehold.co/600x400?text=No+Image",
    };
  }

  // Handle the case where source might be in different formats
  const validSource = source.asset?._ref || source.asset?.url ? source : null;

  if (!validSource || !validSource.asset) {
    console.warn("Invalid image structure:", source);
    return {
      url: () => "https://placehold.co/600x400?text=Invalid+Image+Structure",
    };
  }

  try {
    const url = builder.image(validSource);
    const urlString = url.url();
    console.log(`Generated image URL: ${urlString}`);
    return url;
  } catch (error) {
    console.error("Error generating image URL:", error);
    return {
      url: () => "https://placehold.co/600x400?text=Error+Loading+Image",
    };
  }
}
