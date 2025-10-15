import dynamic from "next/dynamic";
import type React from "react";

// Dynamically load client AnimatedNumber with SSR disabled to avoid hydration/type coupling.
const AnimatedNumberClient = dynamic(
  () => import("./animated-number").then((m) => m.AnimatedNumber),
  { ssr: false }
);

export function AnimatedNumberServer(props: {
  value: number;
  suffix?: string;
}) {
  return <AnimatedNumberClient {...props} />;
}
