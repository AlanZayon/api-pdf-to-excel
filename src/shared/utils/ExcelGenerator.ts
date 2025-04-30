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

    // Gerar CSV
    const csvContent = await this.convertToCSV(worksheet);
    fs.writeFileSync(outputPath, csvContent);
    console.log('Arquivo CSV gerado com sucesso!');
  }

  private static async convertToCSV(worksheet: ExcelJS.Worksheet): Promise<string> {
    let csvContent = '';
    worksheet.eachRow({ includeEmpty: true }, (row) => {
      const rowValues = Array.isArray(row.values) ? row.values.slice(1) : [];
      csvContent += rowValues.join(',') + '\n';
    });
    return csvContent;
  }
}
