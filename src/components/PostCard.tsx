
import React, { useState } from 'react';
import { Heart, MessageCircle, Bookmark, Share, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: number;
  content: string;
  image?: string;
  video?: string;
  user: {
    id: number;
    username: string;
    profile_picture?: string;
  };
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  is_saved: boolean;
  created_at: string;
}

interface PostCardProps {
  post: Post;
  onUpdate: (post: Post) => void;
  onDelete: (postId: number) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onUpdate, onDelete }) => {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      await api.post(`/posts/${post.id}/like/`);
      onUpdate({
        ...post,
        is_liked: !post.is_liked,
        likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      await api.post(`/posts/${post.id}/save/`);
      onUpdate({
        ...post,
        is_saved: !post.is_saved
      });
      toast({
        title: post.is_saved ? "Post Unsaved" : "Post Saved",
        description: post.is_saved ? "Removed from saved posts" : "Added to saved posts",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save post",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/posts/detail/${post.id}/`);
        onDelete(post.id);
        toast({
          title: "Post Deleted",
          description: "Your post has been deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete post",
          variant: "destructive",
        });
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by @${post.user.username}`,
          text: post.content,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Post link copied to clipboard",
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {post.user.profile_picture ? (
            <img
              src={post.user.profile_picture}
              alt={post.user.username}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {post.user.username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900">@{post.user.username}</p>
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        {user?.id === post.user.id && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    setShowMenu(false);
                    // Handle edit - you can implement edit modal here
                  }}
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  className="flex items-center space-x-2 w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                  onClick={() => {
                    setShowMenu(false);
                    handleDelete();
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Media */}
      {post.image && (
        <div className="px-4 pb-3">
          <img
            src={post.image}
            alt="Post content"
            className="w-full rounded-lg object-cover max-h-96"
          />
        </div>
      )}

      {post.video && (
        <div className="px-4 pb-3">
          <video
            src={post.video}
            controls
            className="w-full rounded-lg max-h-96"
          />
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center space-x-2 group transition-colors ${
                post.is_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart
                className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                  post.is_liked ? 'fill-current' : ''
                }`}
              />
              <span className="text-sm font-medium">{post.likes_count}</span>
            </button>

            <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 group transition-colors">
              <MessageCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="text-sm font-medium">{post.comments_count}</span>
            </button>

            <button
              onClick={handleShare}
              className="text-gray-500 hover:text-green-500 group transition-colors"
            >
              <Share className="w-5 h-5 transition-transform group-hover:scale-110" />
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`transition-colors ${
              post.is_saved ? 'text-purple-500' : 'text-gray-500 hover:text-purple-500'
            }`}
          >
            <Bookmark
              className={`w-5 h-5 transition-transform hover:scale-110 ${
                post.is_saved ? 'fill-current' : ''
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
