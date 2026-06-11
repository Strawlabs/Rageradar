import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock blog posts - in a real app, this would come from your backend
  const mockPosts = [
    {
      id: 1,
      title: "Understanding AI-Powered Sentiment Analysis in 2024",
      excerpt: "Discover how artificial intelligence is revolutionizing the way we analyze emotions and opinions across social media platforms.",
      content: "Full article content here...",
      author: "RageRadar Team",
      date: "2024-01-15",
      category: "AI & Technology",
      readTime: "8 min read",
      image: null,
      tags: ["AI", "Sentiment Analysis", "Technology"]
    },
    {
      id: 2,
      title: "27+ Platforms: The Complete Guide to Social Media Monitoring",
      excerpt: "Learn how to monitor your brand across all major social media platforms and review sites for comprehensive sentiment tracking.",
      content: "Full article content here...",
      author: "Sarah Johnson",
      date: "2024-01-10",
      category: "Social Media",
      readTime: "12 min read",
      image: null,
      tags: ["Social Media", "Monitoring", "Platforms"]
    },
    {
      id: 3,
      title: "Crisis Management: How to Handle Negative Sentiment Spikes",
      excerpt: "A step-by-step guide to managing your brand reputation when negative sentiment suddenly increases across social platforms.",
      content: "Full article content here...",
      author: "Mike Chen",
      date: "2024-01-05",
      category: "Brand Management",
      readTime: "10 min read",
      image: null,
      tags: ["Crisis Management", "Brand Reputation", "Strategy"]
    }
  ];

  const categories = ['all', 'AI & Technology', 'Social Media', 'Brand Management', 'Case Studies'];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      // Try to get posts from localStorage first, fallback to mock posts
      const savedPosts = localStorage.getItem('blogPosts');
      if (savedPosts) {
        try {
          const parsedPosts = JSON.parse(savedPosts);
          setPosts([...parsedPosts, ...mockPosts]);
        } catch (error) {
          setPosts(mockPosts);
        }
      } else {
        setPosts(mockPosts);
      }
      setLoading(false);
    }, 1000);
  }, []);

  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-block group mb-8">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-lg">R</span>
              </div>
              <span className="text-2xl font-black text-gray-900">RageRadar</span>
            </div>
          </Link>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog & Insights</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest trends in sentiment analysis, brand monitoring, and social media intelligence
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category === 'all' ? 'All Posts' : category}
            </button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredPosts.map((post) => (
            <article key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                {post.image ? (
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-600">{post.category}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-500">{post.readTime}</span>
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors line-clamp-2">
                  {post.title}
                </h2>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {post.author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{post.author}</p>
                      <p className="text-xs text-gray-500">{new Date(post.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <Link
                    to={`/blog/${post.id}`}
                    className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all"
                  >
                    Read More
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-2xl p-8 text-center text-white mb-12">
          <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
          <p className="mb-6 opacity-90">Get the latest insights on sentiment analysis and brand monitoring delivered to your inbox.</p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button className="bg-white text-orange-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
              Subscribe
            </button>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link 
            to="/" 
            className="text-gray-500 hover:text-gray-700 text-sm transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Blog;