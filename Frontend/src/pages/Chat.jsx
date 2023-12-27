import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Brands.css";

import { Button, Container, Col, Row } from "react-bootstrap";
import AppNavBar from "../components/navbar";
import "../styles/RaijinNavBar.css";
import ChatCard from "../components/ChatCard";

let backend_url = "http://localhost:3000/api";

export default function ChatsPage() {
	const navigate = useNavigate();
	const [chats, setChats] = useState([]);

	const getNotification = async () => {
		try {
			const agentId = localStorage.getItem("userId");
			const response = await axios.get(
				`${backend_url}/chats/get-notification?agentId=${agentId}`,
				{
					withCredentials: true,
				}
			);
			setNotification(response.data.notification);
		} catch (error) {
			console.error(error);
			if (error.response.status == 403) {
				removeCookies("token");
				navigate("/");
			}
		}
	};
	const createNotification = async (agentId) => {
		try {
			const chatId = localStorage.getItem("chatId");
			const response = await axios.post(
				`${backend_url}/chats/create-notification`,
				{
					agentId: agentId,
					message:
						"A new chat has been created by the user just now Join or get fired!",
					chatId: chatId,
				},
				{ withCredentials: true }
			);
			localStorage.removeItem("agentId");
		} catch (error) {
			console.error("Error:", error);
			if (error.response.status == 403) {
				removeCookies("token");
				navigate("/");
			}
		}
	};
	const handleCreateChat = async () => {
		try {
			const userID = localStorage.getItem("userId");
			const response = await axios.post(
				`${backend_url}/chats/create`,
				{
					userID: userID,
				},
				{ withCredentials: true }
			);
			localStorage.setItem("agentId", response.data.newChat.agentId);
			localStorage.setItem("chatId", response.data.newChat._id);
			const agentId = localStorage.getItem("agentId");
			await createNotification(agentId);

			navigate("/chatroom"); //response.data.newChat._id); // navigate to the new chat

			// Create a notification after creating a chat
		} catch (error) {
			console.error(error);
			if (error.response.status == 403) {
				removeCookies("token");
				navigate("/");
			}
		}
	};
	useEffect(() => {
		if (
			localStorage.getItem("role") === "manager" ||
			localStorage.getItem("role") === "agent"
		) {
			getChats();
		}
	}, []);

	const handleDeleteNotification = async (_id) => {
		try {
			const response = await axios.delete(
				`${backend_url}/chats/delete-notification?_id=${_id}`,
				{
					withCredentials: true,
				}
			);
			getNotification();
		} catch (error) {
			console.error(error);
			if (error.response.status == 403) {
				removeCookies("token");
				navigate("/");
			}
		}
	};
	const getChats = async () => {
		try {
			if (localStorage.getItem("role") === "manager") {
				const response = await axios.get(`${backend_url}/chats/get-chats`, {
					withCredentials: true,
				});
				setChats(response.data.chat);
				return;
			}
			const agentId = localStorage.getItem("userId");
			const response = await axios.get(
				`${backend_url}/chats/get-chats?agentId=${agentId}`,
				{
					withCredentials: true,
				}
			);

			setChats(response.data.chat);
		} catch (error) {
			console.error(error);
			if (error.response.status == 403) {
				removeCookies("token");
				navigate("/");
			}
		}
	};
	const handleNotificationClick = (_id, chatId) => {
		localStorage.setItem("chatId", chatId);
		navigate("/chatroom");
		handleDeleteNotification(_id);
	};

	return (
		<div className={`test ${localStorage.getItem("theme-color")}`}>
			<AppNavBar />
			<div class="page-background">
				<Container fluid>
					<p>.</p>
					{localStorage.getItem("role") === "user" && (
					<Button onClick={handleCreateChat} className="navbar-buttons">
						Create
					</Button>
				)}
					<Row>
						{chats.map((Chat, index) => (
							<Col key={index} lg={4} md={6} sm={12}>
								<ChatCard
									userId={Chat.userID}
									agentId={Chat.agentId}
									chatId={Chat._id}
								/>
							</Col>
						))}
					</Row>
				</Container>
			</div>
		</div>
	);
}
