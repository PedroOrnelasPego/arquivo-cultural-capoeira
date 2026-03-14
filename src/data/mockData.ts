import { Grid, Disc, Book, Music, History } from 'lucide-react';

export const categories = [
  { id: 'all', name: 'Todos', icon: Grid },
  { id: 'vinil', name: 'Discos de Vinil', icon: Disc },
  { id: 'livro', name: 'Livros', icon: Book },
  { id: 'audio', name: 'Áudios / CDs', icon: Music },
  { id: 'documento', name: 'Documentos', icon: History },
];

export const archiveItems = [
  {
    id: 1,
    title: 'Capoeira Regional de Bimba',
    author: 'Mestre Bimba',
    year: '1960',
    type: 'vinyl',
    image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?q=80&w=800&auto=format&fit=crop',
    description: 'Um marco na história da Capoeira Regional, contendo toques e cantigas originais.'
  },
  {
    id: 2,
    title: 'Capoeira Angola',
    author: 'Mestre Pastinha',
    year: '1964',
    type: 'book',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop',
    description: 'Manuscrito clássico que detalha os fundamentos e a filosofia da Capoeira Angola.'
  },
  {
    id: 3,
    title: 'Berimbaus da Bahia',
    author: 'Vários Mestres',
    year: '1975',
    type: 'vinyl',
    image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=800&auto=format&fit=crop',
    description: 'Coletânea de toques de berimbau gravados em Salvador.'
  },
  {
    id: 4,
    title: 'A Ginga do Brasil',
    author: 'Pesquisador Silva',
    year: '1992',
    type: 'audio',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
    description: 'Entrevistas e áudios históricos sobre a evolução da ginga.'
  },
  {
    id: 5,
    title: 'Fundamentos da Regional',
    author: 'Centro de Cultura Física',
    year: '1955',
    type: 'document',
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=800&auto=format&fit=crop',
    description: 'Documento original com as regras e fundamentos da Capoeira Regional.'
  },
  {
    id: 6,
    title: 'Cantigas de Roda',
    author: 'Grupo Senzala',
    year: '1980',
    type: 'vinyl',
    image: 'https://images.unsplash.com/photo-1539375665275-f9ad415ef9ac?q=80&w=800&auto=format&fit=crop',
    description: 'Gravação clássica de cantigas tradicionais de roda de capoeira.'
  }
];
