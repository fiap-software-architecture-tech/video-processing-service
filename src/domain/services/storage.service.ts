import { Readable } from 'stream';

import { StorageDTO } from '#/domain/services/dto/storage.dto';

export interface IStorageService {
    upload(request: StorageDTO): Promise<void>;
    download(key: string): Promise<Readable>;
}
