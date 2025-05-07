# 📄 API de Conversão de PDF  → CSV para Domínio

## 📌 Visão Geral

API desenvolvida para automatizar o processamento de escrituração de comprovantes de arrecadação em PDF e geração de um arquivo `.csv` compatível com o sistema contábil **Domínio**.

---

## 🔗 Endpoints

### 📤 `POST /api/upload`

> Envia um arquivo PDF para ser processado.

#### Headers
```http
Content-Type: multipart/form-data
```

#### Form Data
| Campo     | Tipo   | Obrigatório | Descrição                                |
|-----------|--------|-------------|--------------------------------------------|
| `pdfFile` | `file` | Sim         | Arquivo PDF     |

#### Resposta 200 OK
```json
{
  "result": {
    "message": "Processamento concluído",
    "outputPath": "outputs/relatorio.csv"
  }
}
```

#### Resposta 400
```json
{ "message": "Arquivo não enviado." }
```

#### Resposta 500
```json
{ "message": "Erro ao processar PDF", "error": { ... } }
```

---

### 📥 `GET /api/download`

> Faz o download do último arquivo `.csv` gerado.

#### Resposta
- Tipo: `text/csv`
- Cabeçalho de download: `Content-Disposition: attachment`
- Se não houver arquivo, responde `404 Not Found`.

#### Exemplo com `curl`
```bash
curl -O http://localhost:3000/api/download
```

---

## 🔧 Funcionamento Interno

### Upload + Processamento

- `UploadController` chama `ProcessPdfUseCase`
- `PdfProcessorService` lê e interpreta o conteúdo do PDF
- `ExcelGenerator` gera `.csv` com estrutura:

```
dataDeArrecadacao;debito;credito;total;descricao;divisao
```

Cada item gera **duas linhas**:
- 1 com o **débito**
- 1 com o **crédito fixo = 5**

---

### Download + Limpeza

- `DownloadController.downloadFile()`:
  - Busca o único arquivo `.csv` em `outputs/`
  - Faz o `res.download(filePath)`
  - Em seguida, limpa pastas `uploads/` e `outputs/`

---

## 📁 Estrutura de Pastas

```
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
```

---

## 🛠️ Requisitos

- Node.js 18+
- Pacotes:
  - `express`
  - `multer`
  - `pdf-parse`
  - `exceljs`
  - `fs` / `path`

---

## ✅ Exemplo de CSV Gerado

```csv
08/01/2024;191;;145,20;PG. INSS XX;1
08/01/2024;;5;;145,20;PG. INSS XX;
```

---

## 📌 Observações

- Após o download, o arquivo `.csv` e o `.pdf` original são excluídos automaticamente.
- Apenas **um arquivo por vez** é mantido em cache (último processado).
