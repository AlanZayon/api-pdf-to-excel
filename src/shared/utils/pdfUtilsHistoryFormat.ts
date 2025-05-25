export function extrairHistorico(linha: string): string {
  const linhaMaiuscula = linha.toUpperCase();

  const termosComuns = [
    "SIMPLES NACIONAL",
    "MULTA E JUROS",
    "MULTA"
  ];

  const tributosComParcelamento = [
    "PIS",
    "COFINS",
    "IRPJ",
    "CSLL",
    "ISS",
    "IRRF"
  ];

  const termosEspeciais: Record<string, string> = {
    "SIMP NAC": "SIMPLES NACIONAL",
    "CONTR PREV DESCONTA SEGURADO": "INSS",
    "CP": "INSS",
    "CONTRIB PREVID PATRONAL": "INSS",
    "CONTRIBUIÇÃO PREVID SEGURADOS": "INSS",
    "CONTR PREVIDENCIÁRIA EMPREGADOR/EMPRESA": "INSS",
    "CONTRIB PREV RISCO AMBIENTAL/APOSENT ESPECIAL": "INSS",
    "CONTRIBUIÇÃO TERCEIROS": "INSS",
    "CIDE": "INSS",
    "CONTRIBUIÇÃO EMPRESA/EMPREGADOR": "INSS",
    "CONTRIB TERC": "INSS",
    "CONTRIB RISCO AMB/APOSENT ESPECIAL": "INSS",
  };

  const prioridades = [
    ...termosComuns,
    ...tributosComParcelamento,
    ...Object.keys(termosEspeciais)
  ];

  for (const termo of prioridades) {
    if (linhaMaiuscula.includes(termo)) {
      let historico = termosEspeciais[termo] || termo;

      const temParcelamento = tributosComParcelamento.includes(termo) && linhaMaiuscula.includes("PARCELAMENTO");

      if (temParcelamento) {
        historico += " PARCELAMENTO";
      }

      return `PG. ${historico} XX`;
    }
  }

  return "PG. DESCONHECIDO XX";
}




export function mapearDebito(historico: string[]): number[] {
  return historico.map(item => {
    const h = item.toUpperCase();

    if (h.includes("SIMPLES NACIONAL")) return 531;
    if (h.includes("PIS")) return 179;
    if (h.includes("COFINS")) return 180;
    if (h.includes("IRPJ")) return 174;
    if (h.includes("CSLL")) return 175;
    if (h.includes("ISS")) return 173;
    if (h.includes("MULTA E JUROS")) return 352;
    if (h.includes("MULTA") || h.includes("DESCONHECIDO")) return 350;
    if (h.includes("INSS")) return 191;
    if (h.includes("IRRF")) return 178;

    return 0;
  });
}


  export function agruparDescricoesEValores(descricoes: string[], totais: number[]): { descricoes: string[], totais: number[] } {
    const mapa = new Map<string, number>();
  
    for (let i = 0; i < descricoes.length; i++) {
      const descricao = descricoes[i];
      const valor = totais[i];
  
      if (mapa.has(descricao)) {
        mapa.set(descricao, mapa.get(descricao)! + valor);
      } else {
        mapa.set(descricao, valor);
      }
    }
  
    return {
      descricoes: Array.from(mapa.keys()),
      totais: Array.from(mapa.values()).map(v => parseFloat(v.toFixed(2))),
    };
  }
  

    export function parseLinhaHistorico(linha: string) {
      const valores = [...linha.matchAll(/(-|\d{1,3}(?:\.\d{3})*,\d{2})/g)].map((v) => v[0]);
    
      if (valores.length < 4) return null;
    
      const [principal, multa, juros, total] = valores.slice(-4);
    
      const toNumber = (val: string) =>
        parseFloat((val === '-' ? '0,00' : val).replace(/\./g, '').replace(',', '.'));
    
      return {
        principal: toNumber(principal),
        multa: toNumber(multa),
        juros: toNumber(juros),
        total: toNumber(total),
      };
    }
  

  export function parseTotaisLinha(linha: string) {
    const valoresStr = linha
      .replace(/-/g, '0,00')
      .match(/(\d{1,3}(?:\.\d{3})*,\d{2})/g);
  
    if (!valoresStr || valoresStr.length !== 4) return null;
  
    const valoresNum = valoresStr.map(v =>
      parseFloat(v.replace(/\./g, '').replace(',', '.'))
    );

    const somaMultaJuros = (valoresNum[1] + valoresNum[2]).toFixed(2);
  
    return {
      principal: valoresNum[0],
      multa: valoresNum[1],
      juros: valoresNum[2],
      total: valoresNum[3],
      somaMultaJuros: parseFloat(somaMultaJuros),
    };
  }
  
  
  
