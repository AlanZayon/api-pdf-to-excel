import * as fs from 'fs/promises';
import pdf from 'pdf-parse';
import { 
  extrairHistorico, 
  mapearDebito, 
  agruparDescricoesEValores, 
  parseLinhaHistorico, 
  parseTotaisLinha 
} from '../../shared/utils/pdfUtilsHistoryFormat';

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
  private current: ComprovanteData = this.inicializarCurrent();
  private descricoes: string[] = [];
  private debitos: number[] = [];
  private totais: number[] = [];

  async process(filePath: string): Promise<ProcessedPdfData> {
    const buffer = await fs.readFile(filePath);
    const pdfData = await pdf(buffer);
    const lines = pdfData.text.split('\n').map(line => line.trim()).filter(Boolean);

    const comprovantes: ComprovanteData[] = [];
    let collectingDescricoes = false;
    let waitingFinish = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes('AgênciaEstabelecimentoValor Reservado/RestituídoReferência')) {
        this.extrairDataArrecadacao(lines[i + 1]);
        if(waitingFinish) {
        this.finalizarComprovante(comprovantes);
        waitingFinish = false;
        }
        continue;
      }

      if (line.includes('Composição do Documento de Arrecadação')) {
        collectingDescricoes = true;
        continue;
      }

      if (collectingDescricoes) {
        if (line.startsWith('Totais')) {
          collectingDescricoes = false;
          this.processarTotais();
        } else if (/^\d{4}(?=.*[A-Za-z]).*\d{1,3},\d{2}$/.test(line)) {
          console.log('Linha de pagamento:', line);
          this.processarLinhaPagamento(line);
        }
      }

      if (line === 'Totais') {
        this.processarLinhaTotais(lines[i + 1]);
        waitingFinish = true;
      }
    }

    this.finalizarComprovante(comprovantes);
    return { comprovantes };
  }

  private inicializarCurrent(): ComprovanteData {
    return {
      dataArrecadacao: '',
      debito: [],
      credito: 0,
      total: [],
      descricoes: []
    };
  }

  private extrairDataArrecadacao(line: string): void {
    const dateRegex = /\d{2}\/\d{2}\/\d{4}/;
    const match = line.match(dateRegex);
    if (match) {
      this.current.dataArrecadacao = match[0];
    }
  }

  private processarLinhaPagamento(line: string) {
    const valoresHistorico = parseLinhaHistorico(line);
    if (!valoresHistorico) return;

    this.totais.push(valoresHistorico.principal);
    
    const historico = extrairHistorico(line);
    this.descricoes.push(historico);
  }

  private processarTotais() {
    const { descricoes, totais } = agruparDescricoesEValores(
      [...this.descricoes],
      [...this.totais]
    );

    this.debitos.push(...mapearDebito(descricoes));

    this.current = {
      ...this.current,
      descricoes,
      total: totais,
      debito: [...this.debitos],
      credito: this.calcularCredito()
    };

    this.limparArraysTemporarios();
  }

  private processarLinhaTotais(totalLine: string) {
    if (!totalLine) return;
    
    const totalLineTrim = totalLine.trim();
    const priceMatches = totalLineTrim.match(/\d{1,3}(?:\.\d{3})*,\d{2}/g);
    if (!priceMatches?.length) return;

    this.processarMultaEJuros(totalLineTrim);
  }

  private processarMultaEJuros(totalLineTrim: string) {
    const parsedValues = parseTotaisLinha(totalLineTrim);
    if (!parsedValues?.somaMultaJuros) return;

    this.current.descricoes.push('PG. MULTA E JUROS XX');
    this.current.debito.push(...mapearDebito(['PG. MULTA E JUROS XX']));
    this.current.total.push(parsedValues.somaMultaJuros);
  }

  private finalizarComprovante(comprovantes: ComprovanteData[]) {
    if (!this.current.dataArrecadacao && this.current.total.length === 0) return;

    comprovantes.push({ ...this.current });
    this.resetarEstado();
  }

  private resetarEstado() {
    this.current = this.inicializarCurrent();
    this.limparArraysTemporarios();
  }

  private limparArraysTemporarios() {
    this.descricoes = [];
    this.debitos = [];
    this.totais = [];
  }

  private calcularCredito(): number {
    // Lógica personalizada para calcular crédito se necessário
    return 5;
  }
}