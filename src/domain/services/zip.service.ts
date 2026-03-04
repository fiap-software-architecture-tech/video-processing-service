export interface IZipService {
    execute(sourceDir: string): Promise<string>;
}
