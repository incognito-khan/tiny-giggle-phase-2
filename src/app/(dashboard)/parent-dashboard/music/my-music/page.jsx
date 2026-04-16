"use client";

import { useState, useEffect } from "react";
import { MusicCard } from "@/components/parent-dashboard/music/music-card";
import { MusicPlayer } from "@/components/parent-dashboard/music/music-player";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MessageCircle, Bell, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { getPurchaseMusic } from "@/store/slices/musicSlice";
import Loading from "@/components/loading/index"
import { getAllMusicCategories } from "@/store/slices/categorySlice";
import CategoryTabs from "@/components/parent-dashboard/shopping/category-tabs";
import ParentHeader from "@/components/layout/header/parent-header";
import { toggleFavoriteMusic, getMusicFavorites } from "@/store/slices/favoriteSlice";

export default function MyMusic() {
  const user = useSelector((state) => state.auth.user);
  const musics = useSelector((state) => state.music.musics);
  console.log(musics, "musics");
  const categories = useSelector((state) => state.category.categories);
  console.log(categories, "categories");
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(1);
  const [filteredMusic, setFilteredMusic] = useState([]);
  const dispatch = useDispatch();

  const handlePlayPreview = (track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const gettingAllCategories = () => {
    dispatch(getAllMusicCategories({ setLoading }));
  };

  const gettingAllMusics = () => {
    dispatch(getPurchaseMusic({ setLoading, parentId: user?.id }));
  };

  const gettingFavorites = () => {
    dispatch(getMusicFavorites({ setLoading, parentId: user?.id }))
  }

  useEffect(() => {
    gettingAllMusics();
    gettingAllCategories();
    gettingFavorites();
  }, []);

  useEffect(() => {
    if (activeCategory === 1) {
      setFilteredMusic(musics);
    } else {
      const filterd = musics.filter(
        (music) => music.categoryId === activeCategory
      );
      setFilteredMusic(filterd);
    }
  }, [activeCategory, musics]);

  const handleAddToCart = (track) => {
    console.log("Added to cart:", track.title);
    // Add cart logic here
  };

  const handleNext = () => {
    if (!currentTrack || !musics?.length) return;
    const currentIndex = musics.findIndex((m) => m.id === currentTrack.id);

    if (currentIndex === musics.length - 1) return;

    const nextIndex = currentIndex + 1;
    setCurrentTrack(musics[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    if (!currentTrack || !musics?.length) return;
    const currentIndex = musics.findIndex((m) => m.id === currentTrack.id);

    if (currentIndex === 0) return;

    const prevIndex = currentIndex - 1;
    setCurrentTrack(musics[prevIndex]);
    setIsPlaying(true);
  };

  const toggleFavorites = (musicId) => {
    dispatch(toggleFavoriteMusic({ parentId: user?.id, musicId }));
  };

  return (
    <div className="min-h-screen w-screen bg-background pb-24">
      {loading && <Loading />}
      {/* Header */}
      <ParentHeader />

      {/* Main Content */}
      <main className="container mx-auto px-6 pt-6 pb-12">
        <div className="mb-6">
          <h2 className="text-4xl font-bold text-balance mb-4">
            Discover Your Next
            <span className="block text-pink-600">Favorite Track</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl">
            Explore our curated collection of premium music from emerging and
            established artists worldwide.
          </p>
        </div>

        <CategoryTabs
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          categories={categories}
          type={"Music"}
        />

        {/* Music Grid */}
        {filteredMusic?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMusic?.map((track) => (
              <MusicCard
                key={track?.music?.id}
                track={track?.music}
                isCurrentTrack={currentTrack?.id === track?.music?.id}
                isPlaying={isPlaying && currentTrack?.id === track?.music?.id}
                onPlayPreview={handlePlayPreview}
                onAddToCart={handleAddToCart}
                toggleFavorites={toggleFavorites}
                setLoading={setLoading}
                ownMusic={true}
              />
            ))}
          </div>
        ) : (
          <div className="flex justify-center">
            No Music Found
          </div>
        )}
      </main>

      {/* Fixed Music Player */}
      {currentTrack && (
        <MusicPlayer
          track={currentTrack}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onNext={handleNext}
          onPrevious={handlePrevious}
          ownMusic={true}
        />
      )}
    </div>
  );
}
