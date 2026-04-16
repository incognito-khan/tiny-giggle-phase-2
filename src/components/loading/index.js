import React from "react";

const Loading = ({ transparent }) => {
  return (
    <div
      id="loading-container"
      className={`${!transparent && 'fixed top-0 left-0 w-full h-full bg-white/70'} flex justify-center items-center z-[70]`}
    >
      <div className={`${!transparent ? 'w-12 h-12 border-8' : 'w-7 h-7 border-4'} border-dashed rounded-full animate-spin  border-secondary`}></div>
    </div>
  );
};

export default Loading;
