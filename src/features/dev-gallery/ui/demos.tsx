import { ChevronDownIcon } from "lucide-react";
import { toast } from "sonner";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export function ButtonDemo() {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<Button>Default</Button>
			<Button variant="secondary">Secondary</Button>
			<Button variant="outline">Outline</Button>
			<Button variant="ghost">Ghost</Button>
			<Button variant="destructive">Destructive</Button>
			<Button variant="link">Link</Button>
			<Button size="sm">Small</Button>
			<Button size="lg">Large</Button>
			<Button disabled>Disabled</Button>
		</div>
	);
}

export function BadgeDemo() {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<Badge>Default</Badge>
			<Badge variant="secondary">Secondary</Badge>
			<Badge variant="outline">Outline</Badge>
			<Badge variant="destructive">Destructive</Badge>
		</div>
	);
}

export function CardDemo() {
	return (
		<Card className="max-w-sm">
			<CardHeader>
				<CardTitle>Card title</CardTitle>
				<CardDescription>Short supporting description.</CardDescription>
			</CardHeader>
			<CardContent>
				<p className="text-muted-foreground">
					Cards group related content for interactive surfaces.
				</p>
			</CardContent>
			<CardFooter>
				<Button size="sm">Action</Button>
			</CardFooter>
		</Card>
	);
}

export function SeparatorDemo() {
	return (
		<div className="w-full max-w-sm space-y-3">
			<p className="text-sm">Above</p>
			<Separator />
			<p className="text-sm">Below</p>
		</div>
	);
}

export function SkeletonDemo() {
	return (
		<div className="flex w-full max-w-sm items-center gap-3">
			<Skeleton className="size-10 rounded-full" />
			<div className="flex-1 space-y-2">
				<Skeleton className="h-3 w-[75%]" />
				<Skeleton className="h-3 w-1/2" />
			</div>
		</div>
	);
}

export function AvatarDemo() {
	return (
		<div className="flex items-center gap-3">
			<Avatar>
				<AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
				<AvatarFallback>CN</AvatarFallback>
			</Avatar>
			<Avatar>
				<AvatarFallback>EP</AvatarFallback>
			</Avatar>
		</div>
	);
}

export function InputDemo() {
	return (
		<div className="grid w-full max-w-sm gap-2">
			<Label htmlFor="demo-input">Email</Label>
			<Input id="demo-input" type="email" placeholder="you@example.com" />
		</div>
	);
}

export function TextareaDemo() {
	return (
		<div className="grid w-full max-w-sm gap-2">
			<Label htmlFor="demo-textarea">Message</Label>
			<Textarea id="demo-textarea" placeholder="Type something…" rows={4} />
		</div>
	);
}

export function CheckboxDemo() {
	return (
		<div className="flex items-center gap-2">
			<Checkbox id="demo-checkbox" defaultChecked />
			<Label htmlFor="demo-checkbox">Accept terms</Label>
		</div>
	);
}

export function SwitchDemo() {
	return (
		<div className="flex items-center gap-2">
			<Switch id="demo-switch" defaultChecked />
			<Label htmlFor="demo-switch">Notifications</Label>
		</div>
	);
}

