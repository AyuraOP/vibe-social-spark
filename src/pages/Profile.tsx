
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Users, Heart, Bookmark, Grid, Settings } from 'lucide-react';
import PostCard from '../components/PostCard';
import { toast } from '@/hooks/use-toast';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  profile_picture?: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  is_following?: boolean;
}

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = currentUser?.id.toString() === userId;

  useEffect(() => {
    fetchProfile();
    fetchPosts();
    if (isOwnProfile) {
      fetchSavedPosts();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/users/${userId}/profile/`);
      setProfile(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await api.get(`/posts/?user=${userId}`);
      setPosts(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchSavedPosts = async () => {
    try {
      const response = await api.get('/users/saved/');
      setSavedPosts(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching saved posts:', error);
    }
  };

  const handleFollow = async () => {
    if (followLoading) return;
    
    setFollowLoading(true);
    try {
      await api.post(`/users/${userId}/follow-toggle/`);
      setProfile(prev => prev ? {
        ...prev,
        is_following: !prev.is_following,
        followers_count: prev.is_following 
          ? prev.followers_count - 1 
          : prev.followers_count + 1
      } : null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePostUpdate = (updatedPost: any) => {
    setPosts(prev => prev.map((post: any) => 
      post.id === updatedPost.id ? updatedPost : post
    ));
    if (activeTab === 'saved') {
      setSavedPosts(prev => prev.map((post: any) => 
        post.id === updatedPost.id ? updatedPost : post
      ));
    }
  };

  const handlePostDelete = (postId: number) => {
    setPosts(prev => prev.filter((post: any) => post.id !== postId));
    if (activeTab === 'saved') {
      setSavedPosts(prev => prev.filter((post: any) => post.id !== postId));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User not found</h2>
          <p className="text-gray-600">The profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Profile Picture */}
            <div className="relative">
              {profile.profile_picture ? (
                <img
                  src={profile.profile_picture}
                  alt={profile.username}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {profile.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">@{profile.username}</h1>
                  <p className="text-gray-600">{profile.email}</p>
                </div>

                <div className="flex space-x-2 mt-4 sm:mt-0">
                  {isOwnProfile ? (
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Settings className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleFollow}
                      disabled={followLoading}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        profile.is_following
                          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                          : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                      }`}
                    >
                      {followLoading ? 'Loading...' : profile.is_following ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex justify-center sm:justify-start space-x-8">
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">{profile.posts_count}</p>
                  <p className="text-sm text-gray-600">Posts</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">{profile.followers_count}</p>
                  <p className="text-sm text-gray-600">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">{profile.following_count}</p>
                  <p className="text-sm text-gray-600">Following</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'posts'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Posts</span>
            </button>
            
            {isOwnProfile && (
              <button
                onClick={() => setActiveTab('saved')}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === 'saved'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>Saved</span>
              </button>
            )}
          </div>
        </div>

        {/* Posts Grid */}
        <div className="space-y-6">
          {activeTab === 'posts' ? (
            posts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Grid className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-500">
                  {isOwnProfile ? 'Share your first post!' : 'This user hasn\'t posted anything yet.'}
                </p>
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
            )
          ) : (
            savedPosts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No saved posts</h3>
                <p className="text-gray-500">Save posts you like to view them here later.</p>
              </div>
            ) : (
              savedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onUpdate={handlePostUpdate}
                  onDelete={handlePostDelete}
                />
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
