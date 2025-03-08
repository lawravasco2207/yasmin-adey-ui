"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/link.ts
const express_1 = __importDefault(require("express"));
const linkController_1 = require("../controllers/linkController");
const linkRouter = express_1.default.Router();
linkRouter.post('/add', linkController_1.addLink);
linkRouter.get('/', linkController_1.getLinks);
linkRouter.delete('/:id', linkController_1.deleteLink);
exports.default = linkRouter;
//# sourceMappingURL=links.js.map