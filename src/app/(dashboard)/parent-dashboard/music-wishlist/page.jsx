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
import Loading from "../../../../components/loading/index";
import { getAllMusicCategories } from "@/store/slices/categorySlice";
import CategoryTabs from "@/components/parent-dashboard/shopping/category-tabs";
import ParentHeader from "@/components/layout/header/parent-header";
import { toggleFavoriteMusic, getMusicFavorites } from "@/store/slices/favoriteSlice";

export default function MusicShop() {
  const user = useSelector((state) => state.auth.user);
  const musics = useSelector((state) => state.music.musics);
  const favMusic = useSelector((state) => state.favorite.favoriteMusic)
  console.log(favMusic, 'favMusic')
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
    dispatch(getMusicFavorites({ setLoading, parentId: user?.id }));
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
      setFilteredMusic(favMusic);
    } else {
      const filterd = favMusic?.filter(
        (music) => music.music.categoryId === activeCategory
      );
      setFilteredMusic(filterd);
    }
  }, [activeCategory, favMusic]);

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

  const toggleFavorites = (musicId, music) => {
    dispatch({
      type: "favorite/toggleLocalFavoriteMusic",
      payload: { musicId, music }
    });
    dispatch(toggleFavoriteMusic({ parentId: user?.id, musicId }));
    // const updatedFavMusic = favMusic.filter((music) => music.id !== musicId);
    // setFilteredMusic(updatedFavMusic);
  };

  return (
    <div className="min-h-screen w-screen bg-background pb-24">
      {loading && <Loading />}
      {/* Header */}
      {/* <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
              Hello, Sarah!
            </h1>
            <p className="text-gray-600 text-sm lg:text-base">
              Keep track of your baby's vaccination schedule and health records
            </p>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <div className="relative flex-1 lg:flex-none">
              <Search className="w-4 h-4 lg:w-5 lg:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search vaccinations..."
                className="pl-8 lg:pl-10 w-full lg:w-80 bg-gray-50 border-gray-200 rounded-full text-sm"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full"
            >
              <MessageCircle className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
              <Badge className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 p-0 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </Badge>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full"
            >
              <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
              <Badge className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 p-0 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
                5
              </Badge>
            </Button>

            <div className="hidden lg:flex items-center gap-3">
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback className="bg-gradient-to-r from-pink-400 to-purple-400 text-white">
                  SJ
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-800">Sarah Johnson</p>
                <p className="text-sm text-green-500">Online</p>
              </div>
            </div>
          </div>
        </div>
      </header> */}
      <ParentHeader />

      {/* Main Content */}
      <main className="container mx-auto px-6 pt-6 pb-12">
        <div className="mb-6">
          <h2 className="text-4xl font-bold text-balance mb-4">
            Discover Your Best
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
                key={track?.id}
                track={track}
                isCurrentTrack={currentTrack?.id === track?.id}
                isPlaying={isPlaying && currentTrack?.id === track?.id}
                onPlayPreview={handlePlayPreview}
                onAddToCart={handleAddToCart}
                toggleFavorites={toggleFavorites}
              />
            ))}
          </div>
        ) : (
          <div className="flex justify-center">
            No Favorite Music Found
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
        />
      )}
    </div>
  );
}
