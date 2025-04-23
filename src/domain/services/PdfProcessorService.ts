import * as fs from 'fs/promises';
import pdf from 'pdf-parse';
import { extrairHistorico, mapearDebito, agruparDescricoes } from '../../shared/utils/pdfUtilsHistoryFormat'; 


export interface ComprovanteData {
  dataArrecadacao: string;
  debito: number[];
  credito: number;
  total: string;
  descricoes: string[];
}

export interface ProcessedPdfData {
  comprovantes: ComprovanteData[];
}

export class PdfProcessorService {
  async process(filePath: string): Promise<ProcessedPdfData> {
    const buffer = await fs.readFile(filePath);
    const pdfData = await pdf(buffer);
    const lines = pdfData.text.split('\n').map((line) => line.trim()).filter(Boolean);


    const comprovantes: ComprovanteData[] = [];
    let current: Partial<ComprovanteData> = {};
    let collectingDescricoes = false;
    let descricoes: string[] = [];
    let debito: number[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes('AgênciaEstabelecimentoValor Reservado/RestituídoReferência')) {
        const match = lines[i + 1]?.match(/\d{2}\/\d{2}\/\d{4}/);
        if (match) {
            comprovantes.push({
              dataArrecadacao: match[0],
              debito: current.debito ?? [],
              credito: current.credito ?? 0,
              total: current.total || '',
              descricoes: current.descricoes || [],
              
            });
            current = {};
            descricoes = [];
            debito = [];

          }
      }

      if (line === 'Totais') {
        const totalLine = lines[i + 1];
        if (totalLine) {
          const totalLineTrim = totalLine.trim();
          const priceMatches = totalLineTrim.match(/\d{1,3}(?:\.\d{3})*,\d{2}/g);
          if (priceMatches && priceMatches.length > 0) {
            current.total = priceMatches[priceMatches.length - 1];
          } else {
            current.total = '0,00';
          }
        }
      }

      if (line.includes('Composição do Documento de Arrecadação')) {
        collectingDescricoes = true;
        continue;
      }

      if (collectingDescricoes) {
        if (line.startsWith('Totais')) {
          collectingDescricoes = false;
          console.log('debito', debito);
          current.descricoes = agruparDescricoes([...descricoes]);
          current.debito = [...debito];
          console.log('current descricoes', current.descricoes);
          console.log('current debito', current.debito);
          descricoes.length = 0;
          debito.length = 0;

        } else if (/^\d{4}.*\d{1,3},\d{2}$/.test(line)) {
          const historico = extrairHistorico(line);
          descricoes.push(historico);
          const mapDebito = mapearDebito(historico);
          debito.push(mapDebito);
          current.credito = 5;
        }
      }
    }

    if (current.dataArrecadacao ||current.debito ||current.credito || current.total || current.descricoes) {
      comprovantes.push({
        dataArrecadacao: current.dataArrecadacao || '',
        debito: current.debito || [],
        credito: current.credito ?? 0,
        total: current.total || '',
        descricoes:current.descricoes || [],
       
      });
    }

    console.log('Comprovantes processados:', comprovantes);

    return { comprovantes };
  }
}
