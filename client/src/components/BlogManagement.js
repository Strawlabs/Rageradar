import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const BlogManagement = () => {
  const { currentUser, userPlan, isAdmin } = useAuth();
  
  // All hooks must be called at the top level
  const [posts, setPosts] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'AI & Technology',
    tags: '',
    author: 'RageRadar Team',
    image: null,
    imagePreview: null
  });

  // Mock posts - in real app, this would come from your backend
  const mockPosts = [
    {
      id: 1,
      title: "Understanding AI-Powered Sentiment Analysis in 2024",
      excerpt: "Discover how artificial intelligence is revolutionizing the way we analyze emotions and opinions across social media platforms.",
      content: "Full article content here...",
      author: "RageRadar Team",
      date: "2024-01-15",
      category: "AI & Technology",
      status: "published",
      tags: ["AI", "Sentiment Analysis", "Technology"],
      image: null
    },
    {
      id: 2,
      title: "27+ Platforms: The Complete Guide to Social Media Monitoring",
      excerpt: "Learn how to monitor your brand across all major social media platforms and review sites for comprehensive sentiment tracking.",
      content: "Full article content here...",
      author: "Sarah Johnson",
      date: "2024-01-10",
      category: "Social Media",
      status: "published",
      tags: ["Social Media", "Monitoring", "Platforms"],
      image: null
    }
  ];

  const categories = ['AI & Technology', 'Social Media', 'Brand Management', 'Case Studies'];

  useEffect(() => {
    // Load posts from localStorage or use mock posts
    const savedPosts = localStorage.getItem('blogPosts');
    if (savedPosts) {
      try {
        setPosts(JSON.parse(savedPosts));
      } catch (error) {
        setPosts(mockPosts);
      }
    } else {
      setPosts(mockPosts);
    }
  }, []);
  
  // Check if user is admin (same logic as sidebar)
  const isUserAdmin = (
    userPlan?.role === 'admin' || 
    userPlan?.email === 'admin@rageradar.com' || 
    currentUser?.email === 'admin@rageradar.com' ||
    isAdmin(userPlan)
  );
  
  if (!isUserAdmin) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="bg-card p-8 rounded-xl border text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">You need admin privileges to access blog management.</p>
          <Link to="/dashboard" className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }



  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          image: file,
          imagePreview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({
      ...formData,
      image: null,
      imagePreview: null
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newPost = {
      id: editingPost ? editingPost.id : Date.now(),
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()),
      date: editingPost ? editingPost.date : new Date().toISOString().split('T')[0],
      status: 'published',
      image: formData.imagePreview, // Store the base64 image data
      readTime: `${Math.ceil(formData.content.length / 200)} min read` // Estimate read time
    };

    let updatedPosts;
    if (editingPost) {
      updatedPosts = posts.map(post => post.id === editingPost.id ? newPost : post);
    } else {
      updatedPosts = [newPost, ...posts];
    }
    
    setPosts(updatedPosts);
    // Save to localStorage
    localStorage.setItem('blogPosts', JSON.stringify(updatedPosts));

    // Reset form
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: 'AI & Technology',
      tags: '',
      author: 'RageRadar Team',
      image: null,
      imagePreview: null
    });
    setShowCreateForm(false);
    setEditingPost(null);
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      tags: post.tags.join(', '),
      author: post.author,
      image: null,
      imagePreview: post.image
    });
    setShowCreateForm(true);
  };

  const handleDelete = (postId) => {
    setPostToDelete(postId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    const updatedPosts = posts.filter(post => post.id !== postToDelete);
    setPosts(updatedPosts);
    // Save to localStorage
    localStorage.setItem('blogPosts', JSON.stringify(updatedPosts));
    setShowDeleteModal(false);
    setPostToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPostToDelete(null);
  };

  const cancelEdit = () => {
    setShowCreateForm(false);
    setEditingPost(null);
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: 'AI & Technology',
      tags: '',
      author: 'RageRadar Team',
      image: null,
      imagePreview: null
    });
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Blog Management</h1>
            <p className="text-muted-foreground mt-2">Create and manage your blog posts</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-shadow flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Post
          </button>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="bg-card rounded-lg border p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {editingPost ? 'Edit Post' : 'Create New Post'}
              </h2>
              <button
                onClick={cancelEdit}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-background text-foreground"
                  placeholder="Enter post title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Excerpt *
                </label>
                <textarea
                  name="excerpt"
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none bg-background text-foreground"
                  placeholder="Brief description of the post"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Content *
                </label>
                <textarea
                  name="content"
                  required
                  rows={12}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none bg-background text-foreground"
                  placeholder="Write your blog post content here..."
                  value={formData.content}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Featured Image
                </label>
                <div className="space-y-4">
                  {formData.imagePreview ? (
                    <div className="relative">
                      <img 
                        src={formData.imagePreview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg border border-border"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <svg className="w-12 h-12 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-muted-foreground mb-2">Upload a featured image for your blog post</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-shadow cursor-pointer inline-block"
                      >
                        Choose Image
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-background text-foreground"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Author
                  </label>
                  <input
                    type="text"
                    name="author"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-background text-foreground"
                    placeholder="Author name"
                    value={formData.author}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-background text-foreground"
                  placeholder="AI, Technology, Sentiment Analysis"
                  value={formData.tags}
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow"
                >
                  {editingPost ? 'Update Post' : 'Publish Post'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-muted text-muted-foreground px-6 py-2 rounded-lg font-semibold hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Posts List */}
        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Published Posts ({posts.length})</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {posts.map((post) => (
              <div key={post.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{post.title}</h3>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                        {post.status}
                      </span>
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                        {post.category}
                      </span>
                    </div>
                    
                    <p className="text-muted-foreground mb-3 line-clamp-2">{post.excerpt}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>By {post.author}</span>
                      <span>•</span>
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{post.tags.join(', ')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(post)}
                      className="p-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit post"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete post"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-8">
          <Link 
            to="/dashboard" 
            className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to dashboard
          </Link>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground">Delete Blog Post</h3>
              </div>
              
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete this blog post? This action cannot be undone.
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete Post
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogManagement;