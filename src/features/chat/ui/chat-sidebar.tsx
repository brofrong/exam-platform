import { LogOut, MessageSquarePlus } from "lucide-react";
import type { ChatUser } from "#/features/chat/lib/types";
import { NewChatForm } from "#/features/chat/ui/message-composer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type ChatListItem = {
	id: string;
	title: string;
};

type ChatSidebarProps = {
	user: ChatUser;
	chats: readonly ChatListItem[];
	selectedChatId: string | null;
	isCreatingChat: boolean;
	newChatTitle: string;
	onSelectChat: (chatId: string) => void;
	onLogout: () => void;
	onStartCreate: () => void;
	onCancelCreate: () => void;
	onNewChatTitleChange: (value: string) => void;
	onCreateChat: (event: React.FormEvent) => void;
};

function initials(name: string, email: string) {
	const source = name.trim() || email.trim();
	const parts = source.split(/\s+/).filter(Boolean);
	if (parts.length >= 2) {
		return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
	}
	return source.slice(0, 2).toUpperCase() || "?";
}

export function ChatSidebar({
	user,
	chats,
	selectedChatId,
	isCreatingChat,
	newChatTitle,
	onSelectChat,
	onLogout,
	onStartCreate,
	onCancelCreate,
	onNewChatTitleChange,
	onCreateChat,
}: ChatSidebarProps) {
	return (
		<aside className="flex w-72 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
			<div className="flex items-center gap-3 p-4">
				<Avatar size="default">
					<AvatarFallback>{initials(user.name, user.email)}</AvatarFallback>
				</Avatar>
				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium">
						{user.name || user.email}
					</p>
					<p className="truncate text-xs text-muted-foreground">{user.email}</p>
				</div>
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					data-testid="chat-logout"
					onClick={onLogout}
					aria-label="Log out"
					title="Log out"
				>
					<LogOut />
				</Button>
			</div>

			<Separator />

			<div className="p-3">
				{isCreatingChat ? (
					<NewChatForm
						title={newChatTitle}
						onTitleChange={onNewChatTitleChange}
						onSubmit={onCreateChat}
						onCancel={onCancelCreate}
					/>
				) : (
					<Button
						type="button"
						className="w-full"
						data-testid="chat-new"
						onClick={onStartCreate}
					>
						<MessageSquarePlus />
						New chat
					</Button>
				)}
			</div>

			<Separator />

			<ScrollArea className="flex-1">
				<div className="space-y-0.5 p-2" data-testid="chat-list">
					{chats.length === 0 ? (
						<p className="px-3 py-6 text-center text-sm text-muted-foreground">
							No chats yet
						</p>
					) : (
						chats.map((chat) => (
							<button
								key={chat.id}
								type="button"
								data-testid="chat-list-item"
								onClick={() => onSelectChat(chat.id)}
								className={cn(
									"w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
									selectedChatId === chat.id
										? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
										: "text-sidebar-foreground/80 hover:bg-sidebar-accent/70",
								)}
							>
								{chat.title}
							</button>
						))
					)}
				</div>
			</ScrollArea>
		</aside>
	);
}
