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

    const outputPath = path.join(outputDir, 'relatorio.xlsx');
    console.log('result', result);

    const formattedData = result.comprovantes.flatMap((comp) =>
      comp.descricoes.map((descricao,index) => ({
        dataDeArrecadacao: comp.dataArrecadacao,
        debito: comp.debito[index] ?? 0,
        credito: comp.credito,
        total: comp.total,
        descricao,
        divisao:1,
      }))
    );

    await ExcelGenerator.generate(formattedData, outputPath);

    logger.info('Excel gerado com sucesso', { path: outputPath });

    return { message: 'Processamento concluído', outputPath };
  }
}
