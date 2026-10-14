import type { Metadata } from "next";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/dm-sans";
import { Header, Footer } from "@/components/navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Form / Frequency | Independent audiovisual studio",
    template: "%s | Form / Frequency",
  },
  description:
    "An independent studio working at the intersection of moving image, sound and digital experiences.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
