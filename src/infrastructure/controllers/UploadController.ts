import { Request, Response } from 'express';
import { ProcessPdfUseCase } from '../../application/use-cases/process-pdf/ProcessPdfUseCase';
import { ProcessPdfCommand } from '../../application/use-cases/process-pdf/ProcessPdfCommand';
import { PdfProcessorService } from '../../domain/services/PdfProcessorService';
import { FileService } from '../../domain/services/fileService';
import { logger } from '../../shared/logging/logger';

export class UploadController {
  async handle(req: Request, res: Response): Promise<void> {
    const filePath = req.file?.path;

    if (!filePath) {
      logger.warn('Tentativa de upload sem envio de arquivo.');
      res.status(400).json({ message: 'Arquivo não enviado.' });
      return;
    }

    logger.info(`Iniciando processamento do PDF: ${filePath}`);

    const useCase = new ProcessPdfUseCase(new PdfProcessorService());

    try {
      const result = await useCase.execute(new ProcessPdfCommand(filePath));
      logger.info(`Processamento concluído com sucesso: ${JSON.stringify(result)}`);
      res.status(200).json({ result });
    } catch (err) {
      console.error('Erro ao processar PDF', { error: err, filePath });
      logger.error('Erro ao processar PDF', { error: err, filePath });
      FileService.clearDirectories().catch((error: unknown): void => {
        console.error('Error clearing directories:', error);
      });
      res.status(500).json({ message: 'Erro ao processar PDF', error: err });
    }
  }
}
