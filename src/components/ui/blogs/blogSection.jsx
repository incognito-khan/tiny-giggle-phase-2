"use client";

import { Search, ChevronRight, Calendar, User, Tag, Mail } from "lucide-react";
import { useState } from "react";
import { getAllBlogPosts, recentPosts } from "@/components/data/blog/blogdata";
import { useRouter } from "next/navigation";

export default function BlogSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [email, setEmail] = useState("");

  const blogPosts = getAllBlogPosts();
  const router = useRouter();

  const categories = [
    { name: "Wall Sticker", count: 5 },
    { name: "After School", count: 8 },
    { name: "Online Class", count: 12 },
    { name: "Play Room", count: 6 },
  ];

  const tags = ["GAME", "EARNING", "WHO", "PLAY TO EARN", "FREE"];

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-3 space-y-8">
            {/* Blog Posts */}
            {blogPosts.map((post) => (
              <article
                key={post.id}
                onClick={() => router.push(`/blogs/${post.id}`)}
                className="bg-white rounded-2xl overflow-hidden"
              >
                {/* Post Image */}
                <div className="aspect-video overflow-hidden rounded-2xl">
                  <div
                    className="w-full h-full bg-cover bg-center hover:scale-105 transition-transform duration-500"
                    style={{
                      backgroundImage: `url(${post.image})`,
                    }}
                  ></div>
                </div>

                {/* Post Content */}
                <div className="py-6">
                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4 text-brand" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-brand" />
                      <span>{post.date}</span>
                    </div>
                    {/* <div className="flex items-center gap-1">
                      <Tag className="w-4 h-4 text-brand" />
                      <span>{post.category}</span>
                    </div> */}
                  </div>

                  {/* Title */}
                  <h2 className="text-3xl font-bold text-gray-800 mb-4 hover:text-brand cursor-pointer transition-colors duration-300">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-gray-800 leading-relaxed mb-6">
                    {post.excerpt}
                  </p>

                  {/* Read More Button */}
                  <button className="flex items-center gap-2 text-black font-semibold hover:text-orange-600 transition-colors duration-300 cursor-pointer">
                    Read More
                    <ChevronRight className="w-4 h-4 text-brand" />
                  </button>
                </div>

                {/* Dotted Separator */}
                <div className="pb-6">
                  <img
                    src="https://html.vecurosoft.com/toddly/demo/assets/img/elements/vs-blog-ele1.svg"
                    alt=""
                  />
                </div>
              </article>
            ))}

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-8">
              <button className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-brand hover:text-white hover:border-gray-300 transition-all duration-300">
                «
              </button>
              <button className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-brand hover:text-white hover:border-gray-300 transition-all duration-300">
                1
              </button>
              <button className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-brand hover:text-white hover:border-gray-300 transition-all duration-300">
                2
              </button>
              <span className="px-2 text-gray-500">...</span>
              <button className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-brand hover:text-white hover:border-gray-300 transition-all duration-300">
                5
              </button>
              <button className="w-10 h-10 rounded-lg bg-brand text-white flex items-center justify-center border border-orange-500">
                »
              </button>
            </div>
          </div>

          {/* Sidebar - Right Side */}
          {/* <div className="space-y-6">
            <div className="bg-[#F6F1E4] rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-brand" />
                <h3 className="text-lg font-bold text-gray-800">Search</h3>
              </div>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:border-orange-500 bg-white placeholder:text-black"
                />
                <button className="px-4 py-3 bg-[#D18109] text-white rounded-r-lg hover:bg-brand transition-colors duration-300">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="bg-[#F6F1E4] rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 bg-brand rounded-sm flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Category</h3>
              </div>
              <div className="space-y-3">
                {categories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-gray-400 last:border-b-0 group cursor-pointer"
                  >
                    <span className="text-[#5B5A7B] group-hover:text-[#D18109] cursor-pointer transition-colors duration-300 font-bold">
                      {category.name}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#5B5A7B] group-hover:text-[#D18109]" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#F6F1E4] rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-5 h-5 bg-orange-500 rounded-sm flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Recent Post</h3>
              </div>
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div key={post.id} className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${post.image})`,
                        }}
                      ></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                        <Calendar className="w-3 h-3" />
                        <span>{post.date}</span>
                      </div>
                      <h4 className="text-base font-semibold text-gray-800 hover:text-[#D18109] cursor-pointer transition-colors duration-300 leading-tight">
                        {post.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#F6F1E4] rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 bg-orange-500 rounded-sm flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Tag Post</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <button
                    key={index}
                    className="px-5 py-2 text-sm font-medium text-black bg-white rounded-full hover:bg-[#71197D] hover:text-white transition-all duration-300 border border-gray-200 cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#71197D] rounded-2xl p-6 text-white border border-gray-200">
              <div className="w-12 h-12 bg-[#D18109] rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-white" />
              </div>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">SUBSCRIBE</h3>
                <p className="text-lg font-medium">OUR NEWSLETTER</p>
              </div>
              <div className="mb-4">
                <input
                  type="email"
                  placeholder="Enter Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-5 rounded-lg text-gray-700 placeholder-gray-700 font-semibold outline-none bg-white text-center"
                />
              </div>

              <button className="w-full bg-[#dd8808] text-white font-bold py-4 px-6 rounded-lg hover:bg-brand transition-colors duration-300 uppercase tracking-wider">
                JOIN NOW
              </button>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
