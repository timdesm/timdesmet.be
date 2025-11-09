import InitScroll from "@/components/scroll/InitScroll";
import "../public/css/styles.css";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import { Urbanist } from "next/font/google";
import { GoogleTagManager } from '@next/third-parties/google'
import LenisSmoothScroll from "@/components/scroll/LenisSmoothScroll";
import { PortfolioProvider } from "@/contexts/PortfolioContext";
import ScrollTop from "@/components/scroll/ScrollTop";
import CustomCursor from "@/components/ui/CustomCursor";
import EasterEggOverlay from "@/components/ui/EasterEggOverlay";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "";

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
});
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Tim De Smet - Full Stack Developer & Designer",
  description: "Welcome to the portfolio of Tim De Smet, a skilled Full Stack Developer and Designer located in Antwerp, Belgium. Explore my projects, services, and get in touch for collaborations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      color-scheme="dark"
      suppressHydrationWarning
      className="js flexbox flexboxlegacy canvas canvastext webgl no-touch geolocation postmessage no-websqldatabase indexeddb hashchange history draganddrop websockets rgba hsla multiplebgs backgroundsize borderimage borderradius boxshadow textshadow opacity cssanimations csscolumns cssgradients cssreflections csstransforms csstransforms3d csstransitions fontface generatedcontent video audio localstorage sessionstorage webworkers no-applicationcache svg inlinesvg smil svgclippaths"
    >
      <body className={urbanist.variable}>
        <GoogleTagManager gtmId={GTM_ID} />
        <PortfolioProvider>
          {children}
          <LenisSmoothScroll />
          <ScrollTop />
          <CustomCursor />
          <EasterEggOverlay />
          {/* Global popup rendered after body content so it's not nested inside specific sections */}
          <InitScroll />
        </PortfolioProvider>
      </body>
    </html>
  );
}
