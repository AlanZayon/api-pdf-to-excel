import ExcelJS from 'exceljs';
import fs from 'fs';

export class ExcelGenerator {
  static async generate(data: Record<string, any>[], outputPath: string): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Relatório');

    if (data.length === 0) {
      throw new Error('Nenhum dado para gerar o CSV');
    }

    worksheet.columns = [
      { key: 'dataDeArrecadacao', width: 30 },
      { key: 'debito', width: 30 },
      { key: 'credito', width: 30 },
      { key: 'total', width: 30 },
      { key: 'descricao', width: 30 },
      { key: 'divisao', width: 30 },
    ];

    data.forEach(item => {
      worksheet.addRow({
        dataDeArrecadacao: item.dataDeArrecadacao,
        debito: item.debito,
        credito: '',  
        total: item.total,
        descricao: item.descricao,
        divisao: '1',  
      });

      worksheet.addRow({
        dataDeArrecadacao: item.dataDeArrecadacao,
        debito: '', 
        credito: 5,  
        total: item.total,
        descricao: item.descricao,
        divisao: '',  
      });
    });

    const csvContent = await this.convertToCSV(worksheet);
    fs.writeFileSync(outputPath, csvContent);
    console.log('Arquivo CSV gerado com sucesso!');
  }

  private static async convertToCSV(worksheet: ExcelJS.Worksheet): Promise<string> {
    const rows = [];
    
    for (const row of worksheet.getRows(1, worksheet.rowCount)!) {
      const values = row.values as any[];
      

      const line = values
        .slice(1)
        .map(v => {
          if (v instanceof Date) {
            return v.toLocaleDateString('pt-BR'); 
          } else if (typeof v === 'number') {
            return v.toFixed(2).replace('.', ',');
          } else {
            return v ?? '';
          }
        })
        .join(';');
  
      rows.push(line);
    }
  
    return rows.join('\n');
  }
  
}
