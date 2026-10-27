export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      materials: {
        Row: { id: string; slug: string; name_ko: string; name_en: string | null; formula: string; state: Database['public']['Enums']['material_state']; molar_mass_g_mol: number; density_g_ml: number | null; description: string | null; accent_class: string | null; metadata: Json; is_active: boolean; created_at: string; updated_at: string };
        Insert: { id?: string; slug: string; name_ko: string; name_en?: string | null; formula: string; state: Database['public']['Enums']['material_state']; molar_mass_g_mol: number; density_g_ml?: number | null; description?: string | null; accent_class?: string | null; metadata?: Json; is_active?: boolean; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['materials']['Insert']>;
      };
      reactions: {
        Row: { id: string; slug: string; name_ko: string; equation: string; reaction_type: Database['public']['Enums']['reaction_type']; effect: Database['public']['Enums']['reaction_effect']; observation: string; min_temperature_c: number | null; max_temperature_c: number | null; min_pressure_atm: number | null; max_pressure_atm: number | null; min_ph: number | null; max_ph: number | null; min_time_min: number | null; calculation_model: Json; note: string | null; priority: number; is_active: boolean; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['reactions']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['reactions']['Insert']>;
      };
      reaction_species: {
        Row: { id: number; reaction_id: string; material_id: string; role: Database['public']['Enums']['species_role']; stoichiometric_coefficient: number; phase_label: string | null; display_order: number; created_at: string };
        Insert: Omit<Database['public']['Tables']['reaction_species']['Row'], 'id' | 'created_at'> & { id?: never; created_at?: string };
        Update: Partial<Database['public']['Tables']['reaction_species']['Insert']>;
      };
      experiments: {
        Row: { id: string; user_id: string; title: string; status: Database['public']['Enums']['experiment_status']; matched_reaction_id: string | null; temperature_c: number; pressure_atm: number; ph: number; reaction_time_min: number; result_kind: string | null; result_title: string | null; result_equation: string | null; observation: string | null; limiting_reactant: string | null; calculation_summary: string | null; result_snapshot: Json; started_at: string | null; completed_at: string | null; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['experiments']['Row'], 'id' | 'user_id' | 'created_at' | 'updated_at'> & { id?: string; user_id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['experiments']['Insert']>;
      };
      experiment_inputs: {
        Row: { id: number; experiment_id: string; material_id: string; amount: number; unit: string; calculated_moles: number | null; display_order: number; created_at: string };
        Insert: Omit<Database['public']['Tables']['experiment_inputs']['Row'], 'id' | 'created_at'> & { id?: never; created_at?: string };
        Update: Partial<Database['public']['Tables']['experiment_inputs']['Insert']>;
      };
      experiment_outputs: {
        Row: { id: number; experiment_id: string; material_id: string | null; name: string; formula: string; role: Database['public']['Enums']['result_species_role']; amount: number | null; unit: string | null; amount_label: string | null; display_order: number; created_at: string };
        Insert: Omit<Database['public']['Tables']['experiment_outputs']['Row'], 'id' | 'created_at'> & { id?: never; created_at?: string };
        Update: Partial<Database['public']['Tables']['experiment_outputs']['Insert']>;
      };
    };
    Views: {
      reaction_catalog: { Row: { id: string; slug: string; name_ko: string; equation: string; reaction_type: Database['public']['Enums']['reaction_type']; effect: Database['public']['Enums']['reaction_effect']; observation: string; min_temperature_c: number | null; max_temperature_c: number | null; min_pressure_atm: number | null; max_pressure_atm: number | null; min_ph: number | null; max_ph: number | null; min_time_min: number | null; calculation_model: Json; note: string | null; species: Json } };
    };
    Functions: Record<string, never>;
    Enums: {
      material_state: 'solid' | 'liquid' | 'gas' | 'aqueous';
      reaction_type: 'neutralization' | 'precipitation' | 'dissolution' | 'other';
      reaction_effect: 'neutralization' | 'precipitate' | 'dissolution' | 'none';
      species_role: 'reactant' | 'product' | 'catalyst' | 'solvent';
      experiment_status: 'draft' | 'completed' | 'failed';
      result_species_role: 'product' | 'remaining_reactant';
    };
    CompositeTypes: Record<string, never>;
  };
};
