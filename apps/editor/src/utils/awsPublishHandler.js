var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { randomUUID } from "node:crypto";
import { DynamoDBClient, PutItemCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
var readRequiredEnv = function (env, name) {
    var value = env[name];
    if (!value) {
        throw new Error("Missing required environment variable: ".concat(name));
    }
    return value;
};
var readConfig = function (env) { return ({
    region: readRequiredEnv(env, "AWS_REGION"),
    bucketName: readRequiredEnv(env, "S3_BUCKET_NAME"),
    tableName: readRequiredEnv(env, "DYNAMODB_TABLE_NAME"),
    accessKeyId: readRequiredEnv(env, "AWS_ACCESS_KEY_ID"),
    secretAccessKey: readRequiredEnv(env, "AWS_SECRET_ACCESS_KEY"),
}); };
var createS3Client = function (config) {
    return new S3Client({
        region: config.region,
        credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
        },
    });
};
var createDynamoClient = function (config) {
    return new DynamoDBClient({
        region: config.region,
        credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
        },
    });
};
var createShareUrl = function (sceneId) { return "http://localhost:5173/v/".concat(sceneId); };
var createAssetUrl = function (config, assetKey) {
    return "https://".concat(config.bucketName, ".s3.").concat(config.region, ".amazonaws.com/").concat(assetKey);
};
export var createPublishSession = function (env, currentPublishId) { return __awaiter(void 0, void 0, void 0, function () {
    var config, s3Client, dynamoClient, sceneId, assetKey, assetUrl, uploadUrl;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                config = readConfig(env);
                s3Client = createS3Client(config);
                dynamoClient = createDynamoClient(config);
                sceneId = currentPublishId && currentPublishId.trim() ? currentPublishId : randomUUID();
                assetKey = "scenes/".concat(sceneId, ".glb");
                assetUrl = createAssetUrl(config, assetKey);
                return [4 /*yield*/, getSignedUrl(s3Client, new PutObjectCommand({
                        Bucket: config.bucketName,
                        Key: assetKey,
                        ContentType: "model/gltf-binary",
                    }), { expiresIn: 900 })];
            case 1:
                uploadUrl = _a.sent();
                return [4 /*yield*/, dynamoClient.send(new PutItemCommand({
                        TableName: config.tableName,
                        Item: {
                            sceneId: { S: sceneId },
                            assetKey: { S: assetKey },
                            assetUrl: { S: assetUrl },
                            shareUrl: { S: createShareUrl(sceneId) },
                            createdAt: { S: new Date().toISOString() },
                        },
                    }))];
            case 2:
                _a.sent();
                return [2 /*return*/, {
                        sceneId: sceneId,
                        assetKey: assetKey,
                        uploadUrl: uploadUrl,
                        shareUrl: createShareUrl(sceneId),
                    }];
        }
    });
}); };
export var getPublishedScene = function (sceneId, env) { return __awaiter(void 0, void 0, void 0, function () {
    var config, dynamoClient, response, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                config = readConfig(env);
                dynamoClient = createDynamoClient(config);
                return [4 /*yield*/, dynamoClient.send(new GetItemCommand({
                        TableName: config.tableName,
                        Key: {
                            sceneId: { S: sceneId },
                        },
                    }))];
            case 1:
                response = _a.sent();
                if (!response.Item || !response.Item.assetUrl || !response.Item.assetUrl.S) {
                    return [2 /*return*/, null];
                }
                return [2 /*return*/, {
                        assetUrl: response.Item.assetUrl.S,
                    }];
            case 2:
                error_1 = _a.sent();
                console.error("Failed to retrieve scene from DynamoDB:", error_1);
                return [2 /*return*/, null];
            case 3: return [2 /*return*/];
        }
    });
}); };
