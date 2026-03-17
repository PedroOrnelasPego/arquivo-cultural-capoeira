import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { History, ChevronLeft, ChevronRight, Disc, Book, Music, Play, Pause, FileAudio, FileText, Info, LayoutDashboard } from 'lucide-react';
import vinilPadrao from '../assets/vinil_padrao.png';
import { API_BASE_URL, API_KEY } from '../config';

const FALLBACK_IMAGE = vinilPadrao;

export default function Record() {
  const { id } = useParams();
  const [item, setItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const location = useLocation();
  const isAdminView = location.pathname.startsWith('/admin');

  // FAKE STATE FOR PLAY BUTTON (ONLY UI DEMONSTRATION)
  const [playingTrackId, setPlayingTrackId] = useState<number | null>(null);
  
  // Carousel State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Modal State para Zoom
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/acervo`, {
          headers: {
            'x-api-key': API_KEY
          }
        });
        if (response.ok) {
          const data = await response.json();
          const found = data.find((d: any) => d.id === id);
          setItem(found);
        }
      } catch (error) {
        console.error('Erro ao buscar o registro detalhado:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecord();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-display">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-display">
        <History className="w-12 h-12 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Registro não encontrado</h2>
        <p className="text-slate-500 mb-6">O item solicitado pode ter sido excluído ou você não tem acesso.</p>
        <Link to="/" className="px-6 py-3 bg-primary text-white font-bold rounded-full hover:scale-105 transition-all">
          Voltar para o Acervo
        </Link>
      </div>
    );
  }

  // Define Category Icon
  const getIcon = (type: string) => {
    switch (type) {
      case 'vinil': return <Disc className="w-8 h-8" />;
      case 'audio': return <Music className="w-8 h-8" />;
      case 'livro': return <Book className="w-8 h-8" />;
      case 'documento': return <FileText className="w-8 h-8" />;
      default: return <History className="w-8 h-8" />;
    }
  };

  const tracksA = item.tracksA || [];
  const tracksB = item.tracksB || [];
  const allTracks = [...tracksA, ...tracksB];

  // Filtra as imagens que realmente existem no banco
  const images = [
    item.image, 
    item.backImage, 
    item.insertImage, 
    item.recordImage, 
    ...(item.exemplarImages || [])
  ].filter(Boolean) as string[];

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-display pb-24">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isAdminView ? (
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary transition-colors mb-8 bg-white px-5 py-2.5 rounded-full shadow-sm hover:shadow-md border border-primary/20">
            <LayoutDashboard className="w-4 h-4" />
            Voltar para o Painel Administrativo
          </Link>
        ) : (
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors mb-8 bg-white px-5 py-2.5 rounded-full shadow-sm hover:shadow-md border border-slate-100">
            <ChevronLeft className="w-4 h-4" />
            Voltar para o Acervo
          </Link>
        )}

        {/* Hero Banner do Registro */}
        <div className="bg-white rounded-[2rem] p-4 shadow-2xl shadow-slate-200/50 border border-slate-100 mb-8 overflow-hidden flex flex-col md:flex-row items-center gap-8">
          <div className="w-full md:w-1/3 aspect-square rounded-[1.5rem] overflow-hidden relative shadow-lg group">
            <img 
              src={images[currentImageIndex] || item.image || FALLBACK_IMAGE} 
              alt={item.title} 
              className="w-full h-full object-cover transition-opacity duration-500 ease-in-out cursor-zoom-in group-hover:scale-105 transition-transform duration-700" 
              onClick={() => setIsModalOpen(true)}
            />
            
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-widest border border-white/10 shadow-xl z-20">
              {item.type}
            </div>

            {/* Controle do Carrossel */}
            {images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute z-10 left-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 hover:bg-black/60 backdrop-blur-lg border border-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all shadow-2xl scale-90 hover:scale-100"
                >
                  <ChevronLeft className="w-6 h-6 mr-1" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute z-10 right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 hover:bg-black/60 backdrop-blur-lg border border-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all shadow-2xl scale-90 hover:scale-100"
                >
                  <ChevronRight className="w-6 h-6 ml-1" />
                </button>
                
                {/* Dots indicadores de paginação do Carrossel */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 bg-black/50 px-3 py-2 rounded-full backdrop-blur-md border border-white/10">
                  {images.map((_, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`h-2 rounded-full transition-all shadow-md ${
                        currentImageIndex === idx 
                          ? 'bg-white w-6 shadow-white/50' 
                          : 'bg-white/40 hover:bg-white/80 w-2'
                      }`}
                      aria-label={`Ver imagem ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          
          <div className="flex-1 py-4 pr-6 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-lg uppercase tracking-wider">
                ID #{item.shortId}
              </span>
              <span className="text-sm font-bold text-slate-400">{item.country || 'Brasil'}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2 tracking-tight">{item.title}</h1>
            <h2 className="text-xl md:text-2xl font-black text-primary mb-6">{item.author}</h2>
            
            <div className="flex flex-wrap gap-4 mt-auto">
              {item.year && (
                <div className="flex-1 min-w-[120px] p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Ano</span>
                  <span className="text-lg font-black text-slate-800">{item.year}</span>
                </div>
              )}
              {item.recordLabel && (
                <div className="flex-[2] min-w-[160px] p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Gravadora</span>
                  <span className="text-lg font-black text-slate-800 leading-tight break-words">{item.recordLabel}</span>
                </div>
              )}
              {item.quantity > 1 && (
                <div className="flex-1 min-w-[120px] p-4 bg-primary/5 rounded-2xl border border-primary/10 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">Exemplares</span>
                  <span className="text-lg font-black text-primary">{item.quantity}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {item.description && (
          <div className="bg-white rounded-[2rem] p-10 shadow-xl shadow-slate-200/30 border border-slate-100 mb-8">
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" /> Descrição Histórica
            </h3>
            <p className="text-slate-600 leading-relaxed font-medium">
              {item.description}
            </p>
          </div>
        )}

        {/* Player de Músicas */}
        {allTracks.length > 0 && (
          <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl shadow-slate-200/30 border border-slate-100 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
                <FileAudio className="w-5 h-5" />
              </div>
              Faixas de Áudio preservadas
            </h3>

            <div className="space-y-6 relative z-10">
              {tracksA.length > 0 && (
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-4">Lado A</h4>
                  <div className="space-y-2">
                    {tracksA.map((track: any, index: number) => (
                      <div key={track.id} className="group flex items-center gap-4 p-3 pr-6 bg-slate-50/80 hover:bg-slate-100 rounded-2xl transition-colors border border-transparent hover:border-slate-200">
                        <button 
                          disabled={!track.audioUrl}
                          onClick={() => setPlayingTrackId(playingTrackId === track.id ? null : track.id)}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                            !track.audioUrl 
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                            : playingTrackId === track.id 
                              ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105' 
                              : 'bg-white text-primary shadow-sm group-hover:bg-primary group-hover:text-white'
                          }`}
                          title={!track.audioUrl ? "Áudio ainda não disponível para esta faixa" : "Ouvir faixa"}
                        >
                          {playingTrackId === track.id ? (
                            <Pause className="w-5 h-5" />
                          ) : (
                            <div className="relative">
                              <Play className="w-5 h-5 ml-1" />
                              {!track.audioUrl && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-0.5 bg-slate-400 rotate-45"></div>}
                            </div>
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <h5 className={`font-bold truncate ${playingTrackId === track.id ? 'text-primary' : 'text-slate-800'}`}>{track.name || `Faixa ${index + 1}`}</h5>
                          <p className="text-xs font-semibold text-slate-400">
                            {track.artists || item.author}
                          </p>
                        </div>
                        <div className="text-sm font-bold text-slate-400 font-mono">
                          {track.duration || '--:--'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tracksB.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-4">Lado B</h4>
                  <div className="space-y-2">
                    {tracksB.map((track: any, index: number) => (
                      <div key={track.id} className="group flex items-center gap-4 p-3 pr-6 bg-slate-50/80 hover:bg-slate-100 rounded-2xl transition-colors border border-transparent hover:border-slate-200">
                        <button 
                          disabled={!track.audioUrl}
                          onClick={() => setPlayingTrackId(playingTrackId === track.id ? null : track.id)}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                            !track.audioUrl 
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                            : playingTrackId === track.id 
                              ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105' 
                              : 'bg-white text-primary shadow-sm group-hover:bg-primary group-hover:text-white'
                          }`}
                          title={!track.audioUrl ? "Áudio ainda não disponível para esta faixa" : "Ouvir faixa"}
                        >
                          {playingTrackId === track.id ? (
                            <Pause className="w-5 h-5" />
                          ) : (
                            <div className="relative">
                              <Play className="w-5 h-5 ml-1" />
                              {!track.audioUrl && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-0.5 bg-slate-400 rotate-45"></div>}
                            </div>
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <h5 className={`font-bold truncate ${playingTrackId === track.id ? 'text-primary' : 'text-slate-800'}`}>{track.name || `Faixa Lado B ${index + 1}`}</h5>
                          <p className="text-xs font-semibold text-slate-400">
                            {track.artists || item.author}
                          </p>
                        </div>
                        <div className="text-sm font-bold text-slate-400 font-mono">
                          {track.duration || '--:--'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Modal de Zoom da Imagem */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl"></div>
          
          <button 
            onClick={() => setIsModalOpen(false)}
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all border border-white/10 z-[110]"
          >
            <History className="w-6 h-6 rotate-45" /> {/* Usando History rotacionado ou X se eu importar */}
          </button>

          <img 
            src={images[currentImageIndex] || item.image || FALLBACK_IMAGE} 
            alt={item.title} 
            className="relative z-[105] max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-500"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Atalho para trocar imagem dentro do modal se houver mais de uma */}
          {images.length > 1 && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 z-[110]">
              <button 
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="w-14 h-14 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all border border-white/10"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <div className="text-white font-black text-lg tracking-widest bg-white/10 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md">
                {currentImageIndex + 1} / {images.length}
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="w-14 h-14 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all border border-white/10"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
