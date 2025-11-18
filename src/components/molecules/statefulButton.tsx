"use client";
import { Button } from "@/components/ui/stateful-button";

export function StatefulButtonDemo(children?: React.ReactNode) {
  const handleClick = () => {
    return new Promise((resolve) => {
      setTimeout(resolve, 4000);
    });
  };
  return (
    <div className="flex h-40 w-full items-center justify-center">
      <Button onClick={handleClick}>{children}</Button>
    </div>
  );
}
