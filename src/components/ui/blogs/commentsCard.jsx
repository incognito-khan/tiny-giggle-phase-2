import React from 'react'
import { PiArrowBendUpLeftFill } from 'react-icons/pi';

const CommentCard = ({ comment }) => (
    <div className="flex items-start gap-4">
      {/* Avatar */}
      <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-brand flex-shrink-0">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${comment.img})`
          }}
        />
      </div>
  
      {/* Content */}
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
          <h4 className="text-lg font-bold text-gray-800">{comment.name}</h4>
          <span className="text-sm text-purple-600 font-medium">{comment.date}</span>
        </div>
        <p className="text-gray-600 leading-relaxed mb-4">{comment.content}</p>
        <button className="flex items-center gap-2 text-brand font-bold text-sm hover:text-orange-600 transition-colors duration-300">
          REPLAY
          <PiArrowBendUpLeftFill className="text-lg" />
        </button>
      </div>
    </div>
  )
  
  export default CommentCard;