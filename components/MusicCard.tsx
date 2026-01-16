
import React from 'react';
import { Play, ShoppingCart } from 'lucide-react';
import { Music } from '../types';

interface MusicCardProps {
  track: Music;
  onPurchase: (track: Music) => void;
  onPreview: (track: Music) => void;
  isActive?: boolean;
}

const MusicCard: React.FC<MusicCardProps> = ({ track, onPurchase, onPreview, isActive }) => {
  return (
    <div className={`glass rounded-xl p-4 overflow-hidden hover:bg-white/10 transition-all duration-300 group flex flex-col ${isActive ? 'bg-white/10 ring-1 ring-yellow-500/50' : ''}`}>
      <div className="relative aspect-square mb-4 shadow-2xl">
        <img 
          src={track.coverUrl} 
          alt={track.title} 
          className="w-full h-full object-cover rounded-lg shadow-black/40 shadow-lg"
        />
        {/* Spotify-style play button: positioned bottom-right of the image on hover */}
        <button 
          onClick={() => onPreview(track)}
          className={`absolute bottom-2 right-2 flex items-center justify-center transition-all duration-300 transform translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 ${isActive ? 'opacity-100 translate-y-0' : ''}`}
        >
          <div className="bg-yellow-500 p-3 rounded-full text-black shadow-xl hover:scale-105 active:scale-95 transition-transform">
            <Play fill="black" size={20} className={isActive ? 'animate-pulse' : ''} />
          </div>
        </button>
      </div>
      
      <div className="flex flex-col flex-1">
        <h3 className="font-bold text-base truncate mb-1 text-white">{track.title}</h3>
        <p className="text-gray-400 text-sm mb-3 truncate hover:underline cursor-pointer">{track.artist}</p>
        
        <div className="flex flex-wrap gap-1.5 text-[9px] text-gray-400 mb-4 mt-auto">
          <span className="bg-white/5 border border-white/5 px-2 py-0.5 rounded uppercase font-medium">{track.genre}</span>
          <span className="bg-white/5 border border-white/5 px-2 py-0.5 rounded">{track.bpm} BPM</span>
        </div>

        <div className="flex items-center justify-between border-t border-white/5 pt-3">
          <div className="flex flex-col">
            <span className="text-[9px] text-gray-500 uppercase font-black tracking-tighter">Preço</span>
            <span className="text-yellow-500 font-bold text-sm">
              {track.price.toLocaleString('pt-AO')} AOA
            </span>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onPurchase(track);
            }}
            className="flex items-center justify-center w-8 h-8 bg-white/5 hover:bg-yellow-500 text-white hover:text-black rounded-full transition-all border border-white/10 hover:border-yellow-500 active:scale-90"
            title="Adicionar ao Carrinho"
          >
            <ShoppingCart size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicCard;
