"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignController = void 0;
const express_1 = __importDefault(require("express"));
const campaignServices = __importStar(require("../services/campaign-services"));
exports.campaignController = express_1.default.Router()
    // get campaign packs for admins
    .get('/all', async (req, res) => {
    const campaignPacks = await campaignServices.getCampaignPacksService(req.user);
    res.json({ success: !!campaignPacks, campaignPacks });
})
    .get('/assignment', async (req, res) => {
    const campaignAssignments = await campaignServices.getCampaignPacksByUserService(req.user);
    res.json({ success: !!campaignAssignments, campaignAssignments });
})
    // get campaign pack
    .get('/:id', async (req, res) => {
    const id = req.params.id;
    const campaignPack = await campaignServices.getCampaignPackService(req.user, id);
    res.json({ success: !!campaignPack, campaignPack });
})
    // edit checkbox
    .patch('/', async (req, res) => {
    const id = req.body.id;
    const phoneNumber = req.body.phoneNumber;
    const checked = req.body.checked;
    const campaignPack = await campaignServices.editCampaignPackService(req.user, id, phoneNumber, checked);
    res.json({ success: !!campaignPack, campaignPack });
})
    // close pack
    .patch('/all', async (req, res) => {
    const id = req.body.id;
    const success = await campaignServices.closeCampaignPackService(req.user, id);
    res.json({ success });
})
    // assign campaign pack to user by email
    .put('/:id', async (req, res) => {
    const email = req.body.email;
    const id = req.params.id;
    const success = await campaignServices.assignCampaignPackService(req.user, id, email);
    res.json({ success });
})
    // get campaign packs for user
    .post('/new-pack', async (req, res) => {
    const success = await campaignServices.askForANewCampaignPackService(req.user);
    res.json({ success });
})
    // change accessibility mode
    .patch('/accessibility', async (req, res) => {
    const id = req.body.id;
    const accessible = req.body.accessible;
    const success = await campaignServices.enableAccesibilityModeService(req.user, id, accessible);
    res.json({ success });
});
