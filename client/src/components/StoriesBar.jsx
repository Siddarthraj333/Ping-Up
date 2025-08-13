import React, { useEffect, useState } from "react";
import { dummyStoriesData } from "../assets/assets";
import { Plus } from "lucide-react";
import moment from "moment";
import StoryModal from "./StoryModal";
import StoryViewer from "./StoryViewer";

const StoriesBar = () => {
  const [stories, setStories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [viewStory, setViewStory] = useState(null);

  const fetchstories = async () => {
    setStories(dummyStoriesData);
  };

  useEffect(() => {
    fetchstories();
  }, []);

  return (
    <div
      className="w-screen sm:w-[calc(100vw-240px)] lg:max-w-2xl no-scrollbar
      overflow-x-auto px-4"
    >
      <div className="flex gap-4 pb-5">
        {/* Add a story card */}
        <div onClick={()=> setShowModal(true)}
          className="rounded-lg shadow-sm min-w-30 max-w-30 max-h-40
            aspect-[3/4] cursor-pointer hover:shadow-lg transition-all duration-200
            border-2 border-dashed border-indigo-300 bg-gradient-to-b
            from-indigo-50 to-white"
        >
          <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="size-10 bg-indigo-500 rounded-full flex items-center justify-center mb-3">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-slate-700 text-center">
              Create Story
            </p>
          </div>
        </div>

        {/* Story cards */}
        {stories.map((story, index) => (
          <div onClick={()=> setViewStory(story)}
            key={index}
            className={`relative rounded-lg shadow
              min-w-30 max-w-30 max-h-40 cursor-pointer hover:shadow-lg
              transition-all duration-200 bg-gradient-to-b from-indigo-500
              to-purple-600 hover:from-indigo-700 hover:to-purple-800
              active:scale-95`}
          >
            {/* Profile picture */}
            <img
              src={story.user.profile_picture}
              alt=""
              className="absolute size-8 top-3 left-3 z-10 rounded-full
              ring ring-gray-100 shadow"
            />

            {/* CHANGED: Replaced invalid top-18 with top-16 (valid Tailwind class) */}
            <p
              className="absolute top-16 left-3 text-white/80 text-sm
              truncate max-w-24"
            >
              {story.content}
            </p>

            {/* Time */}
            <p
              className="text-white absolute bottom-1 right-2 z-10
              text-xs"
            >
              {moment(story.createdAt).fromNow()}
            </p>

            {/* Media background */}
            {story.media_type !== "text" && (
              // CHANGED: Replaced invalid z-1 with z-0 (valid Tailwind class)
              <div
                className="absolute inset-0 z-0 rounded-lg
                bg-black overflow-hidden"
              >
                {story.media_type === "image" ? (
                  <img
                    src={story.media_url}
                    alt=""
                    className="h-full w-full object-cover
                    hover:scale-100 transition duration-500 opacity-70
                    hover:opacity-80"
                  />
                ) : (
                  <video
                    src={story.media_url}
                    className="h-full w-full object-cover
                    hover:scale-100 transition duration-500 opacity-70
                    hover:opacity-80"
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {/* add story model */}
      {showModal && <StoryModal setShowModal={setShowModal} fetchStories={fetchstories} />}
             {/* viewstory modal */}
             {viewStory && <StoryViewer viewStory={viewStory} setViewStory={setViewStory}/>}
    </div>
  );
};

export default StoriesBar;
