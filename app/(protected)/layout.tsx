import Navbar from "@/app/(protected)/_components/navbar";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <div className="w-full h-full flex flex-col gap-y-10 items-center justify-center bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-purple-400 to-violet-800 text-card-foreground">
      <Navbar />
      {children}
    </div>
  );
}
