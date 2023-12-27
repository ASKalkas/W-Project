const chatModel = require("../Models/chatModel");
const userModel = require("../Models/userModel");
const notificationModel = require("../Models/notificationModel");
const crypto = require("crypto");
const { timeStamp } = require("console");
require("dotenv").config();

const chatsController = {
	createChat: async (req, res) => {
		try {
			const { userID, agentId } = req.body;
			let selectedAgentID = agentId;

			if (!agentId) {
				const agents = await userModel.find({ role: "agent" });
				const notification = await notificationModel.find();
				const notifiedAgentIds = notification.map((notification) =>
					notification.agentId.toString()
				);

				const randomIndex = Math.floor(Math.random() * agents.length);
				selectedAgentID = agents[randomIndex]._id.toString();
			}

			const newChat = new chatModel({
				userID,
				agentId: selectedAgentID,
			});

			await newChat.save();
			res.status(200).json({
				message: "Chat created successfully",
				newChat: newChat,
			});
		} catch (error) {
			console.error("Error in chatsController.createChat: ", error);
			res.status(500).json({ message: "Internal Server Error" });
		}
	},
	addMessage: async (req, res) => {
		try {
			const { _id } = req.query;
			const { message, senderId } = req.body;
			const chat = await chatModel.findById(_id);
			const user = await userModel.findById(senderId);
			const senderUsername = user.profile.username;
			const encryptionKey = process.env.ENCRYPTION_KEY;
			const IV = process.env.IV;
			const cipher = crypto.createCipheriv(
				"aes-256-cbc",
				Buffer.from(encryptionKey, "hex"),
				Buffer.from(IV, "hex")
			);
			const encrypted = Buffer.concat([
				cipher.update(message, "utf-8"),
				cipher.final(),
			]).toString("base64");
			chat.chat.push({ message: encrypted, senderId, senderUsername });
			await chat.save();
			res.status(200).json({ message: "Message added successfully" });
		} catch (error) {
			console.error("Error in chatsController.addMessage: ", error);
			res.status(500).json({ message: "Internal Server Error" });
		}
	},
	getChats: async (req, res) => {
		try {
			const { agentId, _id } = req.query;

			if (agentId) {
				const chat = await chatModel.find({ agentId });
				if (!chat) {
					return res.status(404).json({ message: "Chat not found" });
				}
				const messages = chat.chat;
				return res.status(200).json({ chat });
			}
			if (_id) {
				const chat = await chatModel.findById(_id);
				if (!chat) {
					return res.status(404).json({ message: "Chat not found" });
				}
				const encryptionKey = process.env.ENCRYPTION_KEY;
				const IV = process.env.IV;
				chat.chat.map((message) => {
					const restored = Buffer.from(message.message, "base64");
					const decipher = crypto.createDecipheriv(
						"aes-256-cbc",
						Buffer.from(encryptionKey, "hex"),
						Buffer.from(IV, "hex")
					);
					const decrypted = Buffer.concat([
						decipher.update(restored),
						decipher.final(),
					]);
					message.message = decrypted.toString("utf-8");
				});
				return res.status(200).json({ chat });
			}
			const chat = await chatModel.find({}).sort({ timestamp: -1 });
			if (!chat) {
				return res.status(404).json({ message: "Chat not found" });
			}
			const messages = chat.chat;
			res.status(200).json({ chat });
		} catch (error) {
			console.error("Error in chatsController.getChat: ", error);
			res.status(500).json({ message: "Internal Server Error" });
		}
	},
	createNotification: async (req, res) => {
		try {
			const { agentId, message, chatId } = req.body;
			const notification = await notificationModel.findOne({
				agentId: agentId,
				message: message,
				chatId: chatId,
			});

			if (notification) {
				return res.status(400).json({ message: "Notification already exists" });
			}
			const newNotification = new notificationModel({
				agentId,
				message,
				chatId,
			});

			await newNotification.save();
			res.status(200).json({ message: "Notification created successfully" });
		} catch (error) {
			console.error("Error in chatsController.createNotification: ", error);
			res.status(500).json({ message: "Internal Server Error" });
		}
	},
	getNotification: async (req, res) => {
		try {
			const { agentId } = req.query;
			const notification = await notificationModel.find({
				agentId: agentId,
			});
			if (!notification) {
				return res.status(400).json({ message: "No notification found" });
			}
			res.status(200).json({ notification: notification });
		} catch (error) {
			console.error("Error in chatsController.getNotification: ", error);
			res.status(500).json({ message: "Internal Server Error" });
		}
	},
	deleteNotification: async (req, res) => {
		try {
			const { _id } = req.query;
			const notification = await notificationModel.findById(_id);
			if (!notification) {
				return res.status(400).json({ message: "No notification found" });
			}
			await notificationModel.findByIdAndDelete(_id);
			res.status(200).json({ message: "Notification deleted successfully" });
		} catch (error) {
			console.error("Error in chatsController.deleteNotification: ", error);
			res.status(500).json({ message: "Internal Server Error" });
		}
	},
};
module.exports = chatsController;
