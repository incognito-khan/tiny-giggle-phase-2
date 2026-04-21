"use client";

import {
  Search,
  ChevronRight,
  Calendar,
  User,
  Tag,
  Mail,
  Share2,
  ArrowLeft,
} from "lucide-react";
import { BsChatSquareQuoteFill } from "react-icons/bs";
import { useState } from "react";
import Link from "next/link";
import { recentPosts } from "@/components/data/blog/blogdata";
import { PiArrowBendUpLeftFill } from "react-icons/pi";
import { getComments } from "@/components/data/blog/blogdata";
import CommentCard from "./commentsCard";

export default function BlogDetail({ post }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [email, setEmail] = useState("");

  const categories = [
    { name: "Wall Sticker", count: 5 },
    { name: "After School", count: 8 },
    { name: "Online Class", count: 12 },
    { name: "Play Room", count: 6 },
  ];

  const tags = ["GAME", "EARNING", "WHO", "PLAY TO EARN", "FREE"];

  const comments = getComments();

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-3">
            <article className=" rounded-2xl overflow-hidden">
              {/* Hero Image */}
              <div className="aspect-video overflow-hidden">
                <div
                  className="w-full h-full bg-cover bg-center rounded-2xl"
                  style={{
                    backgroundImage: `url(${post.image})`,
                  }}
                ></div>
              </div>

              {/* Article Content */}
              <div className="p-8">
                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
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
                  <div className="text-brand font-medium">{post.readTime}</div>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-800 mb-8 leading-tight">
                  {post.title}
                </h1>

                {/* Article Content */}
                <div className="prose prose-lg max-w-none">
                  {/* First Paragraphs */}
                  {post.content.paragraphs
                    .slice(0, 2)
                    .map((paragraph, index) => (
                      <p
                        key={index}
                        className="text-gray-600 leading-relaxed mb-6"
                      >
                        {paragraph}
                      </p>
                    ))}

                  {/* Quote Section */}
                  {post.content.quote && (
                    <div className="relative mb-12">
                      <div className=" p-6 relative [box-shadow:0_8px_0_#D18109] rounded-3xl">
                        {/* Quote Icon */}
                        <div className="absolute -left-2 top-7 w-12 h-12 rounded-lg flex items-center justify-center">
                          <BsChatSquareQuoteFill className="text-brand text-5xl" />
                        </div>

                        {/* Quote Text */}
                        <blockquote className="text-lg font-semibold text-gray-800 mb-4 pl-8">
                          " {post.content.quote.text} "
                        </blockquote>

                        {/* Author */}
                        <div className="pl-8">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-1 bg-[#D18109] rounded-md"></div>
                            <span className="text-brand font-bold text-sm">
                              WRITTEN BY: {post.content.quote.author}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Paragraph */}
                  {post.content.paragraphs.length > 2 && (
                    <p className="text-gray-600 leading-relaxed mb-8">
                      {post.content.paragraphs[2]}
                    </p>
                  )}

                  {/* Subheading */}
                  {post.content.subheading && (
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                      {post.content.subheading}
                    </h2>
                  )}

                  {/* More Paragraphs */}
                  {post.content.paragraphs.slice(3).map((paragraph, index) => (
                    <p
                      key={index + 3}
                      className="text-gray-600 leading-relaxed mb-8"
                    >
                      {paragraph}
                    </p>
                  ))}

                  {/* Inline Images */}
                  {post.content.images && post.content.images.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      {post.content.images.map((image, index) => (
                        <div
                          key={index}
                          className="rounded-2xl overflow-hidden"
                        >
                          <div
                            className="w-full aspect-video bg-cover bg-center"
                            style={{
                              backgroundImage: `url(${image})`,
                            }}
                          ></div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Final Content */}
                  {/* <p className="text-gray-600 leading-relaxed mb-8">
                    consectetur adipisc ing elit dictum quam augue ac lacor eet
                    ligero comodo consequatcoe ctetur adipisc ing elit, sed do
                    eiusmod tempor incididunt ut la bore et dolore magna aliqua.
                    Lorem ipsum dolorsit amet contetur adipisc ingelit, sed do
                    eiusmod tempor incidunt.
                  </p> */}
                </div>

                {/* Dotted Separator */}
                <div className="w-full h-px border-b border-dotted border-gray-300 mb-8"></div>

                {/* Tags and Share Section */}
                <div className="flex items-center justify-between">
                  {/* Tags */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Tag className="w-5 h-5 text-purple-600" />
                      <span className="font-bold text-gray-800">Tags :</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-gray-600 hover:text-brand cursor-pointer transition-colors duration-300"
                        >
                          {tag}
                          {index < post.tags.length - 1 && (
                            <span className="text-gray-400 ml-1">,</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Share Button */}
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">Share :</span>
                    <button className="flex items-center gap-1 text-purple-600 hover:text-purple-700 transition-colors duration-300">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
            {/* Author Bio Section */}
            {/* <div className="bg-[#70197a] rounded-2xl p-8 text-white mb-8">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-brand flex-shrink-0">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{
                      backgroundImage:
                        "url(https://html.vecurosoft.com/toddly/demo/assets/img/blog/comment-author-2.png)",
                    }}
                  ></div>
                </div>

                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Alexra Dadder
                  </h3>
                  <p className="text-white/90 leading-relaxed">
                    Consectetur Adipisc Ing Elits Dictum Quam Augue Ac Lacor Eet
                    Liglero Comodo Consequatcoe Ctetur Adipisc Ingelit, Sed
                    Eiusmod Tempor Incididunt Ut La Bore Et Dolore Magna Aliqua.
                  </p>
                </div>
              </div>
            </div> */}

            {/* Comments Section */}
            <div className="rounded-2xl p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-8">
                No Comments
              </h3>

              <div className="space-y-6">
                {/* {comments.map((comment) => (
                  <>
                    <div
                      key={comment.id}
                      className="border border-dashed border-gray-300 rounded-2xl p-6 mb-4"
                    >
                      <CommentCard comment={comment} />
                    </div>

                    {comment.replies?.length > 0 &&
                      comment.replies.map((reply) => (
                        <div className="border border-dashed border-gray-300 rounded-2xl p-6 mb-4 ml-[70px] space-y-4 mt-4">
                          <CommentCard key={reply.id} comment={reply} />
                        </div>
                      ))}
                  </>
                ))} */}
                No comments yet
              </div>
            </div>

            {/* Leave a Comment Form */}
            {/* <div className="bg-[#F6F1E4] rounded-2xl p-8 border border-gray-300">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">
                Leave a Comment
              </h3>

              <p className="text-gray-600 font-semibold text-base mb-6">
                Your Email Address Will Not Be Published. Required Fields Are
                Marked*
              </p>

              <form className="space-y-6">
                <div>
                  <textarea
                    placeholder="Your Comment *"
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 border-dashed bg-white placeholder:text-gray-600 rounded-lg focus:outline-none focus:border-brand resize-none"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name *"
                    className="px-4 py-3 border border-gray-300 border-dashed bg-white placeholder:text-gray-600 rounded-lg focus:outline-none focus:border-brand"
                  />
                  <input
                    type="email"
                    placeholder="Your Email *"
                    className="px-4 py-3 border border-gray-300 border-dashed bg-white placeholder:text-gray-600 rounded-lg focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="save-details"
                    className="mt-1 w-4 h-4 text-brand border-gray-300 rounded focus:ring-brand"
                  />
                  <label
                    htmlFor="save-details"
                    className="text-gray-600 text-sm leading-relaxed"
                  >
                    Save my name, email, and website next time I comment. *
                  </label>
                </div>

                <button
                  type="submit"
                  className="bg-brand text-white font-bold py-3 px-8 rounded-4xl hover:bg-secondary transition-colors duration-300 uppercase tracking-wider border-2 border-dashed border-gray-300"
                >
                  POST COMMENT
                </button>
              </form>
            </div> */}
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
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:border-brand bg-white placeholder:text-black"
                />
                <button className="px-4 py-3 bg-[#D18109] text-white rounded-r-lg hover:bg-orange-600 transition-colors duration-300">
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
                    <span className="text-[#5B5A7B] group-hover:text-brand cursor-pointer transition-colors duration-300 font-bold">
                      {category.name}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#5B5A7B] group-hover:text-brand" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#F6F1E4] rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-5 h-5 bg-brand rounded-sm flex items-center justify-center">
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
                      <h4 className="text-base font-semibold text-gray-800 hover:text-brand cursor-pointer transition-colors duration-300 leading-tight">
                        {post.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#F6F1E4] rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 bg-brand rounded-sm flex items-center justify-center">
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

              <button className="w-full bg-[#dd8808] text-white font-bold py-4 px-6 rounded-lg hover:bg-orange-600 transition-colors duration-300 uppercase tracking-wider">
                JOIN NOW
              </button>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
