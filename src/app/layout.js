import { Inter } from "next/font/google";
import "../styles/globals.css";
import Providers from "@/components/Providers";
import StyledJsxRegistry from "@/components/StyledJsxRegistry";
import ThemeInjector from "@/components/ThemeInjector";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "家庭打卡与学习系统",
  description: "基于 Next.js 的全栈家庭打卡、习惯养成与宠物互动系统",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <body className={inter.className}>
        <StyledJsxRegistry>
          <Providers>
            <ThemeInjector />
            <Toaster position="top-center" reverseOrder={false} />
            {children}
          </Providers>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
