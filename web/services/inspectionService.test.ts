// Mock supabase before importing service
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

import { inspectionService } from './inspectionService';

describe('inspectionService', () => {
  describe('validatePlate', () => {
    it('should validate a correct Mercosul plate', () => {
      expect(inspectionService.validatePlate('ABC1D23')).toBe(true);
    });

    it('should validate a correct Old format plate', () => {
      expect(inspectionService.validatePlate('ABC1234')).toBe(true);
    });

    it('should validate a plate with special characters/spaces', () => {
      expect(inspectionService.validatePlate('ABC-1234')).toBe(true);
      expect(inspectionService.validatePlate('ABC 1D23')).toBe(true);
    });

    it('should reject a plate with incorrect length', () => {
      expect(inspectionService.validatePlate('ABC123')).toBe(false);
      expect(inspectionService.validatePlate('ABC12345')).toBe(false);
    });

    it('should reject a plate with incorrect format', () => {
      expect(inspectionService.validatePlate('123ABCD')).toBe(false); // Numbers first
      expect(inspectionService.validatePlate('ABC1D2E')).toBe(false); // Too many letters at end
    });
  });
});
