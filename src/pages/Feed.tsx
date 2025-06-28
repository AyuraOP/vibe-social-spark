
import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { api } from '../utils/api';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import { Plus, TrendingUp, Clock, ThumbsUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'latest' | 'liked' | 'trending'>('latest');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { ref, inView } = useInView({
    threshold: 0,
  });

  const fetchPosts = async (pageNum: number = 1, sort: string = 'latest', search: string = '') => {
    try {
      const params = new URLSearchParams();
      if (sort !== 'latest') params.append('sort', sort);
      if (search) params.append('search', search);
      if (pageNum > 1) params.append('page', pageNum.toString());

      const response = await api.get(`/posts/?${params.toString()}`);
      
      if (pageNum === 1) {
        setPosts(response.data.results || response.data);
      } else {
        setPosts(prev => [...prev, ...(response.data.results || response.data)]);
      }
      
      setHasMore(response.data.next ? true : false);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchPosts(1, sortBy, searchQuery);
  }, [sortBy, searchQuery]);

  useEffect(() => {
    if (inView && hasMore && !loading && page > 1) {
      fetchPosts(page, sortBy, searchQuery);
    }
  }, [inView, hasMore, loading, page, sortBy, searchQuery]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  }, [inView, hasMore, loading]);

  const handlePostCreated = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev]);
    setShowCreateModal(false);
  };

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts(prev => prev.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  };

  const handlePostDelete = (postId: number) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  const sortOptions = [
    { value: 'latest', label: 'Latest', icon: Clock },
    { value: 'liked', label: 'Most Liked', icon: ThumbsUp },
    { value: 'trending', label: 'Trending', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Your Feed</h1>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Create Post</span>
            </button>
          </div>

          {/* Search and Sort */}
          <div className="mt-4 space-y-4">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value as any)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      sortBy === option.value
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {loading && page === 1 ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="w-24 h-4 bg-gray-300 rounded"></div>
                      <div className="w-16 h-3 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-4 bg-gray-300 rounded"></div>
                    <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
                  </div>
                  <div className="w-full h-48 bg-gray-300 rounded-lg mt-4"></div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-500 mb-4">Be the first to share something with the community!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
              >
                Create Your First Post
              </button>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onUpdate={handlePostUpdate}
                onDelete={handlePostDelete}
              />
            ))
          )}

          {/* Infinite scroll trigger */}
          {hasMore && posts.length > 0 && (
            <div ref={ref} className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </div>
  );
};

export default Feed;
