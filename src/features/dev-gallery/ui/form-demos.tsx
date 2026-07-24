"use client";

import { type ReactNode, useState } from "react";
import {
	FileUploadAnswer,
	MultipleChoiceAnswer,
	ShortTextAnswer,
	SingleChoiceAnswer,
	simulateUpload,
} from "@/components/answer-widgets";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const DEMO_PDF = new File(["demo"], "reshenie.pdf", {
	type: "application/pdf",
});

const FAKE_PROGRAMS = [
	{ id: "math-ege", title: "Математика · ЕГЭ" },
	{ id: "russian-ege", title: "Русский язык · ЕГЭ" },
	{ id: "physics-oge", title: "Физика · ОГЭ" },
	{ id: "history-ege", title: "История · ЕГЭ" },
] as const;

const CHOICE_OPTIONS = [
	{ id: "a", label: "x = 2" },
	{ id: "b", label: "x = −2" },
	{ id: "c", label: "x = 4" },
	{ id: "d", label: "Корней нет" },
];

function DemoSection({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<div className="grid w-full gap-3">
			<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
				{title}
			</p>
			{children}
		</div>
	);
}

export function FormLoginPatternDemo() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [submitted, setSubmitted] = useState(false);

	const emailError =
		submitted && !email.includes("@") ? "Укажите корректный email" : undefined;
	const passwordError =
		submitted && password.length < 6
			? "Пароль должен быть не короче 6 символов"
			: undefined;

	return (
		<form
			className="grid w-full max-w-sm gap-4"
			data-testid="form-login-pattern"
			onSubmit={(event) => {
				event.preventDefault();
				setSubmitted(true);
			}}
		>
			<div className="grid gap-2">
				<Label htmlFor="login-email">Email</Label>
				<Input
					id="login-email"
					type="email"
					autoComplete="email"
					placeholder="student@example.com"
					value={email}
					aria-invalid={Boolean(emailError) || undefined}
					data-testid="form-login-email"
					onChange={(event) => setEmail(event.target.value)}
				/>
				{emailError ? (
					<p role="alert" className="text-sm text-destructive">
						{emailError}
					</p>
				) : null}
			</div>
			<div className="grid gap-2">
				<Label htmlFor="login-password">Пароль</Label>
				<Input
					id="login-password"
					type="password"
					autoComplete="current-password"
					placeholder="••••••••"
					value={password}
					aria-invalid={Boolean(passwordError) || undefined}
					data-testid="form-login-password"
					onChange={(event) => setPassword(event.target.value)}
				/>
				{passwordError ? (
					<p role="alert" className="text-sm text-destructive">
						{passwordError}
					</p>
				) : null}
			</div>
			<Button type="submit" data-testid="form-login-submit">
				Войти
			</Button>
			<p className="text-xs text-muted-foreground">
				Демо-форма: не связана с авторизацией.
			</p>
		</form>
	);
}

export function FormInviteCreateDemo() {
	const [title, setTitle] = useState("");
	const [email, setEmail] = useState("");
	const [programIds, setProgramIds] = useState<string[]>(["math-ege"]);
	const [submitted, setSubmitted] = useState(false);

	const titleError =
		submitted && title.trim().length === 0
			? "Укажите название приглашения"
			: undefined;
	const emailError =
		submitted && !email.includes("@") ? "Укажите email ученика" : undefined;
	const programsError =
		submitted && programIds.length === 0
			? "Выберите хотя бы одну программу"
			: undefined;

	function toggleProgram(id: string, checked: boolean) {
		if (checked) {
			setProgramIds((prev) => [...prev, id]);
			return;
		}
		setProgramIds((prev) => prev.filter((item) => item !== id));
	}

	return (
		<form
			className="grid w-full max-w-md gap-4"
			data-testid="form-invite-create"
			onSubmit={(event) => {
				event.preventDefault();
				setSubmitted(true);
			}}
		>
			<div className="grid gap-2">
				<Label htmlFor="invite-title">Название</Label>
				<Input
					id="invite-title"
					value={title}
					placeholder="Группа 11А · весна"
					aria-invalid={Boolean(titleError) || undefined}
					data-testid="form-invite-title"
					onChange={(event) => setTitle(event.target.value)}
				/>
				{titleError ? (
					<p role="alert" className="text-sm text-destructive">
						{titleError}
					</p>
				) : null}
			</div>
			<div className="grid gap-2">
				<Label htmlFor="invite-email">Email ученика</Label>
				<Input
					id="invite-email"
					type="email"
					value={email}
					placeholder="student@school.ru"
					aria-invalid={Boolean(emailError) || undefined}
					data-testid="form-invite-email"
					onChange={(event) => setEmail(event.target.value)}
				/>
				{emailError ? (
					<p role="alert" className="text-sm text-destructive">
						{emailError}
					</p>
				) : null}
			</div>
			<div className="grid gap-3">
				<p className="text-sm font-medium">Программы</p>
				<div className="grid gap-3 rounded-lg border border-border p-3">
					{FAKE_PROGRAMS.map((program) => (
						<div key={program.id} className="flex items-center gap-2">
							<Checkbox
								id={`invite-program-${program.id}`}
								checked={programIds.includes(program.id)}
								aria-invalid={Boolean(programsError) || undefined}
								data-testid={`form-invite-program-${program.id}`}
								onCheckedChange={(next) =>
									toggleProgram(program.id, next === true)
								}
							/>
							<Label
								htmlFor={`invite-program-${program.id}`}
								className="font-normal"
							>
								{program.title}
							</Label>
						</div>
					))}
				</div>
				{programsError ? (
					<p role="alert" className="text-sm text-destructive">
						{programsError}
					</p>
				) : null}
			</div>
			<Button type="submit" data-testid="form-invite-submit">
				Создать приглашение
			</Button>
		</form>
	);
}

