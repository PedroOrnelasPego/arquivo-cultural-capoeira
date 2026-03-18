import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  History, Search, PlusSquare, Tags, Plus, Pencil, Trash2, LayoutDashboard, 
  List, Info, Upload, Disc, ChevronRight, Music4, CheckCircle2, AlertCircle, X,
  Music, Settings, Image as ImageIcon
} from 'lucide-react';

import { categories } from '../data/mockData';
import vinilPadrao from '../assets/vinil_padrao.png';
import { API_BASE_URL, API_KEY } from '../config';

const FALLBACK_IMAGE = vinilPadrao;

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'new' | 'categories' | 'settings'>('overview');
  const [category, setCategory] = useState('vinil');

  const [archiveItems, setArchiveItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [countries, setCountries] = useState<string[]>(['Brasil']);

  const fetchAcervo = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/acervo`, {
        headers: {
          'x-api-key': API_KEY
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

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchAcervo();
    }
  }, [activeTab]);

  const handleDelete = (id: string, shortId: string) => {
    setDeleteConfirm({ id, shortId, visible: true });
  };

  const confirmDelete = async () => {
    const { id, shortId } = deleteConfirm;
    setDeleteConfirm(prev => ({ ...prev, visible: false }));
    try {
      const response = await fetch(`http://localhost:3333/api/acervo/${id}`, {
        method: 'DELETE',
        headers: {
          'x-api-key': '94mG8aD!@L8t!bV1nB7xZ$CapoeiraAcervoProd2026'
        }
      });

      if (response.ok) {
        showNotification(`Item #${shortId} excluído com sucesso!`);
        fetchAcervo(); 
      } else {
        showNotification('Erro ao excluir o item no banco de dados.', 'error');
      }
    } catch (error) {
      console.error('Erro na exclusão:', error);
      showNotification('Falha na comunicação com o servidor ao excluir.', 'error');
    }
  };

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name');
        if (response.ok) {
          const data = await response.json();
          // Pegar o nome em português (se não tiver usamos o comun)
          const countryNames = data.map((c: any) => c.name.nativeName?.por?.common || c.name.common)
                                   .filter((name: string) => name !== 'Brazil' && name !== 'Brasil')
                                   .sort();
          setCountries(['Brasil', ...countryNames]);
        }
      } catch (error) {
        console.error('Erro ao buscar países:', error);
      }
    };
    fetchCountries();
  }, []);

  // Form States
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [recordLabel, setRecordLabel] = useState('');
  const [country, setCountry] = useState('Brasil');
  const [year, setYear] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRevised, setIsRevised] = useState(false);
  
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [insertImage, setInsertImage] = useState<File | null>(null);
  const [recordImage, setRecordImage] = useState<File | null>(null);
  const [exemplarsMedia, setExemplarsMedia] = useState<{
    cover: File | null;
    back: File | null;
    insert: File | null;
    record: File | null;
  }[]>([]);

  // Estados para URLs de imagens que já existem no banco (para edição)
  const [existingImages, setExistingImages] = useState<{
    cover?: string | null;
    back?: string | null;
    insert?: string | null;
    record?: string | null;
    exemplars?: { cover: string | null, back: string | null, insert: string | null, record: string | null }[];
  }>({});

  const [tracksA, setTracksA] = useState([{ id: Date.now(), side: 'A', name: '', artists: '', duration: '', audioFile: null as File | null }]);
  const [tracksB, setTracksB] = useState([] as { id: number, side: string, name: string, artists: string, duration: string, audioFile: File | null }[]);
  
  const [categoriesList, setCategoriesList] = useState(categories);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'revised' | 'non_revised'>('all');

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'alphabetical' | 'quantity'>('newest');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error', visible: boolean}>({
    message: '',
    type: 'success',
    visible: false
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{id: string, shortId: string, visible: boolean}>({
    id: '',
    shortId: '',
    visible: false
  });

  const [imageDeleteConfirm, setImageDeleteConfirm] = useState<{
    url: string, 
    field: string, 
    index?: number, 
    visible: boolean
  }>({
    url: '',
    field: '',
    visible: false
  });

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type, visible: true });
    setTimeout(() => setNotification(prev => ({ ...prev, visible: false })), 4000);
  };

  const filteredItems = archiveItems.filter(item => {
    const term = searchQuery.toLowerCase();
    const titleMatch = item.title?.toLowerCase().includes(term);
    const authorMatch = item.author?.toLowerCase().includes(term);
    const idMatch = item.id?.toLowerCase().includes(term);
    const shortIdMatch = item.shortId?.toLowerCase().includes(term);
    const yearMatch = item.year?.toString().includes(term);
    
    const matchesSearch = titleMatch || authorMatch || idMatch || shortIdMatch || yearMatch;
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'revised' && item.revised) || 
                         (filterStatus === 'non_revised' && !item.revised);
    
    return matchesSearch && matchesType && matchesStatus;
  }).sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
    if (sortOrder === 'alphabetical') {
      return (a.title || '').localeCompare(b.title || '');
    }
    if (sortOrder === 'quantity') {
      return (b.quantity || 1) - (a.quantity || 1);
    }
    return 0;
  });

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      setCategoriesList([...categoriesList, {
        id: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
        name: newCategoryName,
        icon: Tags // Default fallback icon
      }]);
      setNewCategoryName('');
    }
  };

  const loadForEdit = (item: any) => {
    setEditingId(item.id);
    setCategory(item.type);
    setTitle(item.title || '');
    setAuthor(item.author || '');
    setYear(item.year ? item.year.toString() : '');
    setQuantity(item.quantity || 1);
    setDescription(item.description || '');
    setRecordLabel(item.recordLabel || '');
    setCountry(item.country || 'Brasil');
    setIsRevised(item.revised || false);
    
    // As imagens que já existem permanecem como NULL nos Files (não reupamos), 
    // Manteemos visualmente se quisermos na URL, mas se não enviar imagem nova a rota PUT mantém a antiga.
    setCoverImage(null);
    setBackImage(null);
    setInsertImage(null);
    setRecordImage(null);
    setExemplarsMedia([]);

    // Armazenamos as URLs existentes para mostrar a miniatura e permitir excluir
    const groupedExemplars = [];
    if (item.exemplarImages) {
      for (let i = 0; i < item.exemplarImages.length; i += 4) {
        groupedExemplars.push({
          cover: item.exemplarImages[i] || null,
          back: item.exemplarImages[i+1] || null,
          insert: item.exemplarImages[i+2] || null,
          record: item.exemplarImages[i+3] || null
        });
      }
    }

    setExistingImages({
      cover: item.image,
      back: item.backImage,
      insert: item.insertImage,
      record: item.recordImage,
      exemplars: groupedExemplars
    });

    // Carrega faixas se existirem (adaptando urls, mas File permanece null se n enviar nova musica)
    if (item.tracksA && item.tracksA.length > 0) {
      setTracksA(item.tracksA.map((t: any) => ({...t, audioFile: null})));
      setTrackCountA(item.tracksA.length.toString());
    }
    if (item.tracksB && item.tracksB.length > 0) {
      setTracksB(item.tracksB.map((t: any) => ({...t, audioFile: null})));
      setTrackCountB(item.tracksB.length.toString());
    }

    setActiveTab('new');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 1. ORGANIZAR OS ARQUIVOS E FAZER O UPLOAD (SE HOUVEREM)
      const allFilesToUpload: { original: File, type: string, id?: number }[] = [];
      if (coverImage) allFilesToUpload.push({ original: coverImage, type: 'cover' });
      if (backImage) allFilesToUpload.push({ original: backImage, type: 'back' });
      if (insertImage) allFilesToUpload.push({ original: insertImage, type: 'insert' });
      if (recordImage) allFilesToUpload.push({ original: recordImage, type: 'record' });
      
      // Prepare final URLs with existing database values (to support partial edits)
      const finalUrls: Record<string, any> = { 
        coverImage: existingImages.cover || null,
        backImage: existingImages.back || null,
        insertImage: existingImages.insert || null,
        recordImage: existingImages.record || null,
        // Clona os exemplares existentes para atualizar apenas os alterados
        exemplarsData: existingImages.exemplars ? JSON.parse(JSON.stringify(existingImages.exemplars)) : []
      };

      // Garante que o array de exemplares tenha slots suficientes para a quantidade selecionada
      if (quantity > 1) {
        while (finalUrls.exemplarsData.length < quantity - 1) {
          finalUrls.exemplarsData.push({ cover: null, back: null, insert: null, record: null });
        }
      }

      exemplarsMedia.forEach((ex, idx) => {
        if (ex.cover) allFilesToUpload.push({ original: ex.cover, type: `exemplar_${idx}_cover` });
        if (ex.back) allFilesToUpload.push({ original: ex.back, type: `exemplar_${idx}_back` });
        if (ex.insert) allFilesToUpload.push({ original: ex.insert, type: `exemplar_${idx}_insert` });
        if (ex.record) allFilesToUpload.push({ original: ex.record, type: `exemplar_${idx}_record` });
      });

      tracksA.forEach(t => { if (t.audioFile) allFilesToUpload.push({ original: t.audioFile, type: 'trackA', id: t.id }); });
      tracksB.forEach(t => { if (t.audioFile) allFilesToUpload.push({ original: t.audioFile, type: 'trackB', id: t.id }); });

      // finalUrls já foi inicializado acima com existingImages para suportar exclusões

      if (allFilesToUpload.length > 0) {
        const formData = new FormData();
        formData.append('category', category);
        allFilesToUpload.forEach(f => formData.append('arquivos', f.original));

        const uploadRes = await fetch(`${API_BASE_URL}/api/uploads`, {
          method: 'POST',
          headers: {
            'x-api-key': API_KEY
          },
          body: formData
        });

        if (!uploadRes.ok) throw new Error('Falha no upload das mídias para a Nuvem.');
        
        const uploadData = await uploadRes.json();
        
        // Mapear as URLs de volta para os arquivos originais
        uploadData.files.forEach((uploadedFile: any, index: number) => {
          const fileRef = allFilesToUpload[index];
          if (fileRef.type === 'cover') finalUrls.coverImage = uploadedFile.url;
          if (fileRef.type === 'back') finalUrls.backImage = uploadedFile.url;
          if (fileRef.type === 'insert') finalUrls.insertImage = uploadedFile.url;
          if (fileRef.type === 'record') finalUrls.recordImage = uploadedFile.url;
          
          if (fileRef.type.startsWith('exemplar_')) {
            const parts = fileRef.type.split('_');
            const exIdx = parseInt(parts[1], 10);
            const key = parts[2];
            // Atualiza o slot específico do exemplar com a nova URL da nuvem
            if (finalUrls.exemplarsData[exIdx]) {
              finalUrls.exemplarsData[exIdx][key] = uploadedFile.url;
            }
          }

          if (fileRef.type === 'trackA') finalUrls[`trackA_${fileRef.id}`] = uploadedFile.url;
          if (fileRef.type === 'trackB') finalUrls[`trackB_${fileRef.id}`] = uploadedFile.url;
        });
      }

      // 2. FORMATAR AS FAIXAS (INCLUINDO AS URLs DE ÁUDIO AGORA QUE PODEM TER VINDO DO BANCO OU SEREM NOVAS) E PREPARAR PAYLOAD FINAL
      // existingItem já foi definido no início da função

      const formattedTracksA = tracksA.map((t: any, idx) => ({ 
        id: t.id.toString(), side: t.side, order: idx + 1, name: t.name, artists: t.artists || author, duration: t.duration, 
        audioUrl: finalUrls[`trackA_${t.id}`] || t.audioUrl || null 
      }));
      const formattedTracksB = tracksB.map((t: any, idx) => ({ 
        id: t.id.toString(), side: t.side, order: idx + 1, name: t.name, artists: t.artists || author, duration: t.duration, 
        audioUrl: finalUrls[`trackB_${t.id}`] || t.audioUrl || null 
      }));

      const payload = {
        type: category,
        quantity: Number(quantity),
        title,
        author,
        recordLabel,
        country,
        year: year ? parseInt(year, 10) : null,
        description,
        image: finalUrls.coverImage,
        backImage: finalUrls.backImage,
        insertImage: finalUrls.insertImage,
        recordImage: finalUrls.recordImage,
        // Flat array mantendo a estrutura de 4 slots em sequência: [C1, V1, E1, D1, C2, V2, E2, D2...]
        exemplarImages: finalUrls.exemplarsData.flatMap((ex: any) => [
          ex.cover || null,
          ex.back || null,
          ex.insert || null,
          ex.record || null
        ]),
        tracksA: category === 'vinil' ? formattedTracksA : [],
        tracksB: category === 'vinil' ? formattedTracksB : [],
        revised: isRevised
      };

      // 3. ENVIAR PARA O COSMOS DB (POST ou PUT)
      const url = editingId ? `${API_BASE_URL}/api/vinis/${editingId}` : `${API_BASE_URL}/api/vinis`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Falha ao comunicar no servidor.');

      showNotification(`Item histórico ${editingId ? 'atualizado' : 'registrado'} com sucesso no Acervo!`);
      
      // RESET FORM
      setTitle('');
      setAuthor('');
      setYear('');
      setQuantity(1);
      setDescription('');
      setRecordLabel('');
      setCoverImage(null);
      setBackImage(null);
      setInsertImage(null);
      setRecordImage(null);
      setExemplarsMedia([]);
      setIsRevised(false);
      setTracksA([{ id: Date.now(), side: 'A', name: '', artists: '', duration: '', audioFile: null }]);
      setTracksB([]);
      setEditingId(null);
      setActiveTab('overview');
      fetchAcervo(); 
    } catch (error) {
      console.error(error);
      showNotification('Erro ao registrar item. Verifique os uploads e o servidor.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const categoryLabels: Record<string, string> = {
    vinil: 'Disco de Vinil',
    livro: 'Livro / Publicação',
    instrumento: 'Instrumento Musical',
    documento: 'Documento Histórico'
  };

  const [trackCountA, setTrackCountA] = useState('1');
  const [trackCountB, setTrackCountB] = useState('0');

  const handleTrackCountBlurA = () => {
    let val = parseInt(trackCountA, 10);
    if (isNaN(val) || val < 0) {
      val = tracksA.length;
      setTrackCountA(val.toString());
    } else {
      if (val > tracksA.length) {
        const newTracks = Array.from({ length: val - tracksA.length }).map((_, i) => ({ id: Date.now() + i, side: 'A', name: '', artists: '', duration: '', audioFile: null }));
        setTracksA(prev => [...prev, ...newTracks]);
      } else if (val < tracksA.length) {
        setTracksA(prev => prev.slice(0, val));
      }
      setTrackCountA(val.toString());
    }
  };

  const handleTrackCountBlurB = () => {
    let val = parseInt(trackCountB, 10);
    if (isNaN(val) || val < 0) {
      val = tracksB.length;
      setTrackCountB(val.toString());
    } else {
      if (val > tracksB.length) {
        const newTracks = Array.from({ length: val - tracksB.length }).map((_, i) => ({ id: Date.now() + 1000 + i, side: 'B', name: '', artists: '', duration: '', audioFile: null }));
        setTracksB(prev => [...prev, ...newTracks]);
      } else if (val < tracksB.length) {
        setTracksB(prev => prev.slice(0, val));
      }
      setTrackCountB(val.toString());
    }
  };

  const updateTrackA = (id: number, field: string, value: any) => setTracksA(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  const updateTrackB = (id: number, field: string, value: any) => setTracksB(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));

  const handleTimeFormat = (val: string) => {
    let digits = val.replace(/\D/g, '');
    if (digits.length > 4) digits = digits.slice(0, 4);
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}:${digits.slice(2)}`;
    }
    return digits;
  };

  const removeTrackA = (id: number) => {
    setTracksA(prev => {
      const filtered = prev.filter(t => t.id !== id);
      setTrackCountA(filtered.length.toString());
      return filtered;
    });
  };

  const removeTrackB = (id: number) => {
    setTracksB(prev => {
      const filtered = prev.filter(t => t.id !== id);
      setTrackCountB(filtered.length.toString());
      return filtered;
    });
  };

  const triggerImageDeletion = (url: string | null | undefined, field: string, index?: number) => {
    if (!url) {
      // Se n tem URL, apenas limpa o estado local (caso de arquivo recém selecionado)
      if (index !== undefined) {
        const newMedia = [...exemplarsMedia];
        if (newMedia[index]) newMedia[index][field as keyof typeof newMedia[0]] = null;
        setExemplarsMedia(newMedia);

        const newExisting = [...(existingImages.exemplars || [])];
        if (newExisting[index]) newExisting[index][field as keyof typeof newExisting[0]] = null;
        setExistingImages(prev => ({ ...prev, exemplars: newExisting }));
      } else {
        if (field === 'cover') setCoverImage(null);
        if (field === 'back') setBackImage(null);
        if (field === 'insert') setInsertImage(null);
        if (field === 'record') setRecordImage(null);
        setExistingImages(prev => ({ ...prev, [field]: null }));
      }
      return;
    }
    
    // Se tem URL, abre o modal de confirmação para apagar da nuvem
    setImageDeleteConfirm({ url, field, index, visible: true });
  };

  const handleDeleteImagePermanent = async () => {
    const { url, field, index } = imageDeleteConfirm;
    setIsSubmitting(true);
    
    try {
      // 1. Deleta do Azure
      const delRes = await fetch(`${API_BASE_URL}/api/uploads`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify({ url })
      });

      if (!delRes.ok) throw new Error('Falha ao excluir do Azure Storage');

      // 2. Limpa localmente
      let updatedExemplars: any[] | undefined = undefined;
      
      if (index !== undefined) {
        const newMedia = [...exemplarsMedia];
        if (newMedia[index]) newMedia[index][field as keyof typeof newMedia[0]] = null;
        setExemplarsMedia(newMedia);

        updatedExemplars = [...(existingImages.exemplars || [])];
        if (updatedExemplars[index]) updatedExemplars[index][field as keyof typeof updatedExemplars[0]] = null;
        setExistingImages(prev => ({ ...prev, exemplars: updatedExemplars }));
      } else {
        if (field === 'cover') { setCoverImage(null); setExistingImages(prev => ({ ...prev, cover: null })); }
        if (field === 'back') { setBackImage(null); setExistingImages(prev => ({ ...prev, back: null })); }
        if (field === 'insert') { setInsertImage(null); setExistingImages(prev => ({ ...prev, insert: null })); }
        if (field === 'record') { setRecordImage(null); setExistingImages(prev => ({ ...prev, record: null })); }
      }

      // 3. SE ESTAMOS EDITANDO, ATUALIZAR O BANCO DE DADOS IMEDIATAMENTE
      if (editingId) {
        // Preparamos o payload de atualização rápida
        const updatePayload: any = {};
        if (index !== undefined && updatedExemplars) {
          // Flat array mantendo a estrutura de 4 slots [C, V, E, D]
          updatePayload.exemplarImages = updatedExemplars.flatMap(ex => [
            ex.cover || null,
            ex.back || null,
            ex.insert || null,
            ex.record || null
          ]);
        } else {
          // Para imagens principais
          const fieldMap: Record<string, string> = {
            'cover': 'image',
            'back': 'backImage',
            'insert': 'insertImage',
            'record': 'recordImage'
          };
          updatePayload[fieldMap[field] || field] = null;
        }

        const putRes = await fetch(`${API_BASE_URL}/api/vinis/${editingId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
          },
          body: JSON.stringify(updatePayload)
        });

        if (!putRes.ok) throw new Error('Falha ao atualizar o registro no banco de dados.');
        
        // Atualiza a lista local para refletir a mudança
        fetchAcervo();
      }

      showNotification('Imagem excluída permanentemente da nuvem e do banco.', 'success');
    } catch (err: any) {
      console.error(err);
      showNotification('Erro ao excluir mídia: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
      setImageDeleteConfirm(prev => ({ ...prev, visible: false }));
    }
  };

  return (
    <div className="min-h-screen bg-background-light text-slate-900 font-display transition-colors duration-300">
      {/* Header removed from here to SPA Layout */}

      {/* Admin Content Area matching the layout of Home */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-8 text-sm">
          <Link to="/" className="text-slate-400 font-semibold hover:text-primary">Acervo</Link>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <span className="text-primary font-bold">Novo {categoryLabels[category] || 'Item'}</span>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Painel Administrativo</h2>
            <p className="text-slate-500 mt-3 text-lg">Gerencie o acervo e insira novos dados técnicos para a preservação histórica digital.</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Quick Menu (Replaces old sidebar) */}
          <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">Painel de Gestão</h3>
            
            <button 
              onClick={() => {
                setActiveTab('overview');
                setEditingId(null);
              }}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-bold ${activeTab === 'overview' ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'text-slate-600 hover:bg-primary/5 hover:text-primary'}`}
            >
              <LayoutDashboard className={`w-5 h-5 ${activeTab === 'overview' ? 'opacity-100' : 'opacity-40'}`} />
              <span>Visão Geral</span>
            </button>
            
            <button 
              onClick={() => {
                setEditingId(null);
                setTitle('');
                setAuthor('');
                setYear('');
                setQuantity(1);
                setDescription('');
                setRecordLabel('');
                setCoverImage(null);
                setBackImage(null);
                setInsertImage(null);
                setRecordImage(null);
                setExemplarsMedia([]);
                setTracksA([{ id: Date.now(), side: 'A', name: '', artists: '', duration: '', audioFile: null }]);
                setTracksB([]);
                setTrackCountA('1');
                setTrackCountB('0');
                setActiveTab('new');
              }}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-bold ${activeTab === 'new' && !editingId ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'text-slate-600 hover:bg-primary/5 hover:text-primary'}`}
            >
              <PlusSquare className={`w-5 h-5 ${activeTab === 'new' ? 'opacity-100' : 'opacity-40'}`} />
              <span>Novo Cadastro</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-bold ${activeTab === 'settings' ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'text-slate-600 hover:bg-primary/5 hover:text-primary'}`}
            >
              <Settings className={`w-5 h-5 ${activeTab === 'settings' ? 'opacity-100' : 'opacity-40'}`} />
              <span>Ajustes do Sistema</span>
            </button>
          </aside>

          {/* Form Area */}
          <div className="flex-1 w-full space-y-8">
              {activeTab === 'overview' && (
                <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/40">
                  <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary">
                        <LayoutDashboard className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Itens Catalogados</h3>
                        <p className="text-xs font-semibold text-slate-400 mt-1">Visão geral do acervo completo cadastrado.</p>
                      </div>
                    </div>
                    
                    {/* Filters */}
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Buscar item..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all w-full md:w-64 placeholder:text-slate-400"
                        />
                      </div>
                      <select 
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="py-3 px-4 bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer text-slate-600 appearance-none pr-8 relative"
                      >
                        <option value="all">Filtro: Todas as Categorias</option>
                        {categoriesList.filter(c => c.id !== 'all').map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>

                      <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="py-3 px-4 bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer text-slate-600 appearance-none pr-8 relative"
                      >
                        <option value="all">Status: Todos</option>
                        <option value="revised">Status: Revisados (✅)</option>
                        <option value="non_revised">Status: Não Revisados</option>
                      </select>

                      <select 
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as any)}
                        className="py-3 px-4 bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer text-slate-600 appearance-none pr-8 relative"
                      >
                        <option value="newest">Data: Recentes</option>
                        <option value="alphabetical">Ordem: A - Z</option>
                        <option value="quantity">Qtd: Maior p/ Menor</option>
                      </select>
                      
                      <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button 
                          onClick={() => setViewMode('grid')}
                          className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                          title="Visualização Normal com Capas"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setViewMode('list')}
                          className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                          title="Lista Compacta (Apenas Texto)"
                        >
                          <List className="w-4 h-4" />
                        </button>
                      </div>
                      
                    </div>
                  </div>
                  <div className="p-0 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                          <th className="px-8 py-5">ID</th>
                          <th className="px-8 py-5">Item</th>
                          <th className="px-8 py-5">Categoria</th>
                          <th className="px-8 py-5">Ano</th>
                          <th className="px-8 py-5">Qtd</th>
                          <th className="px-8 py-5 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {isLoading ? (
                          <tr>
                            <td colSpan={6} className="px-8 py-16 text-center text-slate-400 text-sm font-semibold">
                              <div className="w-8 h-8 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                              Carregando itens sincronizados da nuvem...
                            </td>
                          </tr>
                        ) : filteredItems.length > 0 ? (
                          filteredItems.map((item) => (
                          <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className={`px-8 ${viewMode === 'grid' ? 'py-5' : 'py-3'} text-sm font-black text-slate-400 transition-all`}>#{item.shortId}</td>
                            <td className={`px-8 ${viewMode === 'grid' ? 'py-5' : 'py-3'} transition-all`}>
                              <div className="flex items-center gap-4">
                                {viewMode === 'grid' && (
                                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 transition-all scale-100 origin-left">
                                    <img src={item.image || FALLBACK_IMAGE} alt={item.title} className="w-full h-full object-cover" />
                                  </div>
                                )}
                                <div className="flex flex-col justify-center">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-700 leading-tight">{item.title}</span>
                                    {item.revised && (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" title="Registro Revisado" />
                                    )}
                                  </div>
                                  <span className="text-xs font-semibold text-slate-400">{item.author}</span>
                                </div>
                              </div>
                            </td>
                            <td className={`px-8 ${viewMode === 'grid' ? 'py-5' : 'py-3'} transition-all whitespace-nowrap`}>
                              <span className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider w-max">
                                {categoriesList.find(c => c.id === item.type)?.name || item.type}
                              </span>
                            </td>
                            <td className={`px-8 ${viewMode === 'grid' ? 'py-5' : 'py-3'} text-sm font-semibold text-slate-500 transition-all`}>{item.year}</td>
                            <td className={`px-8 ${viewMode === 'grid' ? 'py-5' : 'py-3'} text-sm font-black text-primary transition-all`}>
                              {item.quantity || 1}
                            </td>
                            <td className={`px-8 ${viewMode === 'grid' ? 'py-5' : 'py-3'} text-right transition-all`}>
                              <div className="flex justify-end gap-2">
                                <Link to={`/admin/record/${item.id}`} className="text-slate-400 hover:text-primary transition-colors bg-white p-2 rounded-lg shadow-sm hover:shadow-md inline-block">
                                  <Search className="w-4 h-4" />
                                </Link>
                                <button 
                                  onClick={() => loadForEdit(item)}
                                  className="text-slate-400 hover:text-emerald-500 transition-colors bg-white p-2 rounded-lg shadow-sm hover:shadow-md inline-block"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDelete(item.id, item.shortId)}
                                  className="text-slate-400 hover:text-red-500 transition-colors bg-white p-2 rounded-lg shadow-sm hover:shadow-md inline-block"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-8 py-16 text-center text-slate-400 text-sm font-semibold">
                              Nenhum item encontrado com estes filtros.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'new' && (
                <form className="space-y-8" onSubmit={handleSubmit}>
                  
                  <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{editingId ? 'Editar Registro' : 'Novo Registro'}</h3>
                      <p className="text-sm font-semibold text-slate-500">{editingId ? `Edição do item #${editingId.split('-')[0]}...` : 'Preencha os dados abaixo.'}</p>
                    </div>
                    <div className="flex gap-4">
                      <button type="button" onClick={() => { setActiveTab('overview'); setEditingId(null); }} className="px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:border-slate-300 hover:bg-slate-50 transition-all">
                        Cancelar e Voltar
                      </button>
                      <button type="submit" disabled={isSubmitting} className={`px-8 py-3 rounded-xl font-black text-sm shadow-xl transition-all disabled:opacity-50 ${editingId ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-primary text-white shadow-primary/30'}`}>
                        {isSubmitting ? 'Salvando...' : editingId ? 'Salvar Modificações' : `Registrar ${categoryLabels[category] || 'Item'}`}
                      </button>
                    </div>
                  </div>
                  
              {/* Card: Informações Básicas */}
              <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/40">
                <div className="p-8 border-b border-slate-50 flex items-center gap-4 bg-slate-50/50">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary">
                    <Info className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Dados Principais</h3>
                    <p className="text-xs font-semibold text-slate-400 mt-1">Identificação inicial da obra ou artefato</p>
                  </div>
                </div>
                
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2 flex items-center gap-3  p-4 rounded-2xl border border-emerald-100/50 mb-2">
                    <label className="relative flex items-center cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={isRevised} 
                        onChange={(e) => setIsRevised(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      <span className="ml-3 text-sm font-bold text-slate-700 group-hover:text-emerald-600 transition-colors">Registro Revisado / Confirmado</span>
                    </label>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-900">Categoria do Arquivo</label>
                    <div className="relative">
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-semibold outline-none transition-all appearance-none"
                      >
                        <option value="vinil">Disco de Vinil (LP)</option>
                        <option value="livro">Livro / Publicação</option>
                        <option value="instrumento">Instrumento Musical</option>
                        <option value="documento">Documento Histórico</option>
                      </select>
                      <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none rotate-90" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-900">Título ou Nome</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-semibold outline-none transition-all" placeholder="Título descritivo" type="text" />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-900">Autor / Mestre / Artista</label>
                    <input value={author} onChange={(e) => setAuthor(e.target.value)} required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-semibold outline-none transition-all" placeholder="Ex: Mestre Bimba" type="text" />
                  </div>

                  {category === 'vinil' && (
                    <>
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-900">Gravadora</label>
                        <input value={recordLabel} onChange={(e) => setRecordLabel(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-semibold outline-none transition-all" placeholder="Ex: RCA Victor" type="text" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-900">País</label>
                        <div className="relative">
                          <select 
                            value={country} 
                            onChange={(e) => setCountry(e.target.value)} 
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-semibold outline-none transition-all appearance-none cursor-pointer"
                          >
                            {countries.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none rotate-90" />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-900">Ano</label>
                        <input value={year} onChange={(e) => setYear(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-semibold outline-none transition-all" placeholder="Ex: 1960" type="number" />
                      </div>
                      
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-sm font-bold text-slate-900">Faixas (Lado A)</label>
                          <input 
                            type="number"
                            min="0"
                            value={trackCountA}
                            onChange={(e) => setTrackCountA(e.target.value)}
                            onBlur={handleTrackCountBlurA}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleTrackCountBlurA(); }}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-semibold outline-none transition-all" 
                            placeholder="Ex: 6" 
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-sm font-bold text-slate-900">Faixas (Lado B)</label>
                          <input 
                            type="number"
                            min="0"
                            value={trackCountB}
                            onChange={(e) => setTrackCountB(e.target.value)}
                            onBlur={handleTrackCountBlurB}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleTrackCountBlurB(); }}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-semibold outline-none transition-all" 
                            placeholder="Ex: 6" 
                          />
                        </div>
                      </div>

                      <div className="space-y-3 md:col-span-2">
                        <label className="text-sm font-bold text-slate-900">Quantidade em Acervo</label>
                        <div className="flex items-center gap-4">
                          <button 
                            type="button" 
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-primary hover:bg-primary/5 transition-all text-xl font-bold"
                          >
                            -
                          </button>
                          <input 
                            value={quantity} 
                            onChange={(e) => setQuantity(Number(e.target.value))} 
                            className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary text-center text-lg font-black outline-none transition-all" 
                            type="number" 
                            min="1"
                          />
                          <button 
                            type="button" 
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-emerald-500 hover:bg-emerald-50 transition-all text-xl font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* O Autor(es) / Editora foi movido para os campos principais acima */}

                  {(category === 'instrumento' || category === 'documento') && (
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-900">Origem Histórica / Região</label>
                      <input value={country} onChange={(e) => setCountry(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-semibold outline-none transition-all" placeholder="Ex: Santo Amaro, BA" type="text" />
                    </div>
                  )}

                  {category !== 'vinil' && (
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-900">Ano</label>
                      <input value={year} onChange={(e) => setYear(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-semibold outline-none transition-all" placeholder="Ex: 1960" type="number" />
                    </div>
                  )}
                </div>
              </div>

              {/* Card: Conteúdo (Dynamic Music List - ONLY FOR VINYL & AUDIO) */}
              {category === 'vinil' && (
                <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/40">
                  <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary">
                        <Music4 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Lista de Faixas</h3>
                        <p className="text-xs font-semibold text-slate-400 mt-1">Regitro das músicas e toques do álbum</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-0 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                          <th className="px-5 py-5 w-16">Ord.</th>
                          <th className="px-5 py-5">Nome do Toque</th>
                          <th className="px-5 py-5">Autor / Mestre / Artista</th>
                          <th className="px-5 py-5 w-24">Duração</th>
                          <th className="px-5 py-5 w-48">Arquivo de Áudio</th>
                          <th className="px-5 py-5 text-right w-16">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {tracksA.length > 0 && (
                          <tr className="bg-slate-100/50">
                            <td colSpan={6} className="px-5 py-3 text-xs font-black text-slate-600 uppercase tracking-widest text-center">Lado A</td>
                          </tr>
                        )}
                        {tracksA.map((track, index) => (
                          <tr key={track.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-5 text-sm font-black text-slate-400">{(index + 1).toString().padStart(2, '0')}</td>
                            <td className="px-5 py-5">
                              <input 
                                className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-300" 
                                placeholder="Nome do toque..." 
                                type="text" 
                                value={track.name}
                                onChange={(e) => updateTrackA(track.id, 'name', e.target.value)}
                              />
                            </td>
                            <td className="px-5 py-5">
                              <input 
                                className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-semibold text-primary outline-none placeholder:text-slate-300 italic" 
                                placeholder={author || "Autor / Mestre / Artista"} 
                                type="text" 
                                value={track.artists || ''}
                                onChange={(e) => updateTrackA(track.id, 'artists', e.target.value)}
                              />
                            </td>
                            <td className="px-5 py-5">
                              <input 
                                className="w-16 bg-transparent border-none p-0 focus:ring-0 text-sm font-semibold text-slate-400 outline-none placeholder:text-slate-300 font-mono" 
                                placeholder="00:00" 
                                type="text"
                                maxLength={5}
                                value={track.duration}
                                onChange={(e) => updateTrackA(track.id, 'duration', handleTimeFormat(e.target.value))}
                              />
                            </td>
                            <td className="px-5 py-5">
                              <div className="relative">
                                <input 
                                  type="file" 
                                  accept="audio/*"
                                  id={`audio-A-${track.id}`}
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                      const file = e.target.files[0];
                                      updateTrackA(track.id, 'audioFile', file);
                                      
                                      const tempAudio = new Audio(URL.createObjectURL(file));
                                      tempAudio.onloadedmetadata = () => {
                                        const totalSeconds = Math.floor(tempAudio.duration);
                                        const minutes = Math.floor(totalSeconds / 60);
                                        const seconds = totalSeconds % 60;
                                        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                                        updateTrackA(track.id, 'duration', formattedTime);
                                      };
                                    }
                                  }}
                                />
                                <label 
                                  htmlFor={`audio-A-${track.id}`}
                                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                    track.audioFile 
                                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100' 
                                      : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {track.audioFile ? (
                                    <><Music className="w-3.5 h-3.5" /> <span className="truncate max-w-[100px]">{track.audioFile.name}</span></>
                                  ) : (
                                    <><Upload className="w-3.5 h-3.5" /> Enviar MP3</>
                                  )}
                                </label>
                              </div>
                            </td>
                            <td className="px-5 py-5 text-right">
                              <button onClick={() => removeTrackA(track.id)} className="text-slate-300 hover:text-red-500 transition-colors bg-white p-2 rounded-lg shadow-sm group-hover:shadow-md" type="button">
                                <Trash2 className="w-4 h-4 inline-block" />
                              </button>
                            </td>
                          </tr>
                        ))}

                        {tracksB.length > 0 && (
                          <tr className="bg-slate-100/50 border-t-4 border-white">
                            <td colSpan={6} className="px-5 py-3 text-xs font-black text-slate-600 uppercase tracking-widest text-center">Lado B</td>
                          </tr>
                        )}
                        {tracksB.map((track, index) => (
                          <tr key={track.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-5 text-sm font-black text-slate-400">{(index + 1).toString().padStart(2, '0')}</td>
                            <td className="px-5 py-5">
                              <input 
                                className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-300" 
                                placeholder="Nome do toque..." 
                                type="text" 
                                value={track.name}
                                onChange={(e) => updateTrackB(track.id, 'name', e.target.value)}
                              />
                            </td>
                            <td className="px-5 py-5">
                              <input 
                                className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-semibold text-primary outline-none placeholder:text-slate-300 italic" 
                                placeholder={author || "Autor / Mestre / Artista"} 
                                type="text" 
                                value={track.artists || ''}
                                onChange={(e) => updateTrackB(track.id, 'artists', e.target.value)}
                              />
                            </td>
                            <td className="px-5 py-5">
                              <input 
                                className="w-16 bg-transparent border-none p-0 focus:ring-0 text-sm font-semibold text-slate-400 outline-none placeholder:text-slate-300 font-mono" 
                                placeholder="00:00" 
                                type="text"
                                maxLength={5}
                                value={track.duration}
                                onChange={(e) => updateTrackB(track.id, 'duration', handleTimeFormat(e.target.value))}
                              />
                            </td>
                            <td className="px-5 py-5">
                              <div className="relative">
                                <input 
                                  type="file" 
                                  accept="audio/*"
                                  id={`audio-B-${track.id}`}
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                      const file = e.target.files[0];
                                      updateTrackB(track.id, 'audioFile', file);
                                      
                                      const tempAudio = new Audio(URL.createObjectURL(file));
                                      tempAudio.onloadedmetadata = () => {
                                        const totalSeconds = Math.floor(tempAudio.duration);
                                        const minutes = Math.floor(totalSeconds / 60);
                                        const seconds = totalSeconds % 60;
                                        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                                        updateTrackB(track.id, 'duration', formattedTime);
                                      };
                                    }
                                  }}
                                />
                                <label 
                                  htmlFor={`audio-B-${track.id}`}
                                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                    track.audioFile 
                                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100' 
                                      : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {track.audioFile ? (
                                    <><Music className="w-3.5 h-3.5" /> <span className="truncate max-w-[100px]">{track.audioFile.name}</span></>
                                  ) : (
                                    <><Upload className="w-3.5 h-3.5" /> Enviar MP3</>
                                  )}
                                </label>
                              </div>
                            </td>
                            <td className="px-5 py-5 text-right">
                              <button onClick={() => removeTrackB(track.id)} className="text-slate-300 hover:text-red-500 transition-colors bg-white p-2 rounded-lg shadow-sm group-hover:shadow-md" type="button">
                                <Trash2 className="w-4 h-4 inline-block" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Card: Document/Book Specific Attributes */}
              {category === 'livro' && (
                <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/40">
                  <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary">
                        <Info className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Sinopse ou Resumo</h3>
                        <p className="text-xs font-semibold text-slate-400 mt-1">Visão geral do conteúdo bibliográfico</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-8">
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full h-32 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-semibold outline-none transition-all resize-none" 
                      placeholder="Descreva sobre o que este livro ou documento trata historicamente."
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Card: Mídia */}
              <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/40">
                <div className="p-8 border-b border-slate-50 flex items-center gap-4 bg-slate-50/50">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Mídia Visual</h3>
                    <p className="text-xs font-semibold text-slate-400 mt-1">Fotos da capa, encartes ou artefato</p>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="relative group aspect-square">
                      <label className="w-full h-full rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all overflow-hidden relative">
                        {coverImage || existingImages.cover ? (
                          <img src={coverImage ? URL.createObjectURL(coverImage) : (existingImages.cover || '')} className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <>
                            <Upload className="w-10 h-10 text-slate-300 group-hover:text-primary transition-colors" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary text-center px-4">Capa Principal</p>
                          </>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && setCoverImage(e.target.files[0])} />
                      </label>
                      {(coverImage || existingImages.cover) && (
                        <button 
                          onClick={() => triggerImageDeletion(existingImages.cover, 'cover')}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-10"
                          title="Remover Imagem"
                          type="button"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="relative group aspect-square">
                      <label className="w-full h-full rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all overflow-hidden relative">
                        {backImage || existingImages.back ? (
                          <img src={backImage ? URL.createObjectURL(backImage) : (existingImages.back || '')} className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <>
                            <Upload className="w-10 h-10 text-slate-300 group-hover:text-primary transition-colors" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary text-center px-4">Contracapa</p>
                          </>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && setBackImage(e.target.files[0])} />
                      </label>
                      {(backImage || existingImages.back) && (
                        <button 
                          onClick={() => triggerImageDeletion(existingImages.back, 'back')}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-10"
                          title="Remover Imagem"
                          type="button"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="relative group aspect-square">
                      <label className="w-full h-full rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all overflow-hidden relative">
                        {insertImage || existingImages.insert ? (
                          <img src={insertImage ? URL.createObjectURL(insertImage) : (existingImages.insert || '')} className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <>
                            <Upload className="w-10 h-10 text-slate-300 group-hover:text-primary transition-colors" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary text-center px-4">Encarte / Detalhes</p>
                          </>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && setInsertImage(e.target.files[0])} />
                      </label>
                      {(insertImage || existingImages.insert) && (
                        <button 
                          onClick={() => triggerImageDeletion(existingImages.insert, 'insert')}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-10"
                          title="Remover Imagem"
                          type="button"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="relative group aspect-square">
                      <label className="w-full h-full rounded-3xl bg-emerald-50/30 border-2 border-dashed border-emerald-200 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all overflow-hidden relative">
                        {recordImage || existingImages.record ? (
                          <img src={recordImage ? URL.createObjectURL(recordImage) : (existingImages.record || '')} className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <>
                            <Disc className="w-10 h-10 text-emerald-300 group-hover:text-emerald-500 transition-colors" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 group-hover:text-emerald-500 text-center px-4">Disco Fisico #1</p>
                          </>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && setRecordImage(e.target.files[0])} />
                      </label>
                      {(recordImage || existingImages.record) && (
                        <button 
                          onClick={() => triggerImageDeletion(existingImages.record, 'record')}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-10"
                          title="Remover Imagem"
                          type="button"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Mostrar campos adicionais para exemplares se quantidade > 1 */}
                  {quantity > 1 && Array.from({ length: quantity - 1 }).map((_, exIdx) => {
                    const currentEx = exemplarsMedia[exIdx] || { cover: null, back: null, insert: null, record: null };
                    const existingEx = existingImages.exemplars?.[exIdx] || { cover: null, back: null, insert: null, record: null };
                    
                    const updateEx = (field: string, file: File | null) => {
                      const newMedia = [...exemplarsMedia];
                      if (!newMedia[exIdx]) newMedia[exIdx] = { cover: null, back: null, insert: null, record: null };
                      newMedia[exIdx][field] = file;
                      setExemplarsMedia(newMedia);
                    };

                    const removeExistingEx = (field: string) => {
                       const newExisting = [...(existingImages.exemplars || [])];
                       if (!newExisting[exIdx]) newExisting[exIdx] = { cover: null, back: null, insert: null, record: null };
                       newExisting[exIdx][field] = null;
                       setExistingImages(prev => ({ ...prev, exemplars: newExisting }));
                    };

                    return (
                      <div key={exIdx} className="mt-12 pt-8 border-t-4 border-slate-50">
                        <div className="flex items-center gap-3 mb-6">
                           <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                              <Plus className="w-5 h-5" />
                           </div>
                           <div>
                              <h4 className="font-black text-slate-800 uppercase tracking-tight">Exemplar Adicional #{exIdx + 2}</h4>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fotos exclusivas desta cópia física</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <div className="relative group aspect-square">
                            <label className="w-full h-full rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all overflow-hidden relative">
                              {currentEx.cover || existingEx.cover ? (
                                <img src={currentEx.cover ? URL.createObjectURL(currentEx.cover) : (existingEx.cover || '')} className="absolute inset-0 w-full h-full object-cover" />
                              ) : (
                                <><Upload className="w-8 h-8 text-slate-300 group-hover:text-primary" /><p className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Capa # {exIdx + 2}</p></>
                              )}
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && updateEx('cover', e.target.files[0])} />
                            </label>
                            {(currentEx.cover || existingEx.cover) && (
                              <button 
                                onClick={() => triggerImageDeletion(existingEx.cover, 'cover', exIdx)}
                                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-10"
                                type="button"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          <div className="relative group aspect-square">
                            <label className="w-full h-full rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all overflow-hidden relative">
                              {currentEx.back || existingEx.back ? (
                                <img src={currentEx.back ? URL.createObjectURL(currentEx.back) : (existingEx.back || '')} className="absolute inset-0 w-full h-full object-cover" />
                              ) : (
                                <><Upload className="w-8 h-8 text-slate-300 group-hover:text-primary" /><p className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Verso # {exIdx + 2}</p></>
                              )}
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && updateEx('back', e.target.files[0])} />
                            </label>
                            {(currentEx.back || existingEx.back) && (
                              <button 
                                onClick={() => triggerImageDeletion(existingEx.back, 'back', exIdx)}
                                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-10"
                                type="button"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          <div className="relative group aspect-square">
                            <label className="w-full h-full rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all overflow-hidden relative">
                              {currentEx.insert || existingEx.insert ? (
                                <img src={currentEx.insert ? URL.createObjectURL(currentEx.insert) : (existingEx.insert || '')} className="absolute inset-0 w-full h-full object-cover" />
                              ) : (
                                <><Upload className="w-8 h-8 text-slate-300 group-hover:text-primary" /><p className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Encarte # {exIdx + 2}</p></>
                              )}
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && updateEx('insert', e.target.files[0])} />
                            </label>
                            {(currentEx.insert || existingEx.insert) && (
                              <button 
                                onClick={() => triggerImageDeletion(existingEx.insert, 'insert', exIdx)}
                                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-10"
                                type="button"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          <div className="relative group aspect-square text-center">
                            <label className="w-full h-full rounded-3xl bg-emerald-50/30 border-2 border-dashed border-emerald-200 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all overflow-hidden relative">
                              {currentEx.record || existingEx.record ? (
                                <img src={currentEx.record ? URL.createObjectURL(currentEx.record) : (existingEx.record || '')} className="absolute inset-0 w-full h-full object-cover" />
                              ) : (
                                <><Disc className="w-8 h-8 text-emerald-300 group-hover:text-emerald-500" /><p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Disco Fisico # {exIdx + 2}</p></>
                              )}
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && updateEx('record', e.target.files[0])} />
                            </label>
                            {(currentEx.record || existingEx.record) && (
                              <button 
                                onClick={() => triggerImageDeletion(existingEx.record, 'record', exIdx)}
                                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-10"
                                type="button"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

                </form>
              )}

              {activeTab === 'settings' && (
                <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/40 p-8 text-center text-slate-500">
                  <p>Ajustes do Sistema em construção.</p>
                </div>
              )}
          </div>
        </div>
      </main>

      {/* Elegant Notification Toast */}
      {notification.visible && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className={`flex items-center gap-4 px-6 py-4 rounded-3xl shadow-2xl border backdrop-blur-xl ${
            notification.type === 'success' 
              ? 'bg-emerald-500/90 border-emerald-400 text-white' 
              : 'bg-red-500/90 border-red-400 text-white'
          }`}>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <div className="pr-4 border-r border-white/20">
              <p className="text-sm font-black uppercase tracking-widest opacity-60 leading-none mb-1">
                {notification.type === 'success' ? 'Sucesso' : 'Erro'}
              </p>
              <p className="text-sm font-bold leading-none">{notification.message}</p>
            </div>
            <button 
              onClick={() => setNotification(prev => ({ ...prev, visible: false }))}
              className="hover:rotate-90 transition-all p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Elegant Confirmation Modal */}
      {deleteConfirm.visible && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setDeleteConfirm(prev => ({ ...prev, visible: false }))}></div>
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 w-full max-w-md p-8 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center text-red-500 mb-6 mx-auto">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 text-center mb-2">Excluir Item?</h3>
            <p className="text-slate-500 text-center text-sm font-semibold mb-8 leading-relaxed">
              Você está prestes a excluir permanentemente o item <span className="text-red-500 font-black">#{deleteConfirm.shortId}</span>. Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setDeleteConfirm(prev => ({ ...prev, visible: false }))}
                className="flex-1 px-6 py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-6 py-4 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-xl shadow-red-500/20 transition-all"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Elegant Image Deletion Permanent Modal */}
      {imageDeleteConfirm.visible && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setImageDeleteConfirm(prev => ({ ...prev, visible: false }))}></div>
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 w-full max-w-md p-10 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-[2rem] bg-amber-50 flex items-center justify-center text-amber-500 mb-8 mx-auto shadow-inner">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 text-center mb-3">Apagar permanentemente?</h3>
            <p className="text-slate-500 text-center text-sm font-semibold mb-10 leading-relaxed px-2">
              Esta ação excluirá a imagem <span className="text-amber-600 font-black italic">definitivamente</span> do servidor de armazenamento da Azure e do registro atual. Você terá que subir outra foto se desejar.
            </p>
            <div className="flex gap-4">
              <button 
                disabled={isSubmitting}
                onClick={() => setImageDeleteConfirm(prev => ({ ...prev, visible: false }))}
                className="flex-1 px-6 py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
              >
                Manter
              </button>
              <button 
                disabled={isSubmitting}
                onClick={handleDeleteImagePermanent}
                className="flex-2 px-8 py-4 rounded-2xl bg-amber-500 text-white font-black hover:bg-amber-600 shadow-xl shadow-amber-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                   <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : 'Apagar da Nuvem'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
