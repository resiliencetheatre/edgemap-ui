export * from "./adapters";
export interface BufferPosition {
    buf: Uint8Array;
    pos: number;
}
export declare function readVarint(p: BufferPosition): number;
export declare function zxyToTileId(z: number, x: number, y: number): number;
export declare function tileIdToZxy(i: number): [number, number, number];
export interface Entry {
    tileId: number;
    offset: number;
    length: number;
    runLength: number;
}
export declare enum Compression {
    Unknown = 0,
    None = 1,
    Gzip = 2,
    Brotli = 3,
    Zstd = 4
}
declare type DecompressFunc = (buf: ArrayBuffer, compression: Compression) => Promise<ArrayBuffer>;
export declare enum TileType {
    Unknown = 0,
    Mvt = 1,
    Png = 2,
    Jpeg = 3,
    Webp = 4,
    Avif = 5
}
export interface Header {
    specVersion: number;
    rootDirectoryOffset: number;
    rootDirectoryLength: number;
    jsonMetadataOffset: number;
    jsonMetadataLength: number;
    leafDirectoryOffset: number;
    leafDirectoryLength?: number;
    tileDataOffset: number;
    tileDataLength?: number;
    numAddressedTiles: number;
    numTileEntries: number;
    numTileContents: number;
    clustered: boolean;
    internalCompression: Compression;
    tileCompression: Compression;
    tileType: TileType;
    minZoom: number;
    maxZoom: number;
    minLon: number;
    minLat: number;
    maxLon: number;
    maxLat: number;
    centerZoom: number;
    centerLon: number;
    centerLat: number;
    etag?: string;
}
export declare function findTile(entries: Entry[], tileId: number): Entry | null;
export interface RangeResponse {
    data: ArrayBuffer;
    etag?: string;
    expires?: string;
    cacheControl?: string;
}
export interface Source {
    getBytes: (offset: number, length: number, signal?: AbortSignal) => Promise<RangeResponse>;
    getKey: () => string;
}
export declare class FileAPISource implements Source {
    file: File;
    constructor(file: File);
    getKey(): string;
    getBytes(offset: number, length: number): Promise<RangeResponse>;
}
export declare class FetchSource implements Source {
    url: string;
    customHeaders: Headers;
    constructor(url: string, customHeaders?: Headers);
    getKey(): string;
    setHeaders(customHeaders: Headers): void;
    getBytes(offset: number, length: number, signal?: AbortSignal): Promise<RangeResponse>;
}
export declare function getUint64(v: DataView, offset: number): number;
export declare function bytesToHeader(bytes: ArrayBuffer, etag?: string): Header;
export declare class EtagMismatch extends Error {
}
export interface Cache {
    getHeader: (source: Source, current_etag?: string) => Promise<Header>;
    getDirectory: (source: Source, offset: number, length: number, header: Header) => Promise<Entry[]>;
    getArrayBuffer: (source: Source, offset: number, length: number, header: Header) => Promise<ArrayBuffer>;
    invalidate: (source: Source, current_etag: string) => Promise<void>;
}
interface ResolvedValue {
    lastUsed: number;
    data: Header | Entry[] | ArrayBuffer;
}
export declare class ResolvedValueCache {
    cache: Map<string, ResolvedValue>;
    maxCacheEntries: number;
    counter: number;
    prefetch: boolean;
    decompress: DecompressFunc;
    constructor(maxCacheEntries?: number, prefetch?: boolean, decompress?: DecompressFunc);
    getHeader(source: Source, current_etag?: string): Promise<Header>;
    getDirectory(source: Source, offset: number, length: number, header: Header): Promise<Entry[]>;
    getArrayBuffer(source: Source, offset: number, length: number, header: Header): Promise<ArrayBuffer>;
    prune(): void;
    invalidate(source: Source, current_etag: string): Promise<void>;
}
interface SharedPromiseCacheValue {
    lastUsed: number;
    data: Promise<Header | Entry[] | ArrayBuffer>;
}
export declare class SharedPromiseCache {
    cache: Map<string, SharedPromiseCacheValue>;
    maxCacheEntries: number;
    counter: number;
    prefetch: boolean;
    decompress: DecompressFunc;
    constructor(maxCacheEntries?: number, prefetch?: boolean, decompress?: DecompressFunc);
    getHeader(source: Source, current_etag?: string): Promise<Header>;
    getDirectory(source: Source, offset: number, length: number, header: Header): Promise<Entry[]>;
    getArrayBuffer(source: Source, offset: number, length: number, header: Header): Promise<ArrayBuffer>;
    prune(): void;
    invalidate(source: Source, current_etag: string): Promise<void>;
}
export declare class PMTiles {
    source: Source;
    cache: Cache;
    decompress: DecompressFunc;
    constructor(source: Source | string, cache?: Cache, decompress?: DecompressFunc);
    getHeader(): Promise<Header>;
    getZxyAttempt(z: number, x: number, y: number, signal?: AbortSignal): Promise<RangeResponse | undefined>;
    getZxy(z: number, x: number, y: number, signal?: AbortSignal): Promise<RangeResponse | undefined>;
    getMetadataAttempt(): Promise<any>;
    getMetadata(): Promise<any>;
}