export function SelectDemo() {
	return (
		<div className="grid w-full max-w-sm gap-2">
			<Label>Subject</Label>
			<Select defaultValue="math">
				<SelectTrigger>
					<SelectValue placeholder="Pick a subject" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="math">Math</SelectItem>
					<SelectItem value="russian">Russian</SelectItem>
					<SelectItem value="physics">Physics</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}

export function RadioGroupDemo() {
	return (
		<RadioGroup defaultValue="a" className="gap-3">
			<div className="flex items-center gap-2">
				<RadioGroupItem value="a" id="radio-a" />
				<Label htmlFor="radio-a">Option A</Label>
			</div>
			<div className="flex items-center gap-2">
				<RadioGroupItem value="b" id="radio-b" />
				<Label htmlFor="radio-b">Option B</Label>
			</div>
		</RadioGroup>
	);
}

export function AlertDemo() {
	return (
		<div className="grid w-full max-w-lg gap-3">
			<Alert>
				<AlertTitle>Heads up</AlertTitle>
				<AlertDescription>
					You can add components to your app using the shadcn CLI.
				</AlertDescription>
			</Alert>
			<Alert variant="destructive">
				<AlertTitle>Something went wrong</AlertTitle>
				<AlertDescription>Please try again later.</AlertDescription>
			</Alert>
		</div>
	);
}

export function DialogDemo() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline">Open dialog</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit profile</DialogTitle>
					<DialogDescription>
						Make changes to your profile here. Click save when you are done.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button type="button">Save changes</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function AlertDialogDemo() {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="destructive">Delete item</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently delete the item.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction>Continue</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export function ProgressDemo() {
	return <Progress value={62} className="w-full max-w-sm" />;
}

export function ToastDemo() {
	return (
		<Button
			variant="outline"
			onClick={() =>
				toast.success("Saved", { description: "Changes applied." })
			}
		>
			Show toast
		</Button>
	);
}

export function TabsDemo() {
	return (
		<Tabs defaultValue="account" className="w-full max-w-md">
			<TabsList>
				<TabsTrigger value="account">Account</TabsTrigger>
				<TabsTrigger value="password">Password</TabsTrigger>
			</TabsList>
			<TabsContent value="account" className="rounded-lg border p-3 text-sm">
				Account settings preview.
			</TabsContent>
			<TabsContent value="password" className="rounded-lg border p-3 text-sm">
				Password settings preview.
			</TabsContent>
		</Tabs>
	);
}

export function AccordionDemo() {
	return (
		<Accordion type="single" collapsible className="w-full max-w-md">
			<AccordionItem value="item-1">
				<AccordionTrigger>Is it accessible?</AccordionTrigger>
				<AccordionContent>
					Yes. It adheres to the WAI-ARIA design pattern.
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-2">
				<AccordionTrigger>Is it styled?</AccordionTrigger>
				<AccordionContent>
					Yes. It comes with default styles that match the design system.
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}

export function BreadcrumbDemo() {
	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href="#">Home</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbLink href="#">Programs</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbPage>Lesson</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	);
}

export function CollapsibleDemo() {
	return (
		<Collapsible className="w-full max-w-sm space-y-2">
			<CollapsibleTrigger asChild>
				<Button variant="outline" className="w-full justify-between">
					Toggle details
					<ChevronDownIcon />
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent className="rounded-lg border p-3 text-sm text-muted-foreground">
				Hidden content revealed when expanded.
			</CollapsibleContent>
		</Collapsible>
	);
}

export function SheetDemo() {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="outline">Open sheet</Button>
			</SheetTrigger>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Sheet title</SheetTitle>
					<SheetDescription>
						Use sheets for secondary flows and filters.
					</SheetDescription>
				</SheetHeader>
			</SheetContent>
		</Sheet>
	);
}

export function DropdownMenuDemo() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">Open menu</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start">
				<DropdownMenuLabel>Actions</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem>Profile</DropdownMenuItem>
				<DropdownMenuItem>Settings</DropdownMenuItem>
				<DropdownMenuItem variant="destructive">Log out</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function TooltipDemo() {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="outline">Hover me</Button>
				</TooltipTrigger>
				<TooltipContent>Helpful hint</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

export function PopoverDemo() {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline">Open popover</Button>
			</PopoverTrigger>
			<PopoverContent className="w-64">
				<PopoverHeader>
					<PopoverTitle>Dimensions</PopoverTitle>
					<PopoverDescription>
						Set the dimensions for the layer.
					</PopoverDescription>
				</PopoverHeader>
			</PopoverContent>
		</Popover>
	);
}

export function TableDemo() {
	return (
		<Table>
			<TableCaption>A list of recent submissions.</TableCaption>
			<TableHeader>
				<TableRow>
					<TableHead>Student</TableHead>
					<TableHead>Lesson</TableHead>
					<TableHead className="text-right">Score</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<TableRow>
					<TableCell>Anna</TableCell>
					<TableCell>Quadratic equations</TableCell>
					<TableCell className="text-right">92</TableCell>
				</TableRow>
				<TableRow>
					<TableCell>Ivan</TableCell>
					<TableCell>Trigonometry</TableCell>
					<TableCell className="text-right">78</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	);
}

export function PlaceholderDemo({ label }: { label: string }) {
	return (
		<div className="flex w-full max-w-md flex-col gap-2 rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
			<p className="font-medium text-foreground">{label}</p>
			<p>Coming in a later task. This slot keeps the category navigable.</p>
		</div>
	);
}

export function EditorPlaceholder() {
	return <PlaceholderDemo label="Editor" />;
}
