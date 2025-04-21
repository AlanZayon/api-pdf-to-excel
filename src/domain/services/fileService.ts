import fs from 'fs';
import path from 'path';

export class FileService {
  private static readonly outputDir = path.join(__dirname, '..', '..','..', 'outputs');
  private static readonly uploadDir = path.join(__dirname, '..', '..','..', 'uploads');

  public static async getSingleFile(): Promise<string> {
    const files = fs.readdirSync(this.outputDir);

    if (files.length === 0) {
      throw new Error('No files available for download');
    }

    return path.join(this.outputDir, files[0]); 
  }

  public static async clearDirectories(): Promise<void> {
    const outputFiles = fs.readdirSync(this.outputDir);
    for (const file of outputFiles) {
      const filePath = path.join(this.outputDir, file);
      fs.unlinkSync(filePath); 
    }

    const uploadFiles = fs.readdirSync(this.uploadDir);
    for (const file of uploadFiles) {
      const filePath = path.join(this.uploadDir, file);
      fs.unlinkSync(filePath); 
    }
  }
}
