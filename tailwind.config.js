/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-inter)", "system-ui", "sans-serif"],
                heading: ["var(--font-cal)", "var(--font-inter)", "sans-serif"],
            },
            colors: {
                brand: {
                    50: "hsl(210, 100%, 97%)",
                    100: "hsl(210, 98%, 92%)",
                    200: "hsl(210, 96%, 84%)",
                    300: "hsl(210, 94%, 74%)",
                    400: "hsl(210, 88%, 62%)",
                    500: "hsl(210, 82%, 52%)",
                    600: "hsl(210, 78%, 44%)",
                    700: "hsl(210, 76%, 36%)",
                    800: "hsl(210, 74%, 28%)",
                    900: "hsl(210, 72%, 20%)",
                },
                neutral: {
                    50: "hsl(220, 14%, 97%)",
                    100: "hsl(220, 13%, 93%)",
                    200: "hsl(220, 11%, 87%)",
                    300: "hsl(220, 10%, 74%)",
                    400: "hsl(220, 9%, 58%)",
                    500: "hsl(220, 8%, 44%)",
                    600: "hsl(220, 8%, 32%)",
                    700: "hsl(220, 9%, 22%)",
                    800: "hsl(220, 10%, 14%)",
                    900: "hsl(222, 14%, 8%)",
                },
            },
            typography: {
                DEFAULT: {
                    css: {
                        maxWidth: "none",
                        color: "hsl(220, 8%, 22%)",
                        a: {
                            color: "hsl(210, 82%, 52%)",
                            "&:hover": { color: "hsl(210, 78%, 44%)" },
                        },
                    },
                },
            },
        },
    },
    plugins: [
        require("@tailwindcss/typography"),
    ],
};
