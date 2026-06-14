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
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { createPublishSession, getPublishedScene } from "./src/utils/awsPublishHandler";
var require = createRequire(import.meta.url);
var threePackageJson = require.resolve("three/package.json");
var threeRealDir = path.dirname(fs.realpathSync(threePackageJson));
var threeModulePath = path.resolve(threeRealDir, "build/three.module.js");
var editorConfigDir = fileURLToPath(new URL(".", import.meta.url));
var repoRootDir = path.resolve(editorConfigDir, "../..");
var awsPublishRoutePlugin = function (env) { return ({
    name: "libre3d-aws-publish-route",
    configureServer: function (server) {
        var _this = this;
        server.middlewares.use(function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var sceneId, sceneData, error_1, message, bodyStr, currentPublishId, parsed, session, error_2, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(req.url && req.url.startsWith("/api/scene/") && req.method === "GET")) return [3 /*break*/, 5];
                        sceneId = req.url.slice("/api/scene/".length);
                        if (!sceneId) {
                            res.statusCode = 400;
                            res.setHeader("Content-Type", "application/json");
                            res.end(JSON.stringify({ error: "Missing sceneId parameter" }));
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, getPublishedScene(sceneId, env)];
                    case 2:
                        sceneData = _a.sent();
                        if (!sceneData) {
                            res.statusCode = 404;
                            res.setHeader("Content-Type", "application/json");
                            res.end(JSON.stringify({ error: "Scene not found" }));
                            return [2 /*return*/];
                        }
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.end(JSON.stringify({ cloudAssetUrl: sceneData.assetUrl }));
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error("Vite Backend Error:", error_1);
                        message = error_1 instanceof Error ? error_1.message : "Unable to retrieve scene.";
                        res.statusCode = 500;
                        res.setHeader("Content-Type", "application/json");
                        res.end(JSON.stringify({ error: message }));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                    case 5:
                        if (!(req.url === "/api/publish" && req.method === "POST")) return [3 /*break*/, 11];
                        _a.label = 6;
                    case 6:
                        _a.trys.push([6, 9, , 10]);
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                var body = "";
                                req.on("data", function (chunk) {
                                    body += chunk;
                                });
                                req.on("end", function () {
                                    resolve(body);
                                });
                                req.on("error", function (err) {
                                    reject(err);
                                });
                            })];
                    case 7:
                        bodyStr = _a.sent();
                        currentPublishId = null;
                        if (bodyStr) {
                            try {
                                parsed = JSON.parse(bodyStr);
                                currentPublishId = parsed.currentPublishId || null;
                            }
                            catch (_b) {
                                // Ignore invalid JSON
                            }
                        }
                        return [4 /*yield*/, createPublishSession(env, currentPublishId)];
                    case 8:
                        session = _a.sent();
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.end(JSON.stringify(session));
                        return [3 /*break*/, 10];
                    case 9:
                        error_2 = _a.sent();
                        console.error("Vite Backend Error:", error_2);
                        message = error_2 instanceof Error ? error_2.message : "Unable to create publish session.";
                        res.statusCode = 500;
                        res.setHeader("Content-Type", "application/json");
                        res.end(JSON.stringify({ error: message }));
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                    case 11:
                        if (req.url !== "/api/publish" || req.method !== "POST") {
                            next();
                            return [2 /*return*/];
                        }
                        return [2 /*return*/];
                }
            });
        }); });
    },
}); };
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var env = loadEnv(mode, repoRootDir, "");
    return {
        plugins: [react(), awsPublishRoutePlugin(env)],
        resolve: {
            alias: {
                three: threeModulePath,
            },
            dedupe: ["three"],
        },
        optimizeDeps: {
            exclude: ["three"],
        },
        server: {
            port: 5173,
            strictPort: true,
        },
    };
});
