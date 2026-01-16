
import React, { useState, useEffect, useRef } from 'react';
import { Search, Music as MusicIcon, LayoutGrid, Heart, History, User, ShoppingCart, Info, Phone, Play, Pause, RotateCcw, Trash2, CreditCard, Video, Volume2, X } from 'lucide-react';
import { Music, Purchase } from './types';
import MusicCard from './components/MusicCard';
import PaymentModal from './components/PaymentModal';

const MOCK_DATA: Music[] = [
  { id: '1', title: 'Kizomba Nights', artist: 'Producer Pro', genre: 'Kizomba', price: 15000, coverUrl: 'https://picsum.photos/seed/kiz/400/400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', bpm: 95, key: 'Cm' },
  { id: '2', title: 'Afrobeat Vibe', artist: 'Dread Beats', genre: 'Afrobeat', price: 25000, coverUrl: 'https://picsum.photos/seed/afro/400/400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', bpm: 110, key: 'Am' },
  { id: '3', title: 'Semba Roots', artist: 'Ngola Beats', genre: 'Semba', price: 12000, coverUrl: 'https://picsum.photos/seed/semba/400/400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', bpm: 120, key: 'G' },
  { id: '4', title: 'Trap do Gueto', artist: 'LS Producer', genre: 'Trap', price: 30000, coverUrl: 'https://picsum.photos/seed/trap/400/400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', bpm: 140, key: 'D#m' },
  { id: '5', title: 'Kuduro Energy', artist: 'Viana Beats', genre: 'Kuduro', price: 10000, coverUrl: 'https://picsum.photos/seed/kud/400/400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', bpm: 135, key: 'E' },
  { id: '6', title: 'Ghetto Zouk Love', artist: 'Romantic Beats', genre: 'Ghetto Zouk', price: 18000, coverUrl: 'https://picsum.photos/seed/zouk/400/400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', bpm: 88, key: 'F' },
];

const PREVIEW_LIMIT = 20;

