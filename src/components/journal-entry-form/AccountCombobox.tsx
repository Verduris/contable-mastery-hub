
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { FormControl } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { ChevronsUpDown, Check } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Account } from '@/types/account';

type AccountComboboxProps = {
    accounts: Account[];
    value: string;
    onChange: (value: string) => void;
};

export const AccountCombobox = ({ accounts, value, onChange }: AccountComboboxProps) => {
    const [open, setOpen] = useState(false);

    const selectedAccount = accounts.find((account) => account.id === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <FormControl>
                    <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                            "w-full justify-between text-left",
                            !value && "text-muted-foreground"
                        )}
                    >
                        {selectedAccount ? `${selectedAccount.code} - ${selectedAccount.name}` : "Seleccione una cuenta"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Buscar por código o nombre..." />
                    <CommandEmpty>No se encontró ninguna cuenta.</CommandEmpty>
                    <CommandList>
                        <CommandGroup>
                            {accounts.map((account) => (
                                <CommandItem
                                    value={`${account.code} ${account.name}`}
                                    key={account.id}
                                    onSelect={() => {
                                        onChange(account.id);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === account.id
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                    {account.code} - {account.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
