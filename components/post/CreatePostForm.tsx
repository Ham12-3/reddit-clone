"use client";

import * as React from "react";
import { ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { createPost } from "@/action/createPost";

function CreatePostForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const subreddit = searchParams.get("subreddit");

  if (!subreddit) {
    return (
      <div className="text-center p-4">
        <p>Please select a community first</p>
      </div>
    );
  }

  const handleCreatePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMessage("Post title is required");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      let imageData = null;
      if (imageFile) {
        const base64 = await convertFileToBase64(imageFile);
        imageData = {
          base64,
          filename: imageFile.name,
          contentType: imageFile.type,
        };
      }

      const result = await createPost({
        title: title.trim(),
        subredditSlug: subreddit,
        body: body.trim() || undefined,
        imageBase64: imageData?.base64 || null,
        imageFilename: imageData?.filename || null,
        imageContentType: imageData?.contentType || null,
      });

      resetForm();
      console.log("Finished creating post", result);

      if ("error" in result && result.error) {
        setErrorMessage(result.error);
      } else {
        const normalizedSlug = subreddit.toLowerCase().replace(/\s+/g, "-");
        router.push(`/community/${normalizedSlug}`);
      }
    } catch (err) {
      console.error("Failed to create post", err);
      setErrorMessage("Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setBody("");
    setErrorMessage("");
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4">
      <form onSubmit={handleCreatePost} className="space-y-4 mt-2">
        {errorMessage && (
          <div className="text-red-500 text-sm">{errorMessage}</div>
        )}

        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Title
          </label>
          <Input
            id="title"
            name="title"
            placeholder="Title of your post"
            className="w-full focus:ring-2 focus:ring-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={300}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="body" className="text-sm font-medium">
            Body (optional)
          </label>
          <Textarea
            id="body"
            name="body"
            placeholder="Text (optional)"
            className="w-full focus:ring-2 focus:ring-blue-500"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Image (optional)</label>

          {imagePreview ? (
            <div className="relative w-full h-64 mx-auto">
              <Image
                src={imagePreview}
                alt="Post preview"
                fill
                className="object-contain"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="post-image"
                className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center">
                  <ImageIcon className="w-6 h-6 mb-2 text-gray-400" />
                  <p className="text-xs text-gray-500">
                    Click to upload an image
                  </p>
                </div>
                <input
                  id="post-image"
                  name="post-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Post"}
        </Button>
      </form>
    </div>
  );
}

const convertFileToBase64 = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default CreatePostForm;
