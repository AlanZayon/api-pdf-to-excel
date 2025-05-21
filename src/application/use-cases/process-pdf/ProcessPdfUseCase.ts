import { ProcessPdfCommand } from './ProcessPdfCommand';
import { PdfProcessorService } from '../../../domain/services/PdfProcessorService';
import { ExcelGenerator } from '../../../shared/utils/ExcelGenerator';
import { logger } from '../../../shared/logging/logger';
import fs from 'fs';
import path from 'path';

export class ProcessPdfUseCase {
  constructor(private pdfProcessor: PdfProcessorService) {}

  async execute(command: ProcessPdfCommand) {
    logger.info('Iniciando processamento do PDF', {
      file: command.filePath,
    });

    const result = await this.pdfProcessor.process(command.filePath);

    const outputDir = path.resolve('outputs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    const outputPath = path.join(outputDir, 'PGTO.csv');
    // console.log('result', result);

    const formattedData = result.comprovantes.flatMap((comp) =>
      comp.descricoes.flatMap((descricao, index) => {
        const total = comp.total[index] ?? 0;
        if (total === 0) return [];
        return [{
          dataDeArrecadacao: comp.dataArrecadacao,
          debito: comp.debito[index] ?? 0,
          credito: comp.credito,
          total,
          descricao,
          divisao: 1,
        }];
      })
    );
    
    await ExcelGenerator.generate(formattedData, outputPath);

    logger.info('Excel gerado com sucesso', { path: outputPath });

    return { message: 'Processamento concluído', outputPath };
  }
}
