'use client';

import { Languages, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useTransition } from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import { Button } from "@heroui/button";

export const locales = [
    {
        key: 'zh-CN',
        name: '简体中文',
        flag: '🇨🇳',
        alpha2Code: 'CN',
    },
    {
        key: 'en-US',
        name: 'English',
        flag: '🇺🇸',
        alpha2Code: 'US',
    },
] as const;
export const LangSwitch = () => {
    const [isPending, startTransition] = useTransition();
    const handleLocaleChange = (locale: string, name: string) => {
        console.log(locale)

    }
    return (
        <Dropdown aria-label="Switch Language">
            <DropdownTrigger>
                <Button variant="light" isIconOnly className="text-default-500">
                    {isPending ? (
                        <Loader2 size={22} className="animate-spin [animation-duration:0.3s]" />
                    ) : (
                        <Languages size={22} />
                    )}
                </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Switch Language" variant="faded">
                {locales.map((item) => (
                    <DropdownItem
                        key={item.key}
                        onPress={() => handleLocaleChange(item.key, item.name)}
                        className="flex flex-row items-center gap-2  dark:text-default-700 dark:hover:text-white"
                        startContent={
                            <Image
                                src={`https://fastly.jsdelivr.net/gh/HatScripts/circle-flags@2.7.0/flags/${item.alpha2Code.toLowerCase()}.svg`}
                                alt={item.flag}
                                width={24}
                                height={24}
                                className="w-6 h-6"
                                loading="lazy"
                            />
                        }
                    >
                        {item.name}
                    </DropdownItem>
                ))}
            </DropdownMenu>
        </Dropdown>
    );
};