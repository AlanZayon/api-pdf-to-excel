# 📄 API de Conversão de PDF → CSV para Domínio

Transforme automaticamente comprovantes (DARF/DAS) em um arquivo CSV pronto para importação no sistema contábil Domínio.

Este README está dividido em duas partes:
- Para quem não é técnico: visão simples, como usar e exemplos visuais
- Para quem é técnico: endpoints, arquitetura, requisitos e observações

---

## 👀 Para quem não é técnico

### O que esta API faz
- Recebe um PDF de comprovante (DARF/DAS)
- Extrai as informações necessárias
- Gera um arquivo CSV pronto para o Domínio
- Permite baixar o arquivo gerado

### Como usar (passo a passo)
1) Abra o sistema que usa esta API (ou peça para o responsável técnico subir a API localmente)
2) Envie o PDF pela opção “Enviar PDF”
3) Aguarde o processamento
4) Baixe o CSV gerado e importe no Domínio

### Exemplo visual

- Espaço para imagem (upload do PDF):
  ![Tela de upload do PDF](./images/Captura%20de%20tela%202025-12-01%20192839.png)
  Descrição: Tela onde você seleciona e envia o arquivo PDF para processamento.

- Espaço para vídeo curto (fluxo completo):
  [Assista ao vídeo de demonstração](./videos/eb778703-c0cf-44cf-ac5e-37d5a47698c0.gif)
  Descrição: Demonstração do envio do PDF e download do CSV.

---

## 🧑‍💻 Para quem é técnico

### Como executar localmente

Requisitos:
- Node.js 18+

Passos:
- Instalar dependências:
  npm install
- Rodar em desenvolvimento:
  npm run dev
- Rodar em produção:
  npm run build && npm start

Por padrão roda em http://localhost:3000.

### Endpoints

#### 📤 POST /api/upload
Envia um arquivo PDF para processamento.

Headers:
- Content-Type: multipart/form-data

Form Data:
- pdfFile (file) obrigatório – PDF do comprovante (DARF/DAS)

Exemplo de resposta 200:
{
  "result": {
    "message": "Processamento concluído",
    "outputPath": "outputs/relatorio.csv"
  }
}

Erros comuns:
- 400 { "message": "Arquivo não enviado." }
- 500 { "message": "Erro ao processar PDF", "error": { ... } }

#### 📥 GET /api/download
Baixa o último arquivo CSV gerado.

Resposta:
- Content-Type: text/csv
- Content-Disposition: attachment
- 404 se não houver arquivo disponível

Exemplo com curl:
 curl -O http://localhost:3000/api/download

---

### Funcionamento interno (resumo)

- UploadController chama ProcessPdfUseCase
- PdfProcessorService lê e interpreta o PDF
- ExcelGenerator gera o CSV com cabeçalhos:
  dataDeArrecadacao;debito;credito;total;descricao;divisao
- Para cada item são geradas duas linhas:
  - 1 com o débito
  - 1 com o crédito fixo = 5

Após o download do CSV, as pastas uploads/ e outputs/ são limpas.

### Estrutura de pastas

src/
├── application/use-cases/process-pdf/
│   ├── ProcessPdfCommand.ts
│   └── ProcessPdfUseCase.ts
├── domain/services/
│   ├── PdfProcessorService.ts
│   └── FileService.ts
├── infrastructure/
│   ├── controllers/
│   │   ├── UploadController.ts
│   │   └── DownloadController.ts
│   ├── middlewares/
│   │   └── uploadMiddleware.ts
│   └── routes/
│       ├── uploadRoutes.ts
│       └── downloadRoutes.ts
├── shared/utils/
│   ├── ExcelGenerator.ts
│   └── pdfUtilsHistoryFormat.ts
└── shared/logging/
    └── logger.ts

### Dependências principais
- express
- multer
- pdf-parse
- exceljs

### Exemplo de CSV gerado
08/01/2024;191;;145,20;PG. INSS XX;1
08/01/2024;;5;;145,20;PG. INSS XX;

### Observações importantes
- Após o download, o CSV e o PDF original são removidos automaticamente
- Apenas um arquivo é mantido em cache (o último processado)
- Garanta permissões de escrita nas pastas uploads/ e outputs/

---

## 🧱 Roadmap simples (opcional)
- Validação de layout de PDF (regras por tipo de documento)
- Histórico de arquivos processados
- Autenticação e limites de tamanho
- Exportação adicional para XLSX

---

## Este projeto demonstra:

- Node.js / Express
- Upload e parsing de PDF
- Geração de CSV (exceljs)
- Arquitetura modular
- Middlewares e controllers
- Clean architecture (aplicação, domínio, infraestrutura)
- Logging
- Manipulação de arquivos (multer)
- Boas práticas de API

## Desenvolvido 100% por mim, incluindo:

- Arquitetura
- Implementação da API
- Processamento de PDF
- Generator de CSV
- Documentação e demonstração

## 📄 Licença
Distribuído sob a licença MIT. Consulte o arquivo LICENSE.