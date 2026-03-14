import { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Bell, 
  UserCircle, 
  Music, 
  Book, 
  Disc, 
  Filter,
  Grid,
  List,
  ChevronRight,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

import { categories } from '../data/mockData';
import vinilPadrao from '../assets/vinil_padrao.png';

const FALLBACK_IMAGE = vinilPadrao;

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortOrder, setSortOrder] = useState<'alphabetical' | 'newest' | 'oldest' | 'quantity'>('alphabetical');
  
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole');

  const [archiveItems, setArchiveItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAcervo = async () => {
      try {
        const response = await fetch('http://localhost:3333/api/acervo', {
          headers: {
            'x-api-key': '94mG8aD!@L8t!bV1nB7xZ$CapoeiraAcervoProd2026'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setArchiveItems(data);
        }
      } catch (error) {
        console.error('Erro ao buscar acervo:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAcervo();
  }, []);

  const handleExplore = (id: number) => {
    if (role) {
      navigate(`/record/${id}`);
    } else {
      navigate('/login', { state: { redirectTo: `/record/${id}` } });
    }
  };

  const filteredItems = archiveItems.filter(item => 
    selectedCategory === 'all' || item.type === selectedCategory
  ).sort((a, b) => {
    if (sortOrder === 'alphabetical') {
      return (a.title || '').localeCompare(b.title || '');
    }
    if (sortOrder === 'newest') {
      const yearDiff = (b.year || 0) - (a.year || 0);
      return yearDiff !== 0 ? yearDiff : (a.title || '').localeCompare(b.title || '');
    }
    if (sortOrder === 'oldest') {
      const yearDiff = (a.year || 0) - (b.year || 0);
      return yearDiff !== 0 ? yearDiff : (a.title || '').localeCompare(b.title || '');
    }
    if (sortOrder === 'quantity') {
      return (b.quantity || 1) - (a.quantity || 1);
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors duration-300">
      {/* Header removed from here to SPA Layout */}

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] mb-6">
              Preservando a <span className="text-primary italic">Herança da Ginga</span>
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 leading-relaxed">
              Explore o maior acervo digital de capoeira do mundo. Discos raros, manuscritos, fotos e áudios que contam a história da nossa resistência cultural.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Buscar por Mestre, Título ou Ano..." 
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none focus:ring-2 focus:ring-primary outline-none transition-all"
                />
              </div>
              <button className="px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
                Pesquisar
              </button>
            </div>
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 dark:opacity-20 pointer-events-none">
          <div className="w-full h-full bg-primary/20 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/4"></div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 py-4 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
            {categories.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.name}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 self-end md:self-center">
            <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-white/10 shadow-sm text-primary' : 'text-slate-400'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-white/10 shadow-sm text-primary' : 'text-slate-400'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            <div className="relative">
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-primary appearance-none pr-10 cursor-pointer transition-all"
              >
                <option value="alphabetical">Ordem: A - Z</option>
                <option value="newest">Data: Recentes</option>
                <option value="oldest">Data: Antigos</option>
                <option value="quantity">Quantidade</option>
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Grid Display */}
        {isLoading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-semibold">Carregando acervo direto do CosmosDB...</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map(item => (
              <div key={item.id} className="group bg-white dark:bg-white/5 flex flex-col rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-white/10 hover:shadow-[0_32px_64px_-16px_rgba(237,50,55,0.12)] transition-all duration-700 hover:-translate-y-2">
                <div className="aspect-[5/4] overflow-hidden relative">
                  <img 
                    src={item.image || FALLBACK_IMAGE} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out" 
                  />
                  <div className="absolute top-6 right-6 px-4 py-1.5 bg-black/40 backdrop-blur-xl rounded-full text-[10px] font-black text-white uppercase tracking-[0.2em] border border-white/20 shadow-2xl z-20">
                    {item.type}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                </div>

                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-lg uppercase tracking-wider">
                      {item.year || 'N/A'}
                    </span>
                    <span className="w-1.5 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full"></span>
                    <span className="text-xs font-bold text-slate-400 truncate">{item.author}</span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 leading-tight group-hover:text-primary transition-colors duration-300">
                    {item.title}
                  </h3>
                  
                  {item.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-8 font-medium leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-auto">
                    <button 
                      onClick={() => handleExplore(item.id)} 
                      className="w-full flex items-center justify-between pl-6 pr-4 py-4 bg-slate-50 dark:bg-white/5 rounded-2xl group/btn hover:bg-primary transition-all duration-500 overflow-hidden relative"
                    >
                      <span className="text-sm font-black group-hover/btn:text-white text-slate-700 dark:text-slate-300 tracking-tight z-10">Explorar Registro</span>
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center group-hover/btn:bg-white/20 transition-all z-10">
                        <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:text-white transition-all text-primary group-hover/btn:text-white" />
                      </div>
                      <div className="absolute inset-0 bg-primary translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-out"></div>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map(item => (
              <div key={item.id} className="flex flex-col md:flex-row gap-6 p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 hover:border-primary/30 transition-all">
                <div className="w-full md:w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden">
                  <img src={item.image || FALLBACK_IMAGE} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-[9px] font-black text-primary uppercase">{item.type}</span>
                    <span className="text-xs text-slate-400 font-medium">{item.year} • {item.author}</span>
                  </div>
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.description}</p>
                </div>
                <div className="flex items-center pr-4">
                  <button onClick={() => handleExplore(item.id)} className="px-6 py-2 bg-slate-100 rounded-full text-xs font-bold text-slate-700 hover:bg-primary hover:text-white transition-all">
                    Explorar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredItems.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold">Nenhum item encontrado</h3>
            <p className="text-slate-500 mt-2">O banco de dados ainda não tem itens ou seus filtros estão muito específicos.</p>
          </div>
        )}
      </main>

    </div>
  );
}
