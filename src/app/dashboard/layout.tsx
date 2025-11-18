import { SidebarTemplate } from "@/components/molecules/sidebarTemplate";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SidebarTemplate>{children}</SidebarTemplate>
    </>
  );
}
