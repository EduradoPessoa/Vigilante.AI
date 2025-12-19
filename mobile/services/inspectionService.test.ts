// Mock supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

import { inspectionService } from './inspectionService';

describe('inspectionService (Mobile)', () => {
  it('should be defined', () => {
    expect(inspectionService).toBeDefined();
  });

  describe('validatePlate', () => {
    it('should validate a correct Mercosul plate', () => {
      expect(inspectionService.validatePlate('ABC1D23')).toBe(true);
    });

    it('should validate a correct Old format plate', () => {
      expect(inspectionService.validatePlate('ABC1234')).toBe(true);
    });

    it('should reject invalid plates', () => {
      expect(inspectionService.validatePlate('INVALID')).toBe(false);
    });
  });
});