export function ShortTextAnswerDemo() {
	const [value, setValue] = useState("42");

	return (
		<div className="grid w-full max-w-md gap-6">
			<DemoSection title="Default">
				<ShortTextAnswer value={value} onChange={setValue} />
			</DemoSection>
			<Separator />
			<DemoSection title="Error">
				<ShortTextAnswer
					value=""
					onChange={() => undefined}
					error="Ответ обязателен"
				/>
			</DemoSection>
			<Separator />
			<DemoSection title="Disabled">
				<ShortTextAnswer
					value="Ответ отправлен"
					onChange={() => undefined}
					disabled
				/>
			</DemoSection>
		</div>
	);
}

export function SingleChoiceAnswerDemo() {
	const [value, setValue] = useState<string | null>("a");

	return (
		<div className="grid w-full max-w-md gap-6">
			<DemoSection title="Default">
				<SingleChoiceAnswer
					options={CHOICE_OPTIONS}
					value={value}
					onChange={setValue}
				/>
			</DemoSection>
			<Separator />
			<DemoSection title="Error">
				<SingleChoiceAnswer
					options={CHOICE_OPTIONS}
					value={null}
					onChange={() => undefined}
					error="Выберите вариант ответа"
				/>
			</DemoSection>
			<Separator />
			<DemoSection title="Disabled">
				<SingleChoiceAnswer
					options={CHOICE_OPTIONS}
					value="b"
					onChange={() => undefined}
					disabled
				/>
			</DemoSection>
		</div>
	);
}

export function MultipleChoiceAnswerDemo() {
	const [value, setValue] = useState<string[]>(["a", "c"]);

	return (
		<div className="grid w-full max-w-md gap-6">
			<DemoSection title="Default">
				<MultipleChoiceAnswer
					options={CHOICE_OPTIONS}
					value={value}
					onChange={setValue}
				/>
			</DemoSection>
			<Separator />
			<DemoSection title="Error">
				<MultipleChoiceAnswer
					options={CHOICE_OPTIONS}
					value={[]}
					onChange={() => undefined}
					error="Выберите хотя бы один вариант"
				/>
			</DemoSection>
			<Separator />
			<DemoSection title="Disabled">
				<MultipleChoiceAnswer
					options={CHOICE_OPTIONS}
					value={["b", "d"]}
					onChange={() => undefined}
					disabled
				/>
			</DemoSection>
		</div>
	);
}

export function FileUploadAnswerDemo() {
	const [files, setFiles] = useState<File[]>([]);
	const [status, setStatus] = useState<
		"idle" | "uploading" | "uploaded" | "error"
	>("idle");
	const [submitted, setSubmitted] = useState(false);

	const uploading = status === "uploading";
	const canSubmit = status === "uploaded" && files.length > 0;

	return (
		<div className="grid w-full max-w-md gap-6">
			<DemoSection title="Несколько файлов с загрузкой">
				<form
					className="grid gap-3"
					data-testid="file-upload-answer-form"
					onSubmit={(event) => {
						event.preventDefault();
						if (!canSubmit) return;
						setSubmitted(true);
					}}
				>
					<FileUploadAnswer
						multiple
						value={files}
						onChange={(next) => {
							setFiles(next);
							setSubmitted(false);
							if (next.length === 0) setStatus("idle");
						}}
						onStatusChange={setStatus}
						onUpload={(selected, { onProgress, signal }) =>
							simulateUpload(selected, {
								onProgress,
								signal,
								durationMs: 1600,
							})
						}
					/>
					<div className="grid gap-1.5">
						<Button
							type="submit"
							disabled={!canSubmit}
							data-testid="file-upload-answer-submit"
							aria-describedby={
								uploading || files.length === 0 || status === "error"
									? "file-upload-answer-submit-hint"
									: undefined
							}
						>
							Отправить ответ
						</Button>
						{uploading ? (
							<p
								id="file-upload-answer-submit-hint"
								data-testid="file-upload-answer-submit-hint"
								className="text-xs text-muted-foreground"
							>
								Дождитесь окончания загрузки всех файлов на сервер
							</p>
						) : files.length === 0 ? (
							<p
								id="file-upload-answer-submit-hint"
								data-testid="file-upload-answer-submit-hint"
								className="text-xs text-muted-foreground"
							>
								Прикрепите файлы, чтобы отправить ответ
							</p>
						) : status === "error" ? (
							<p
								id="file-upload-answer-submit-hint"
								data-testid="file-upload-answer-submit-hint"
								className="text-xs text-destructive"
							>
								Исправьте ошибку загрузки перед отправкой
							</p>
						) : null}
						{submitted ? (
							<p
								data-testid="file-upload-answer-submitted"
								className="text-xs text-muted-foreground"
							>
								Ответ отправлен (демо) · файлов: {files.length}
							</p>
						) : null}
					</div>
				</form>
			</DemoSection>
			<Separator />
			<DemoSection title="Один файл">
				<FileUploadAnswer
					multiple={false}
					value={[]}
					onChange={() => undefined}
					label="Прикрепите файл"
				/>
			</DemoSection>
			<Separator />
			<DemoSection title="Error">
				<FileUploadAnswer
					onChange={() => undefined}
					error="Прикрепите файл решения"
				/>
			</DemoSection>
			<Separator />
			<DemoSection title="Disabled">
				<FileUploadAnswer
					multiple={false}
					value={[DEMO_PDF]}
					onChange={() => undefined}
					disabled
				/>
			</DemoSection>
		</div>
	);
}
