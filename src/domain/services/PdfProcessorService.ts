import * as fs from 'fs/promises';
import pdf from 'pdf-parse';
import { extrairHistorico, mapearDebito, agruparDescricoesEValores, parseLinhaHistorico, parseTotaisLinha } from '../../shared/utils/pdfUtilsHistoryFormat'; 


export interface ComprovanteData {
  dataArrecadacao: string;
  debito: number[];
  credito: number;
  total: number[];
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

    console.log('lines', lines);


    const comprovantes: ComprovanteData[] = [];
    let current: Partial<ComprovanteData> = {};
    let collectingDescricoes = false;
    let descricoes: string[] = [];
    let debito: number[] = [];
    let total: number[] = [];
    

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes('AgênciaEstabelecimentoValor Reservado/RestituídoReferência')) {
        const match = lines[i + 1]?.match(/\d{2}\/\d{2}\/\d{4}/);
        if (match) {
            comprovantes.push({
              dataArrecadacao: match[0],
              debito: current.debito ?? [],
              credito: current.credito ?? 0,
              total: current.total || [],
              descricoes: current.descricoes || [],
              
            });
            current = {};
            this.limparArrays(descricoes, debito, total);

          }
      }


      if (line.includes('Composição do Documento de Arrecadação')) {
        collectingDescricoes = true;
        continue;
      }
      
      if (collectingDescricoes) {
        if (line.startsWith('Totais')) {
          collectingDescricoes = false;
          const agruparDescricoeseValores = agruparDescricoesEValores([...descricoes], [...total]);
          current.total = [...agruparDescricoeseValores.totais];
          current.descricoes = [...agruparDescricoeseValores.descricoes];
          current.debito = [...debito];
          this.limparArrays(descricoes, debito, total);

        } else if (/^\d{4}.*\d{1,3},\d{2}$/.test(line)) {
          this.processarValor(line, total);
          this.processarDescricao(line, descricoes, debito);
          current.credito = 5;
        }
      }

      if (line === 'Totais') {
        const totalLine = lines[i + 1];
        if (totalLine) {
          const totalLineTrim = totalLine.trim();
          const priceMatches = totalLineTrim.match(/\d{1,3}(?:\.\d{3})*,\d{2}/g);
          if (priceMatches && priceMatches.length > 0) {
            this.processarMultaEJuros(totalLineTrim, current);
          }
        }
      }
      
    }

    if (current.dataArrecadacao ||current.debito ||current.credito || current.total || current.descricoes) {
      comprovantes.push({
        dataArrecadacao: current.dataArrecadacao || '',
        debito: current.debito || [],
        credito: current.credito ?? 0,
        total: current.total || [],
        descricoes:current.descricoes || [],
       
      });
    }

    return { comprovantes };
  }
  private processarDescricao(line: string, descricoes: string[], debito: number[]) {
    const historico = extrairHistorico(line);
    descricoes.push(historico);
    const mapDebito = mapearDebito(historico);
    debito.push(mapDebito);
  }

  private processarValor(line: string, total: number[]) {
    const valoresHistorico = parseLinhaHistorico(line);
    if (valoresHistorico !== null) {
      total.push(valoresHistorico.principal);
    }
  }

  private processarMultaEJuros(totalLineTrim: string, current: Partial<ComprovanteData>) {
    const parsedValues = parseTotaisLinha(totalLineTrim);
           
    if (parsedValues && parsedValues.somaMultaJuros !== 0) {
      const historicoPG = 'PG. MULTA E JUROS XX';
      const debitoPG = mapearDebito(historicoPG);
      current.descricoes = current.descricoes || [];
      current.descricoes.push(historicoPG);
      current.debito = current.debito || [];
      current.debito.push(debitoPG);
      current.total = current.total || [];
      const jurosEMulta = parsedValues.somaMultaJuros;
      current.total.push(jurosEMulta);
    }
  }

  private limparArrays(...arrays: any[][]) {
    arrays.forEach(arr => arr.length = 0);
  }
}
