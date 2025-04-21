import { PdfProcessorService } from '../../../src/domain/services/PdfProcessorService';

describe('PdfProcessorService', () => {
  it('should extract data from PDF buffer', async () => {
    const service = new PdfProcessorService();
    const filePath = 'tests/assets/sample.pdf';

    const result = await service.process(filePath);
    expect(result).toHaveProperty('comprovantes');
    expect(Array.isArray(result.comprovantes)).toBe(true);
  });
});
