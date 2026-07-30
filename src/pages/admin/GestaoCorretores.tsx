import { useState } from 'react';
import { Users, Search, ShieldAlert, Store, MoreVertical, Plus, Edit2, Trash2, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

type Corretor = { id: string; nome: string; email: string; imobiliaria: string; ultimoAcesso: string; status: string };

// Dados Mockados para o painel Admin
const initialMock: Corretor[] = [
    { id: '1', nome: 'João Mendes', email: 'joao@email.com', imobiliaria: 'Lopes Conceito', ultimoAcesso: 'Agora', status: 'Ativo' },
    { id: '2', nome: 'Sarah Gomes', email: 'sarah@email.com', imobiliaria: 'Elite Imóveis', ultimoAcesso: 'Há 2 dias', status: 'Ativo' },
    { id: '3', nome: 'Carlos Silva', email: 'carlos@email.com', imobiliaria: 'Lopes Conceito', ultimoAcesso: 'Há 1 mês', status: 'Excluído' },
];

export function GestaoCorretores() {
    const [search, setSearch] = useState('');
    const [data, setData] = useState<Corretor[]>(initialMock);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Corretor>>({});
    
    // Dropdown State
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    const filtered = data.filter(i => 
        i.nome.toLowerCase().includes(search.toLowerCase()) || 
        i.email.toLowerCase().includes(search.toLowerCase())
    );

    const openCreateModal = () => {
        setEditingId(null);
        setFormData({ status: 'Ativo', ultimoAcesso: 'Nunca' });
        setIsModalOpen(true);
        setOpenDropdownId(null);
    };

    const openEditModal = (cor: Corretor) => {
        setEditingId(cor.id);
        setFormData(cor);
        setIsModalOpen(true);
        setOpenDropdownId(null);
    };

    const handleDelete = (id: string) => {
        if(confirm('Tem certeza que deseja forçar exclusão (Hard Delete) desse Corretor do banco SaaS?')) {
            setData(prev => prev.filter(i => i.id !== id));
            setOpenDropdownId(null);
        }
    };

    const handleSave = () => {
        if (!formData.nome || !formData.email || !formData.imobiliaria) return alert('Nome, Email e Imobiliaria são obrigatórios!');
        
        if (editingId) {
            setData(prev => prev.map(i => i.id === editingId ? { ...i, ...formData } as Corretor : i));
        } else {
            const newItem: Corretor = {
                id: Math.random().toString(36).substr(2, 9),
                nome: formData.nome,
                email: formData.email,
                imobiliaria: formData.imobiliaria,
                ultimoAcesso: formData.ultimoAcesso || 'Nunca',
                status: formData.status || 'Ativo',
            };
            setData([newItem, ...data]);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-12 relative">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Diretório: Corretores</h1>
                    <p className="text-text-secondary mt-1">Visão global e manipulação dos usuários ponta a ponta da plataforma.</p>
                </div>
                <Button className="w-full sm:w-auto" onClick={openCreateModal}>
                    <Plus size={18} className="mr-2" /> Forçar Criação de Corretor
                </Button>
            </div>

            <Card className="p-4 flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar corretor por nome ou email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-black/5 border border-border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-brand/50 transition-colors"
                    />
                </div>
            </Card>

            <div className="bg-bg-surface border border-border rounded-xl overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/5 border-b border-border text-sm">
                                <th className="px-6 py-4 font-semibold text-text-secondary">Corretor</th>
                                <th className="px-6 py-4 font-semibold text-text-secondary">E-mail</th>
                                <th className="px-6 py-4 font-semibold text-text-secondary">Imobiliária</th>
                                <th className="px-6 py-4 font-semibold text-text-secondary">Último Acesso</th>
                                <th className="px-6 py-4 font-semibold text-text-secondary">Status BD</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-8 text-text-muted">Nenhum corretor encontrado.</td></tr>
                            ) : filtered.map((cor) => (
                                <tr key={cor.id} className="hover:bg-black/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                                                <Users size={16} className="text-purple-500" />
                                            </div>
                                            <span className="font-semibold text-base">{cor.nome}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-muted">
                                        {cor.email}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium">
                                        <div className="flex items-center gap-2 text-text-secondary">
                                            <Store size={14} className="text-indigo-500" /> {cor.imobiliaria}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-muted">
                                        {cor.ultimoAcesso}
                                    </td>
                                    <td className="px-6 py-4">
                                        {cor.status === 'Ativo' ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                Ativo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-500 border border-slate-500/20">
                                                <ShieldAlert size={12} /> Excluído
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right relative">
                                        <Button 
                                            variant="ghost" 
                                            className="w-8 h-8 p-0 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => setOpenDropdownId(openDropdownId === cor.id ? null : cor.id)}
                                        >
                                            <MoreVertical size={16} className="text-text-muted" />
                                        </Button>

                                        {/* Dropdown Menu */}
                                        {openDropdownId === cor.id && (
                                            <div className="absolute right-8 top-10 w-32 bg-bg-surface border border-border rounded-lg shadow-xl z-10 py-1 overflow-hidden animate-fade-in">
                                                <button 
                                                    onClick={() => openEditModal(cor)}
                                                    className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-black/5 flex items-center gap-2"
                                                >
                                                    <Edit2 size={14}/> Editar
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(cor.id)}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2"
                                                >
                                                    <Trash2 size={14}/> Excluir
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal CRUD */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-bg-surface w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in border border-border">
                        <div className="p-4 border-b border-border flex items-center justify-between">
                            <h3 className="font-bold text-lg">{editingId ? 'Editar Corretor (Override)' : 'Forçar Novo Corretor'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-primary"><X size={20}/></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Nome Completo</label>
                                <input 
                                    className="w-full bg-black/5 border border-border rounded-lg px-3 py-2 focus:border-brand/50 outline-none" 
                                    placeholder="Ex: Ana Silva"
                                    value={formData.nome || ''}
                                    onChange={e => setFormData({...formData, nome: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                                <input 
                                    type="email"
                                    className="w-full bg-black/5 border border-border rounded-lg px-3 py-2 focus:border-brand/50 outline-none" 
                                    placeholder="ana@email.com"
                                    value={formData.email || ''}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Imobiliária Vinculada</label>
                                    <input 
                                        className="w-full bg-black/5 border border-border rounded-lg px-3 py-2 focus:border-brand/50 outline-none"
                                        placeholder="Ex: Lopes Conceito"
                                        value={formData.imobiliaria || ''}
                                        onChange={e => setFormData({...formData, imobiliaria: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Status BD</label>
                                    <select 
                                        className="w-full bg-black/5 border border-border rounded-lg px-3 py-2 focus:border-brand/50 outline-none text-sm"
                                        value={formData.status || 'Ativo'}
                                        onChange={e => setFormData({...formData, status: e.target.value})}
                                    >
                                        <option value="Ativo">Ativo</option>
                                        <option value="Excluído">Excluído / Desativado</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-border bg-black/5 flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                            <Button onClick={handleSave}>{editingId ? 'Forçar Alterações' : 'Aprovar Corretor'}</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
