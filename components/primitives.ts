import { tv } from "tailwind-variants";

export const title = tv({
    base: "tracking-tight inline font-semibold",
    variants: {
        color: {
            primary: "from-[#FDE047] to-[#FFD700]",      // cyber yellow
            secondary: "from-[#A855F7] to-[#BB4DFF]",    // neon purple
            success: "from-[#10B981] to-[#34D399]",      // neon green
            warning: "from-[#FF9E0B] to-[#FBBF24]",      // amber orange
            danger: "from-[#FF2975] to-[#FF4D88]",       // neon pink/red
            violet: "from-[#FF1CF7] to-[#B249F8]",       // 保留旧色
            yellow: "from-[#FF705B] to-[#FFB457]",
            blue: "from-[#5EA2EF] to-[#0072F5]",
            cyan: "from-[#00B7FA] to-[#01CFEA]",
            green: "from-[#6FEE8D] to-[#17C964]",
            pink: "from-[#FF72E1] to-[#F54C7A]",
            foreground: "dark:from-[#FFFFFF] dark:to-[#4B4B4B]",
        },
        size: {
            sm: "text-3xl lg:text-4xl",
            md: "text-[2.3rem] lg:text-5xl",
            lg: "text-4xl lg:text-6xl",
        },
        fullWidth: {
            true: "w-full block",
        },
        gradientDirection: {
            toB: "bg-gradient-to-b",
            toR: "bg-gradient-to-r",
            toL: "bg-gradient-to-l",
            toT: "bg-gradient-to-t",
        },
        style: {
            normal: "",
            uppercase: "uppercase",
            shadow: "drop-shadow-lg",
            wide: "tracking-wide",
        },
    },
    defaultVariants: {
        size: "md",
        gradientDirection: "toB",
        style: "normal",
    },
    compoundVariants: [
        {
            color: [
                "primary",
                "secondary",
                "success",
                "warning",
                "danger",
                "violet",
                "yellow",
                "blue",
                "cyan",
                "green",
                "pink",
                "foreground",
            ],
            class: "bg-clip-text text-transparent",
        },
    ],
});

export const subtitle = tv({
    base: "w-full md:w-1/2 my-2 text-lg lg:text-xl text-default-600 block max-w-full",
    variants: {
        fullWidth: {
            true: "!w-full",
        },
        color: {
            default: "text-default-600 dark:text-default-300",
            primary: "text-primary-500 dark:text-primary-400",
            secondary: "text-secondary-500 dark:text-secondary-400",
            success: "text-success-500 dark:text-success-400",
            warning: "text-warning-500 dark:text-warning-400",
            danger: "text-danger-500 dark:text-danger-400",
        },
    },
    defaultVariants: {
        fullWidth: true,
        color: "default",
    },
});
