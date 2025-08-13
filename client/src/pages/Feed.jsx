import React, { useEffect, useState } from "react";
// ✅ Removed the duplicate import of dummyPostsData and combined into one import statement
import { dummyPostsData, assets } from "../assets/assets"; 
import Loading from "../components/Loading";
import StoriesBar from "../components/StoriesBar";
import PostCard from "../components/PostCard";
import RecentMessages from '../components/RecentMessages'

const Feed = () => {
  const [feeds, setFeeds] = useState([]); // ✅ Fixed variable name to camelCase (setfeeds → setFeeds)
  const [loading, setLoading] = useState(true);

  // Simulates fetching feed data (right now from dummyPostsData)
  const fetchFeeds = async () => {
    setFeeds(dummyPostsData); // ✅ Using camelCase state updater
    setLoading(false);
  };

  // Runs once on component mount
  useEffect(() => {
    fetchFeeds();
  }, []);

  return !loading ? (
    <div
      className="h-full overflow-scroll no-scrollbar p-10 xl:pr-5 flex items-start justify-center xl:gap-8"
    >
      {/* LEFT SIDE: Stories + Post list */}
      <div>
        <StoriesBar />
        <div className="p-4 space-y-6">
          {feeds.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </div>

      {/* RIGHT SIDE: Sponsored section + Recent messages */}
      <div className="max-xl:hidden sticky top-0">
        <div className="max-w-xs bg-white text-xs p-4 rounded-md inline-flex flex-col gap-2 shadow">
          <h3 className="text-slate-800 font-semibold">Sponsored</h3>
          {/* ✅ assets now works because we imported it above */}
          <img
            src={assets.sponsored_img}
            className="w-72 h-48 rounded-md" // ✅ Tailwind default sizes used
            alt="Sponsored content"
          />
          <p className="text-slate-600">Email marketing</p>
          <p className="text-slate-400">
            Supercharge your marketing with a powerful, easy-to-use
            platform built for results.
          </p>
        </div>
        <RecentMessages/>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default Feed;

