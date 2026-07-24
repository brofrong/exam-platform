import { useQuery, useZero } from "@rocicorp/zero/react";
import { useEffect, useState } from "react";
import type { ChatUser } from "#/features/chat/lib/types";
import { ChatSidebar } from "#/features/chat/ui/chat-sidebar";
import { ChatWindow } from "#/features/chat/ui/chat-window";
import { mutators } from "#/server/zero/mutators";
import { queries } from "#/server/zero/queries";
import { authClient } from "#/shared/auth-client";

type ChatAppProps = {
	user: ChatUser;
};

export function ChatApp({ user }: ChatAppProps) {
	const zero = useZero();
	const [chats] = useQuery(queries.allChats());
	const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
	const [newChatTitle, setNewChatTitle] = useState("");
	const [message, setMessage] = useState("");
	const [isCreatingChat, setIsCreatingChat] = useState(false);

	useEffect(() => {
		if (!selectedChatId && chats.length > 0) {
			setSelectedChatId(chats[0].id);
		}
	}, [chats, selectedChatId]);

	const handleLogout = async () => {
		await authClient.signOut();
		await zero.delete();
		window.location.href = "/login";
	};

	const handleCreateChat = async (event: React.FormEvent) => {
		event.preventDefault();
		const title = newChatTitle.trim();
		if (!title) {
			return;
		}

		const id = crypto.randomUUID();
		await zero.mutate(mutators.createChat({ id, title }));
		setNewChatTitle("");
		setIsCreatingChat(false);
		setSelectedChatId(id);
	};

	return (
		<div className="flex h-[calc(100vh-4.5rem)] overflow-hidden border-t border-border">
			<ChatSidebar
				user={user}
				chats={chats}
				selectedChatId={selectedChatId}
				isCreatingChat={isCreatingChat}
				newChatTitle={newChatTitle}
				onSelectChat={setSelectedChatId}
				onLogout={() => {
					void handleLogout();
				}}
				onStartCreate={() => setIsCreatingChat(true)}
				onCancelCreate={() => {
					setIsCreatingChat(false);
					setNewChatTitle("");
				}}
				onNewChatTitleChange={setNewChatTitle}
				onCreateChat={handleCreateChat}
			/>

			<main className="flex min-w-0 flex-1 flex-col bg-background">
				{selectedChatId ? (
					<ChatWindow
						key={selectedChatId}
						chatId={selectedChatId}
						currentUserId={user.id}
						message={message}
						setMessage={setMessage}
					/>
				) : (
					<div className="flex flex-1 items-center justify-center text-muted-foreground">
						Select a chat or create a new one
					</div>
				)}
			</main>
		</div>
	);
}
