import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Copy .env.example to .env and fill in the values.')
}

// Keep this explicit: the generated asset must change whenever the runtime
// connection contract changes, because the final URL/key are injected by the
// container at startup.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          incorporadora_id: string | null
          gestora_id: string | null
          imobiliaria_id: string | null
          corretor_id: string | null
          role: 'incorporadora' | 'gestora_lancamentos' | 'imobiliaria' | 'corretor'
          nome: string | null
          email: string | null
          criado_em: string
        }
      }
      leads: {
        Row: {
          id: string
          incorporadora_id: string
          empreendimento_id: string
          imobiliaria_id: string
          corretor_id: string
          nome: string
          telefone: string
          email: string | null
          status: 'novo' | 'em_atendimento' | 'contatado' | 'visita_marcada' | 'proposta' | 'venda' | 'perdido'
          tentativas_contato: number
          ultima_tentativa: string | null
          motivo_perdido: string | null
          data_visita: string | null
          first_response_at: string | null
          public_token: string | null
          criado_em: string
        }
        Insert: Omit<Database['public']['Tables']['leads']['Row'], 'id' | 'criado_em'> & { id?: string; criado_em?: string }
        Update: Partial<Database['public']['Tables']['leads']['Row']>
      }
    }
  }
}
