import { InspectionService } from '@vigilante/shared';
import { supabase } from '@/lib/supabase';

// URL do webhook do n8n
const N8N_WEBHOOK_URL = 'http://localhost:9090/webhook-test/avaliar-veiculo';

export const inspectionService = new InspectionService(supabase, N8N_WEBHOOK_URL);
export type { Inspection, InspectionStatus } from '@vigilante/shared';
