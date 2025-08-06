/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    {
      pattern:
        /bg-(blue|red|green|yellow|gray|indigo|purple|pink)-(100|200|300|400|500|600|700|800|900)/,
    },
    {
      pattern:
        /text-(blue|red|green|yellow|gray|indigo|purple|pink|white|black)-(100|200|300|400|500|600|700|800|900)/,
    },
    {
      pattern: /p-(1|2|3|4|5|6|8|10|12|16|20)/,
    },
    {
      pattern: /m-(1|2|3|4|5|6|8|10|12|16|20)/,
    },
    {
      pattern: /w-(1|2|3|4|5|6|8|10|12|16|20|24|32|40|48|56|64|72|80|96|full)/,
    },
    {
      pattern: /h-(1|2|3|4|5|6|8|10|12|16|20|24|32|40|48|56|64|72|80|96|full)/,
    },
    "rounded",
    "rounded-lg",
    "rounded-md",
    "rounded-xl",
    "rounded-full",
    "shadow",
    "shadow-lg",
    "shadow-md",
    "shadow-xl",
    "border",
    "border-2",
    "border-4",
    "flex",
    "grid",
    "block",
    "inline-block",
    "hidden",
    "justify-center",
    "justify-between",
    "justify-start",
    "justify-end",
    "items-center",
    "items-start",
    "items-end",
    "text-center",
    "text-left",
    "text-right",
    "font-bold",
    "font-semibold",
    "font-medium",
    "hover:bg-blue-600",
    "hover:bg-red-600",
    "hover:bg-green-600",
  ],
};
