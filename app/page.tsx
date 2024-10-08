import LoginButton from "@/components/auth/login-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";
import Image from "next/image";

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

export default function Home() {
  return (
    <main className="flex h-full flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-purple-400 to-violet-800">
      <div className="space-y-6 text-center">
        <h1
          className={cn(
            "text-6xl font-semibold text-white drop-shadow-md",
            font.className
          )}
        >
          Next Auth
        </h1>
        <Image
          src="/logo-sm.png"
          alt="Next Auth Logo"
          width={180}
          height={180}
          className="mx-auto"
        />
        <p className="text-white text-lg">A simple authentication service</p>
        <div className="flex flex-col gap-4">
          <LoginButton mode="modal" asChild>
            <Button variant="secondary" className="w-full">
              Sign In with Dialog Modal
            </Button>
          </LoginButton>
          <LoginButton asChild>
            <Button variant="secondary" className="w-full">
              Sign In at the Login Page
            </Button>
          </LoginButton>
        </div>
      </div>
    </main>
  );
}
