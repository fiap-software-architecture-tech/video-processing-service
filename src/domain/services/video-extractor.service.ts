export interface IVideoExtractorService {
    execute(videoPath: string): Promise<string>;
}
