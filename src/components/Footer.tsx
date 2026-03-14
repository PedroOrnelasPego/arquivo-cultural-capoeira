import { History } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                <History className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">Arquivo Cultural Capoeira</h2>
            </div>
            <p className="text-slate-400 max-w-sm mb-6">
              Uma iniciativa dedicada à preservação, catalogação e difusão da memória histórica da Capoeira no Brasil e no mundo.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
                <span className="text-sm font-bold">IG</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
                <span className="text-sm font-bold">YT</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
                <span className="text-sm font-bold">FB</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-6">Navegação</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-primary transition-colors">Acervo Digital</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Mestres</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Instrumentos</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Documentos</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Legal</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-primary transition-colors">Políticas de Uso</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacidade</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Direitos Autorais</a></li>
              <li><Link to="/login" className="hover:text-primary transition-colors">Administração</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2026 Arquivo Cultural Capoeira. Todos os direitos reservados.</p>
          <p>Desenvolvido para preservar a Ginga.</p>
        </div>
      </div>
    </footer>
  );
}
