import { useState } from 'react';
import { Building2, Search, Plus, MoreVertical, CreditCard, ShieldAlert, CheckCircle2, Edit2, Trash2, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

type Incorporadora = { id: string; nome: string; email: string; plano: string; status: string; leadsMes: number; pgmt: string; senha?: string };

const initialMock: Incorporadora[] = [
    { id: '1', nome: 'Cyrela', email: 'admin@cyrela.com', plano: 'Enterprise', status: 'Ativo', leadsMes: 4500, pgmt: 'Em dia' },
    { id: '2', nome: 'MRV', email: 'vendas@mrv.com', plano: 'Enterprise', status: 'Ativo', leadsMes: 8000, pgmt: 'Em dia' },
    { id: '3', nome: 'Even', email: 'gestao@even.com', plano: 'Pro', status: 'Ativo', leadsMes: 1200, pgmt: 'Em dia' },
    { id: '4', nome: 'Tegra', email: 'tech@tegra.com', plano: 'Pro', status: 'Inadimplente', leadsMes: 800, pgmt: 'Atrasado' },
];

export function GestaoIncorporadoras() {
    const [search, setSearch] = useState('');
    const [data, setData] = useState<Incorporadora[]>(initialMock);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Incorporadora>>({});
    
    // Dropdown State
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    const filtered = data.filter(i => i.nome.toLowerCase().includes(search.toLowerCase()));

    const openCreateModal = () => {
        setEditingId(null);
        setFormData({ plano: 'Pro', status: 'Ativo', pgmt: 'Em dia', leadsMes: 1000 });
        setIsModalOpen(true);
        setOpenDropdownId(null);
    };

    const gerarSenhaAutomatica = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$";
        let senha = "";
        for (let i = 0; i < 8; i++) {
             senha += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        // Aproveitamos um campo 'senha' no record puramente para exibição no mock
        setFormData(prev => ({ ...prev, senha }));
    };

    const openEditModal = (inc: Incorporadora) => {
        setEditingId(inc.id);
        setFormData(inc);
        setIsModalOpen(true);
        setOpenDropdownId(null);
    };

    const handleDelete = (id: string) => {
        if(confirm('Tem certeza que deseja excluir esta Incorporadora? Todos os dados vinculados podem ser perdidos.')) {
            setData(prev => prev.filter(i => i.id !== id));
            setOpenDropdownId(null);
        }
    };

    const handleSave = () => {
        if (!formData.nome || !formData.email) return alert('O nome da Empresa e o E-mail de Acesso são obrigatórios!');
        
        if (editingId) {
            setData(prev => prev.map(i => i.id === editingId ? { ...i, ...formData } as Incorporadora : i));
        } else {
            const newItem: Incorporadora = {
                id: Math.random().toString(36).substr(2, 9),
                nome: formData.nome || 'Nova Incorporadora',
                email: formData.email,
                plano: formData.plano || 'Pro',
                status: formData.status || 'Ativo',
                pgmt: formData.pgmt || 'Em dia',
                leadsMes: formData.leadsMes || 1000
            };
            // Aqui enviariamos email/senha para o Supabase e chamaríamos a edge function para disparar email de boas vindas
            alert(`SaaS Criado com Sucesso!\nE-mail: ${newItem.email}\nSenha Inicial: ${formData.senha || '***'}\n\nO cliente recebeu um disparo de boas vindas com essas credenciais.`);
            setData([newItem, ...data]);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-12 relative">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Incorporadoras (Tenants)</h1>
                    <p className="text-text-secondary mt-1">Gerencie seus clientes corporativos e assinaturas.</p>
                </div>
                <Button className="w-full sm:w-auto" onClick={openCreateModal}>
                    <Plus size={18} className="mr-2" /> Novo Cliente
                </Button>
            </div>

            <Card className="p-4 flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nome..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-black/5 border border-border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-brand/50 transition-colors"
                    />
                </div>
                <Button variant="outline"><CreditCard size={18} className="mr-2"/> Faturamento</Button>
            </Card>

            <div className="bg-bg-surface border border-border rounded-xl overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/5 border-b border-border text-sm">
                                <th className="px-6 py-4 font-semibold text-text-secondary">Empresa</th>
                                <th className="px-6 py-4 font-semibold text-text-secondary">Plano</th>
                                <th className="px-6 py-4 font-semibold text-text-secondary">Leads (Mês)</th>
                                <th className="px-6 py-4 font-semibold text-text-secondary">Pagamento</th>
                                <th className="px-6 py-4 font-semibold text-text-secondary">Status BD</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-8 text-text-muted">Nenhuma incorporadora encontrada.</td></tr>
                            ) : filtered.map((inc) => (
                                <tr key={inc.id} className="hover:bg-black/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                                                <Building2 size={16} className="text-brand" />
                                            </div>
                                            <span className="font-semibold text-base">{inc.nome}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium">
                                        <span className="px-2 py-1 bg-black/5 rounded-md border border-border">{inc.plano}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {Number(inc.leadsMes).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            {inc.pgmt === 'Em dia' 
                                                ? <CheckCircle2 size={16} className="text-emerald-500" />
                                                : <ShieldAlert size={16} className="text-red-500" />
                                            }
                                            <span className={`text-sm font-medium ${inc.pgmt === 'Em dia' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {inc.pgmt}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {inc.status === 'Ativo' ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                Ativo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20">
                                                Suspenso
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right relative">
                                        <Button 
                                            variant="ghost" 
                                            className="w-8 h-8 p-0 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => setOpenDropdownId(openDropdownId === inc.id ? null : inc.id)}
                                        >
                                            <MoreVertical size={16} className="text-text-muted" />
                                        </Button>

                                        {/* Dropdown Menu */}
                                        {openDropdownId === inc.id && (
                                            <div className="absolute right-8 top-10 w-32 bg-bg-surface border border-border rounded-lg shadow-xl z-10 py-1 overflow-hidden animate-fade-in">
                                                <button 
                                                    onClick={() => openEditModal(inc)}
                                                    className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-black/5 flex items-center gap-2"
                                                >
                                                    <Edit2 size={14}/> Editar
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(inc.id)}
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
                            <h3 className="font-bold text-lg">{editingId ? 'Editar Cliente' : 'Novo Cliente Tenant'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-primary"><X size={20}/></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Nome da Empresa</label>
                                <input 
                                    className="w-full bg-black/5 border border-border rounded-lg px-3 py-2 focus:border-brand/50 outline-none" 
                                    placeholder="Ex: Construtora JHSF"
                                    value={formData.nome || ''}
                                    onChange={e => setFormData({...formData, nome: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-brand/5 p-3 rounded-lg border border-brand/20">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">E-mail de Acesso (Dono)</label>
                                    <input 
                                        type="email"
                                        className="w-full bg-black/5 border border-border rounded-lg px-3 py-2 focus:border-brand/50 outline-none" 
                                        placeholder="gestor@empresa.com"
                                        value={formData.email || ''}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center justify-between text-sm font-medium text-text-secondary mb-1">
                                        Senha Inicial
                                        {/* Apenas exibe o botão se estiver CRIANDO */}
                                        {!editingId && (
                                            <button onClick={gerarSenhaAutomatica} className="text-[10px] uppercase font-bold text-brand hover:underline">Gerar Auto</button>
                                        )}
                                    </label>
                                    <input 
                                        type={editingId ? "password" : "text"}
                                        disabled={!!editingId}
                                        className="w-full bg-black/5 border border-border rounded-lg px-3 py-2 focus:border-brand/50 outline-none disabled:opacity-50" 
                                        placeholder={editingId ? "******** (Intocável)" : "Senha que será enviada"}
                                        value={formData.senha || ''}
                                        onChange={e => setFormData({...formData, senha: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Plano Base</label>
                                    <select 
                                        className="w-full bg-black/5 border border-border rounded-lg px-3 py-2 focus:border-brand/50 outline-none"
                                        value={formData.plano || 'Pro'}
                                        onChange={e => setFormData({...formData, plano: e.target.value})}
                                    >
                                        <option value="Starter">Starter</option>
                                        <option value="Pro">Pro</option>
                                        <option value="Enterprise">Enterprise</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Leads / Mês</label>
                                    <input 
                                        type="number"
                                        className="w-full bg-black/5 border border-border rounded-lg px-3 py-2 focus:border-brand/50 outline-none"
                                        value={formData.leadsMes || 0}
                                        onChange={e => setFormData({...formData, leadsMes: Number(e.target.value)})}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Pagamento</label>
                                    <select 
                                        className="w-full bg-black/5 border border-border rounded-lg px-3 py-2 focus:border-brand/50 outline-none text-sm"
                                        value={formData.pgmt || 'Em dia'}
                                        onChange={e => setFormData({...formData, pgmt: e.target.value})}
                                    >
                                        <option value="Em dia">Em dia</option>
                                        <option value="Atrasado">Atrasado</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Status BD</label>
                                    <select 
                                        className="w-full bg-black/5 border border-border rounded-lg px-3 py-2 focus:border-brand/50 outline-none text-sm"
                                        value={formData.status || 'Ativo'}
                                        onChange={e => setFormData({...formData, status: e.target.value})}
                                    >
                                        <option value="Ativo">Ativo</option>
                                        <option value="Inadimplente">Suspenso</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-border bg-black/5 flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                            <Button onClick={handleSave}>{editingId ? 'Salvar Alterações' : 'Criar Cliente'}</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
