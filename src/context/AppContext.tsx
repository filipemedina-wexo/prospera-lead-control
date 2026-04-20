import { createContext, useContext, useState, type ReactNode } from 'react';
import { type UserProfile } from '../data/mockData';

type PageId =
    | 'dashboard'
    | 'leads'
    | 'empreendimentos'
    | 'imobiliarias'
    | 'corretores'
    | 'distribuicao'
    | 'meus-leads'
    | 'meus-empreendimentos'
    | 'lead-detalhe'
    | 'empreendimento-detalhe'
    | 'configuracoes';

interface AppContextType {
    profile: UserProfile;
    setProfile: (p: UserProfile) => void;
    currentPage: PageId;
    setCurrentPage: (p: PageId) => void;
    selectedLeadId: string | null;
    setSelectedLeadId: (id: string | null) => void;
    selectedEmpreendimentoId: string | null;
    setSelectedEmpreendimentoId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);

interface AppProviderProps {
    children: ReactNode;
    defaultProfile?: UserProfile;
}

export function AppProvider({ children, defaultProfile = 'incorporadora' }: AppProviderProps) {
    const [profile, setProfileState] = useState<UserProfile>(defaultProfile);
    const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
    const [selectedEmpreendimentoId, setSelectedEmpreendimentoId] = useState<string | null>(null);

    const setProfile = (p: UserProfile) => {
        setProfileState(p);
        setCurrentPage('dashboard');
        setSelectedLeadId(null);
        setSelectedEmpreendimentoId(null);
    };

    return (
        <AppContext.Provider value={{
            profile,
            setProfile,
            currentPage,
            setCurrentPage,
            selectedLeadId,
            setSelectedLeadId,
            selectedEmpreendimentoId,
            setSelectedEmpreendimentoId
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used within AppProvider');
    return ctx;
}

export type { PageId };