const App: React.FC = () => {
  const [tracks, setTracks] = useState<Music[]>(MOCK_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<Music | null>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<Purchase[]>([]);
  const [activeTab, setActiveTab] = useState<'store' | 'purchases'>('store');
  const [cartItem, setCartItem] = useState<Music | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Audio Player State
  const [activePreview, setActivePreview] = useState<Music | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (activePreview) {
      if (!audioRef.current) {
        audioRef.current = new Audio(activePreview.audioUrl);
      } else {
        audioRef.current.src = activePreview.audioUrl;
      }
      
      const audio = audioRef.current;
      audio.currentTime = 0;
      setProgress(0);
      
      const handleTimeUpdate = () => {
        const current = audio.currentTime;
        if (current >= PREVIEW_LIMIT) {
          audio.pause();
          audio.currentTime = 0;
          setIsPlaying(false);
          setProgress(PREVIEW_LIMIT);
        } else {
          setProgress(current);
        }
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
      };

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      
      audio.play().catch(console.error);
      setIsPlaying(true);

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
      };
    } else if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [activePreview]);

  const togglePlay = () => {
    if (!audioRef.current || !activePreview) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      if (audioRef.current.currentTime >= PREVIEW_LIMIT) {
        audioRef.current.currentTime = 0;
      }
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handlePreview = (track: Music) => {
    if (activePreview?.id === track.id) {
      togglePlay();
    } else {
      setActivePreview(track);
    }
  };

  const handleAddToCart = (track: Music) => {
    setCartItem(track);
    setIsCartOpen(true);
  };

  const removeFromCart = () => {
    setCartItem(null);
  };

  const filteredTracks = tracks.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePurchaseSuccess = (purchase: Purchase) => {
    // 1. Add to local history
    setPurchaseHistory(prev => [purchase, ...prev]);
    
    // 2. Clear cart
    setCartItem(null);
    
    // 3. IMPORTANT: Remove from available store tracks ("Sair do sistema/tela inicial")
    setTracks(prev => prev.filter(t => t.id !== purchase.musicId));
    
    // 4. Stop preview if buying the active track
    if (activePreview?.id === purchase.musicId) {
      setActivePreview(null);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row pb-24 text-[#b3b3b3]">
      {/* Sidebar - Spotify Dark Style */}
      <aside className="w-full md:w-64 bg-black md:h-screen sticky top-0 z-40 flex flex-col p-2 space-y-2">
        <div className="bg-[#121212] rounded-lg p-4 mb-2">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-yellow-500 p-1 rounded text-black">
              <MusicIcon size={16} />
            </div>
            <h1 className="text-white text-lg font-black tracking-tight">MUVUKA</h1>
          </div>
          
          <nav className="space-y-4">
            <button 
              onClick={() => setActiveTab('store')}
              className={`w-full flex items-center gap-4 text-sm font-bold transition-all hover:text-white ${activeTab === 'store' ? 'text-white' : ''}`}
            >
              <LayoutGrid size={24} />
              Início
            </button>
            <button 
              className="w-full flex items-center gap-4 text-sm font-bold transition-all hover:text-white"
            >
              <Search size={24} />
              Buscar
            </button>
          </nav>
        </div>

        <div className="flex-1 bg-[#121212] rounded-lg p-4 flex flex-col">
          <button 
            onClick={() => setActiveTab('purchases')}
            className={`w-full flex items-center gap-4 text-sm font-bold transition-all hover:text-white mb-6 ${activeTab === 'purchases' ? 'text-white' : ''}`}
          >
            <History size={24} />
            Minha Biblioteca
          </button>
          
          <div className="bg-[#242424] p-4 rounded-lg mb-4">
            <p className="text-white text-sm font-bold mb-1">Crie a sua primeira playlist</p>
            <p className="text-xs mb-4">É fácil, nós ajudamos você.</p>
            <button className="bg-white text-black text-xs font-bold px-4 py-2 rounded-full hover:scale-105 transition-transform">Criar playlist</button>
          </div>

          <div className="mt-auto pt-4 border-t border-white/5 flex items-center gap-3">
             <img src="https://picsum.photos/seed/user/100/100" alt="Avatar" className="w-8 h-8 rounded-full" />
             <div className="overflow-hidden">
                <p className="text-white text-xs font-bold truncate">Produtor Angola</p>
                <p className="text-[10px] truncate">Premium</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-gradient-to-b from-[#1a1a1a] to-[#121212] m-2 rounded-lg p-4 md:p-8">
        <header className="flex items-center justify-between gap-4 mb-8 sticky top-0 z-30 py-2">
          <div className="flex gap-2">
             <button className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white"><RotateCcw size={16} className="-scale-x-100" /></button>
             <button className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white"><RotateCcw size={16} /></button>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
             <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="O que você quer ouvir?" 
                  className="bg-[#242424] hover:bg-[#2a2a2a] border-none rounded-full py-2 pl-10 pr-4 text-white text-sm w-64 focus:ring-1 focus:ring-white transition-all outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             
             <button 
               onClick={() => setIsCartOpen(!isCartOpen)}
               className={`p-2 rounded-full transition-all relative ${isCartOpen ? 'bg-yellow-500 text-black' : 'bg-black/40 text-white hover:scale-105'}`}
             >
               <ShoppingCart size={18} />
               {cartItem && (
                 <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-black">1</span>
               )}
             </button>
             <button className="hidden md:block bg-white text-black font-bold px-6 py-2 rounded-full text-sm hover:scale-105 transition-transform">Ver planos</button>
          </div>
        </header>

        {activeTab === 'store' ? (
          <div className="space-y-12">
            {/* Promo Hero Section */}
            <div className="relative p-8 rounded-2xl overflow-hidden bg-gradient-to-r from-yellow-600/20 to-transparent border border-white/5">
              <div className="relative z-10">
                <p className="text-white text-[10px] font-black uppercase tracking-widest mb-4">Promovido</p>
                <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight max-w-2xl">Batidas que definem o ritmo de Angola.</h2>
                <div className="flex gap-4">
                  <button className="bg-yellow-500 text-black font-bold px-8 py-3 rounded-full hover:scale-105 transition-all text-sm">Explorar Agora</button>
                  <button className="bg-transparent text-white border border-white/20 font-bold px-8 py-3 rounded-full hover:bg-white/5 transition-all text-sm">Saiba Mais</button>
                </div>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-30 pointer-events-none">
                <img src="https://picsum.photos/seed/beats/600/400" alt="" className="h-full w-full object-cover rounded-l-full" />
              </div>
            </div>

            {/* LIVE STREAMING */}
            <section className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-xl font-bold hover:underline cursor-pointer">Sessões ao Vivo Muvuka</h3>
                <span className="text-xs font-bold hover:underline cursor-pointer">Mostrar tudo</span>
              </div>
              
              <div className="bg-[#121212] rounded-xl p-3 border border-white/5 hover:bg-[#1a1a1a] transition-colors group">
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-black relative">
                  <iframe 
                    className="w-full h-full"
                    src="https://vdo.ninja/?view=g5Se4bN" 
                    title="Live Stream" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                  ></iframe>
                  <div className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                    AO VIVO
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between px-1">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-black font-black text-xs">M</div>
                      <div>
                        <p className="text-white font-bold text-sm group-hover:underline">Workshop de Produção Musical</p>
                        <p className="text-xs">Muvuka Academy • 2.4k ouvintes</p>
                      </div>
                   </div>
                   <button className="p-2 text-white hover:text-yellow-500 transition-colors">
                      <Video size={20} />
                   </button>
                </div>
              </div>
            </section>

            {/* Catalog Grid */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white text-xl font-bold hover:underline cursor-pointer">Novos Instrumentais</h3>
                <span className="text-xs font-bold hover:underline cursor-pointer">Mostrar tudo</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {filteredTracks.map(track => (
                  <MusicCard 
                    key={track.id} 
                    track={track} 
                    isActive={activePreview?.id === track.id}
                    onPurchase={handleAddToCart}
                    onPreview={handlePreview}
                  />
                ))}
              </div>
              {filteredTracks.length === 0 && (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                   <p className="text-gray-500 text-sm italic">Todos os beats actuais foram adquiridos!</p>
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-white text-2xl font-bold mb-8">O Meu Histórico de Compras</h2>
            {purchaseHistory.length === 0 ? (
              <div className="bg-[#121212] rounded-3xl p-12 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <History className="text-gray-600" size={32} />
                </div>
                <h3 className="text-white text-lg font-bold mb-2">Ainda não há nada por aqui</h3>
                <p className="text-sm text-gray-400 mb-6">Explore a nossa loja e adquira o seu primeiro instrumental musical.</p>
                <button 
                  onClick={() => setActiveTab('store')}
                  className="bg-white text-black px-8 py-2.5 rounded-full font-bold hover:scale-105 transition-all text-sm"
                >
                  Ir para a Loja
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="grid grid-cols-12 px-4 py-2 text-[10px] uppercase font-bold text-gray-500 border-b border-white/5 mb-2">
                   <div className="col-span-1">#</div>
                   <div className="col-span-6">Título</div>
                   <div className="col-span-3 text-right">Referência</div>
                   <div className="col-span-2 text-right">Acções</div>
                </div>
                {purchaseHistory.map((p, index) => {
                  // Important: Look for track in MOCK_DATA since it might have been removed from the 'tracks' state
                  const track = MOCK_DATA.find(t => t.id === p.musicId);
                  return (
                    <div key={p.id} className="grid grid-cols-12 items-center px-4 py-3 rounded-lg hover:bg-white/5 group transition-colors">
                      <div className="col-span-1 text-sm">{index + 1}</div>
                      <div className="col-span-6 flex items-center gap-3 overflow-hidden">
                        <img src={track?.coverUrl} className="w-10 h-10 rounded shadow-lg" alt="" />
                        <div className="overflow-hidden">
                          <h4 className="text-white font-bold text-sm truncate">{track?.title}</h4>
                          <p className="text-xs truncate">{track?.artist}</p>
                        </div>
                      </div>
                      <div className="col-span-3 text-right text-xs font-mono">
                         <span className="text-yellow-500">{p.amount.toLocaleString('pt-AO')} AOA</span>
                         <p className="text-[9px] text-gray-500">{p.reference}</p>
                      </div>
                      <div className="col-span-2 text-right">
                        <button 
                          onClick={() => {
                             const link = document.createElement('a');
                             link.href = track?.audioUrl || '#';
                             link.download = `${track?.title}.mp3`;
                             link.click();
                          }}
                          className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all text-white"
                        >
                          <CreditCard size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <footer className="mt-24 pt-12 border-t border-white/5 grid grid-cols-1 md:grid-cols-4 gap-8 pb-12">
          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm">Muvuka Music</h4>
            <ul className="text-xs space-y-2">
              <li className="hover:text-white cursor-pointer">Sobre</li>
              <li className="hover:text-white cursor-pointer">Trabalhos</li>
              <li className="hover:text-white cursor-pointer">For the Record</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm">Comunidade</h4>
            <ul className="text-xs space-y-2">
              <li className="hover:text-white cursor-pointer">Para Produtores</li>
              <li className="hover:text-white cursor-pointer">Desenvolvedores</li>
              <li className="hover:text-white cursor-pointer">Publicidade</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm">Links Úteis</h4>
            <ul className="text-xs space-y-2">
              <li className="hover:text-white cursor-pointer">Suporte</li>
              <li className="hover:text-white cursor-pointer">App Web</li>
              <li className="hover:text-white cursor-pointer">Termos de Uso</li>
            </ul>
          </div>
          <div className="flex gap-4">
             <div className="w-8 h-8 rounded-full bg-[#242424] flex items-center justify-center hover:bg-[#3e3e3e] cursor-pointer text-white"><Phone size={14} /></div>
             <div className="w-8 h-8 rounded-full bg-[#242424] flex items-center justify-center hover:bg-[#3e3e3e] cursor-pointer text-white"><User size={14} /></div>
             <div className="w-8 h-8 rounded-full bg-[#242424] flex items-center justify-center hover:bg-[#3e3e3e] cursor-pointer text-white"><Info size={14} /></div>
          </div>
        </footer>
      </main>

      {/* Cart Drawer - Smaller width (w-64) */}
      {isCartOpen && (
        <div className="fixed top-0 right-0 bottom-0 w-64 bg-[#0a0a0a] z-50 shadow-2xl animate-in slide-in-from-right duration-300 border-l border-white/10 flex flex-col p-4">
          <div className="p-2 flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-base flex items-center gap-2">
              <ShoppingCart size={18} className="text-yellow-500" />
              Carrinho
            </h3>
            <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-full transition-colors">
              <X size={18} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-2">
            {!cartItem ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <ShoppingCart size={32} className="text-gray-800 mb-3" />
                <p className="text-white font-bold text-sm mb-1">Vazio</p>
                <p className="text-[10px] text-gray-500">Adicione beats aqui.</p>
              </div>
            ) : (
              <div className="bg-[#121212] p-3 rounded-xl border border-white/5 mb-4">
                <img src={cartItem.coverUrl} className="w-full aspect-square rounded-lg mb-3 shadow-lg object-cover" alt="" />
                <h4 className="text-white font-bold text-sm truncate">{cartItem.title}</h4>
                <p className="text-[10px] text-gray-500 mb-3 truncate">{cartItem.artist}</p>
                <div className="flex justify-between items-center border-t border-white/5 pt-3">
                  <span className="text-yellow-500 font-bold text-xs">{cartItem.price.toLocaleString('pt-AO')} AOA</span>
                  <button onClick={removeFromCart} className="text-gray-500 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {cartItem && (
            <div className="mt-4 pt-4 border-t border-white/5 space-y-3 px-2">
               <div className="flex justify-between text-white text-xs font-bold">
                 <span className="text-gray-500">Total</span>
                 <span>{cartItem.price.toLocaleString('pt-AO')} AOA</span>
               </div>
               <button 
                onClick={() => { setSelectedTrack(cartItem); setIsCartOpen(false); }}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-black py-3 rounded-full transition-all text-[11px] uppercase tracking-wider shadow-lg shadow-yellow-500/10 active:scale-95 flex items-center justify-center gap-2"
               >
                <CreditCard size={14} />
                Pagar Agora
               </button>
            </div>
          )}
        </div>
      )}

      {/* Spotify-Style Player Bar */}
      <div className={`fixed bottom-0 left-0 right-0 bg-black border-t border-white/5 px-4 h-20 z-50 transition-transform duration-500 ${activePreview ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="h-full max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
          
          {/* Info Side */}
          <div className="flex items-center gap-4 w-1/4">
            <img src={activePreview?.coverUrl} className="w-12 h-12 rounded shadow-lg" alt="" />
            <div className="overflow-hidden hidden sm:block">
              <h4 className="text-white text-sm font-bold truncate hover:underline cursor-pointer">{activePreview?.title}</h4>
              <p className="text-[10px] truncate hover:underline cursor-pointer">{activePreview?.artist}</p>
            </div>
            <Heart size={16} className="text-gray-400 hover:text-yellow-500 cursor-pointer transition-colors" />
          </div>

          {/* Player Controls */}
          <div className="flex-1 flex flex-col items-center max-w-xl">
            <div className="flex items-center gap-6 mb-1">
              <RotateCcw size={16} className="text-gray-400 hover:text-white cursor-pointer" />
              <button 
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-transform"
              >
                {isPlaying ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" className="ml-0.5" />}
              </button>
              <RotateCcw size={16} className="-scale-x-100 text-gray-400 hover:text-white cursor-pointer" />
            </div>
            <div className="w-full flex items-center gap-2">
               <span className="text-[9px] font-mono w-8 text-right">0:{Math.floor(progress).toString().padStart(2, '0')}</span>
               <div className="flex-1 h-1 bg-[#4d4d4d] rounded-full group cursor-pointer relative">
                  <div 
                    className="h-full bg-yellow-500 group-hover:bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${(progress / PREVIEW_LIMIT) * 100}%` }}
                  ></div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-lg"></div>
               </div>
               <span className="text-[9px] font-mono w-8">0:{PREVIEW_LIMIT}</span>
            </div>
          </div>

          {/* Options Side */}
          <div className="flex items-center justify-end gap-3 w-1/4">
             <button className="text-gray-400 hover:text-white"><LayoutGrid size={16} /></button>
             <button className="text-gray-400 hover:text-white hidden md:block"><Volume2 size={16} /></button>
             <div className="w-24 h-1 bg-[#4d4d4d] rounded-full hidden md:block">
                <div className="w-2/3 h-full bg-white rounded-full hover:bg-yellow-500 transition-colors"></div>
             </div>
             <button 
               onClick={() => activePreview && handleAddToCart(activePreview)}
               className="bg-yellow-500 text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase hover:scale-105 transition-transform"
             >
               Comprar
             </button>
             {/* Exit/Close Icon for Player Bar */}
             <button 
               onClick={() => setActivePreview(null)}
               className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
               title="Fechar Player"
             >
               <X size={18} />
             </button>
          </div>
        </div>
      </div>

      {selectedTrack && (
        <PaymentModal 
          track={selectedTrack} 
          onClose={() => setSelectedTrack(null)} 
          onSuccess={handlePurchaseSuccess}
        />
      )}
    </div>
  );
};

export default App;
