import { Readable } from 'stream';

export interface StorageDTO {
    key: string;
    body: Buffer | Readable;
    contentType: string;
    contentLength?: number;
}
