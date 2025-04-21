export function extrairHistorico(linha: string): string {
    let historico = '';
  
    if (linha.includes("SIMPLES NACIONAL")) {
      historico = "SIMPLES NACIONAL";
    } else {
      const semValores = linha.replace(/\d{1,3}(?:\.\d{3})*,\d{2}/g, '');
      const semNumerosIniciais = semValores.replace(/^\d+\s*/, '');
      const match = semNumerosIniciais.match(/^([^-–,\d]+)/);
      historico = match ? match[1].trim() : semNumerosIniciais.trim();
    }
  
    return `PG. ${historico} XX`;
  }

  export function mapearDebito(historico: string): number {
    const h = historico.toUpperCase();
    if (h.includes("SIMPLES")) return 531;
    if (h.includes("PIS")) return 179;
    if (h.includes("COFINS")) return 180;
    if (h.includes("IRPJ")) return 174;
    if (h.includes("CSLL")) return 175;
    if (h.includes("ISS")) return 173;
    if (h.includes("MULTA")) return 350;
    return 0; 
  }

  export function  agruparDescricoes(descricoes: string[]): string[] {
    return Array.from(new Set(descricoes));
  }
  
  