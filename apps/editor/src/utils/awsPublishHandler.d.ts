export interface PublishSessionResult {
    sceneId: string;
    assetKey: string;
    uploadUrl: string;
    shareUrl: string;
}
type AwsPublishEnv = Record<string, string | undefined>;
export declare const createPublishSession: (env: AwsPublishEnv, currentPublishId?: string | null) => Promise<PublishSessionResult>;
export declare const getPublishedScene: (sceneId: string, env: AwsPublishEnv) => Promise<{
    assetUrl: string;
} | null>;
export {};
