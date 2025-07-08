import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Utilitário para combinar classes CSS
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Exportando todos os componentes UI
export { Button, buttonVariants } from './button';
export { Input } from './input';
export { Label } from './label';
export { Textarea } from './textarea';
export { Badge } from './badge';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card';
export { Checkbox } from './checkbox';
export { RadioGroup, RadioGroupItem } from './radio-group';
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from './select';
export { Switch } from './switch';
export { Separator } from './separator';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
export { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from './dialog';
export { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from './alert-dialog';
export { Popover, PopoverContent, PopoverTrigger } from './popover';
export { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandSeparator } from './command';
export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './form';
export { ErrorAlert } from './error-alert';
export { LoadingButton } from './loading-button';
export { Modal } from './modal';
export { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './pagination';
export { MultiSelect } from './multi-select';
