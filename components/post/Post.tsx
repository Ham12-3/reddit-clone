"use client";

import { useState, useEffect } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { MessageSquare } from "lucide-react";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

import { getPostData } from "@/action/getPostData";
import { getPostCommentsAction } from "@/action/getPostCommentsAction";

import {
  GetAllPostsQueryResult,
  GetPostCommentsQueryResult,
  GetPostsForSubredditQueryResult,
} from "@/sanity.types";

import CommentList from "../comment/CommentList";

import TimeAgo from "../TimeAgo";
import CommentInput from "../comment/CommentInput";
import PostVoteButtons from "./PostVoteButtons";
import ReportButton from "../ReportButton";
import DeleteButton from "../DeleteButton";

interface PostProps {
  post:
    | GetAllPostsQueryResult[number]
    | GetPostsForSubredditQueryResult[number];
  userId: string | null;
}

// Add this interface to extend the post type temporarily
interface PostWithModeration {
  isInappropriate?: boolean;
  moderationReason?: string;
}

function Post({ post, userId }: PostProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [postData, setPostData] = useState<{
    votes: any;
    vote: any;
    comments: any[];
  }>({
    votes: { upvotes: 0, downvotes: 0 },
    vote: null,
    comments: [],
  });
  // Add type annotation here
  const [comments, setComments] = useState<GetPostCommentsQueryResult>([]);

  // Use type assertion for moderation properties
  const postWithModeration = post as unknown as typeof post &
    PostWithModeration;
  const isInappropriate = postWithModeration.isInappropriate;

  // Add this at the beginning of your component:
  useEffect(() => {
    // Debug the post data
    console.log(`Post ${post._id} complete data:`, post);
    console.log(`Post ${post._id} image data:`, post.image);
  }, [post]);

  // Fetch post data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      const data = await getPostData(post._id, userId);
      setPostData(data);
    };

    fetchData();
  }, [post._id, userId]);

  useEffect(() => {
    async function fetchComments() {
      const data = await getPostCommentsAction(post._id, userId);
      setComments(data);
    }

    fetchComments();
  }, [post._id, userId]);

  // Add near the top of your render function:
  console.log(`Post ${post._id} image data:`, post.image);

  return (
    <article
      key={post._id}
      className={`relative bg-white rounded-md shadow-sm border border-gray-200 hover:border-gray-300 transition-colors ${isInappropriate ? "border border-red-300" : ""}`}
    >
      <div className="flex">
        {/* Vote Buttons */}
        <PostVoteButtons
          contentId={post._id}
          votes={postData.votes}
          vote={postData.vote}
          contentType="post"
        />

        {/* Post Content */}
        <div className="flex-1 p-3">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            {post.subreddit && (
              <>
                <a
                  href={`/community/${post.subreddit.slug}`}
                  className="font-medium hover:underline"
                >
                  c/{post.subreddit.title}
                </a>
                <span>•</span>
                <span>Posted by</span>
                {post.author && (
                  <a
                    href={`/u/${post.author.username}`}
                    className="hover:underline"
                  >
                    u/{post.author.username}
                  </a>
                )}
                <span>•</span>
                {post.publishedAt && (
                  <TimeAgo date={new Date(post.publishedAt)} />
                )}
              </>
            )}
          </div>

          {post.subreddit && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                {post.title}
              </h2>
            </div>
          )}

          {post.body && post.body[0]?.children?.[0]?.text && (
            <div className="prose prose-sm max-w-none text-gray-700 mb-3">
              {post.body[0].children[0].text}
            </div>
          )}

          {/* Update the image check to work with expanded assets */}
          {post.image && (
            <div className="relative w-full h-64 mb-3">
              <Image
                src={urlFor(post.image).url()}
                alt={post.image.alt || "Post image"}
                fill
                className="object-contain rounded-md"
                unoptimized
              />
            </div>
          )}

          <button className="flex items-center px-1 py-2 gap-1 text-sm text-gray-500">
            <MessageSquare className="w-4 h-4" />
            <span>{postData.comments.length} Comments</span>
          </button>

          <CommentInput postId={post._id} />
          <CommentList
            postId={post._id}
            comments={postData.comments}
            userId={userId}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="absolute top-2 right-2">
        <div className="flex items-center gap-2">
          <ReportButton contentId={post._id} />

          {post.author?._id && (
            <DeleteButton
              contentOwnerId={post.author?._id}
              contentId={post._id}
              contentType="post"
            />
          )}
        </div>
      </div>

      {/* Content section with conditional blur */}
      <div className="relative">
        {isInappropriate && !isRevealed && (
          <div className="absolute inset-0 backdrop-blur-md flex flex-col items-center justify-center z-10">
            <div className="bg-red-50 rounded-md p-3 text-center mb-2">
              <p className="text-red-500 font-medium">Sensitive Content</p>
              <p className="text-sm text-gray-600">
                {postWithModeration.moderationReason ||
                  "This post may contain inappropriate content"}
              </p>
            </div>
            <button
              onClick={() => setIsRevealed(true)}
              className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-50"
            >
              <EyeIcon className="h-4 w-4" />
              <span>Reveal Content</span>
            </button>
          </div>
        )}

        {isInappropriate && isRevealed && (
          <button
            onClick={() => setIsRevealed(false)}
            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
          >
            <EyeOffIcon className="h-4 w-4" />
          </button>
        )}

        {/* Post title and body */}
        <div
          className={`p-4 ${isInappropriate && !isRevealed ? "blur-md" : ""}`}
        >
          <h2 className="text-xl font-bold">{post.title}</h2>
          <div className="mt-2">{/* Post body rendering */}</div>

          {/* Post image with conditional blur */}
        </div>
      </div>

      {/* Actions and comments section */}
    </article>
  );
}

export default Post;
