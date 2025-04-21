import ExcelJS from 'exceljs';

export class ExcelGenerator {
  static async generate(data: Record<string, any>[], outputPath: string): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Relatório');

    console.debug('Gerando Excel com os dados:', data);

    if (data.length === 0) {
      throw new Error('Nenhum dado para gerar o Excel');
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

    await workbook.xlsx.writeFile(outputPath);
  }
}
