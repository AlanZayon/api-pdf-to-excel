import { Request, Response } from 'express';
import { FileService } from '../../domain/services/fileService';

export class DownloadController {
  public static async downloadFile(req: Request, res: Response): Promise<void> {
    try {
      const filePath = await FileService.getSingleFile();
      
      res.download(filePath, (err) => {
        if (err) {
          res.status(500).send('Error downloading file');
        } else {
          FileService.clearDirectories().catch((error: unknown): void => {
            console.error('Error clearing directories:', error);
          });
        }
      });
    } catch (error) {
        console.error('Error getting file for download:', error);
      res.status(404).send('No file available for download');
    }
  }
}
