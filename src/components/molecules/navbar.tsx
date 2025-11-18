"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HoveredLink, Menu, MenuItem, ProductItem } from "../ui/navbar-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";

type SectionKey = "About" | "Division" | "Gallery" | null;

export default function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSection, setOpenSection] = useState<SectionKey>(null);
  const toggleSection = (key: Exclude<SectionKey, null>) =>
    setOpenSection((prev) => (prev === key ? null : key));

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className={cn("fixed top-0 left-0 right-0 z-50", className)}>
      <div className="md:hidden">
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={mobileOpen}
            className={cn(
              "px-4 py-2 rounded-full border border-white/10",
              "bg-white backdrop-blur-sm",
              "text-sm font-medium text-black hover:text-zinc-600",
              "shadow-[0_10px_30px_rgba(0,0,0,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60",
            )}
          >
            Menu
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.button
                type="button"
                aria-label="Tutup menu"
                onClick={closeMobile}
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="navbar-modal-title"
                className={cn(
                  "fixed z-50 inset-x-4 top-[88px]",
                  "rounded-2xl border border-white/10",
                  "bg-white/5 backdrop-blur-sm",
                  "shadow-[0_20px_80px_rgba(0,0,0,0.45)]",
                )}
                initial={{
                  y: -12,
                  opacity: 0,
                  scale: 0.98,
                  filter: "blur(8px)",
                }}
                animate={{ y: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ y: -8, opacity: 0, scale: 0.98, filter: "blur(6px)" }}
                transition={{
                  type: "spring",
                  stiffness: 280,
                  damping: 26,
                  mass: 0.6,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h2
                      id="navbar-modal-title"
                      className="text-base font-semibold text-black"
                    >
                      Menu
                    </h2>
                    <button
                      type="button"
                      onClick={closeMobile}
                      aria-label="Tutup"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        className="text-black"
                      >
                        <path
                          d="M18 6L6 18M6 6l12 12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-2">
                    <Link
                      href="/about"
                      onClick={closeMobile}
                      className="block mb-2 text-black text-base font-medium"
                    >
                      About
                    </Link>

                    <MobileSection
                      title="Division"
                      open={openSection === "Division"}
                      onToggle={() => toggleSection("Division")}
                    >
                      <div className="grid grid-cols-1 gap-4 text-sm">
                        <ProductItem
                          title="Education Division"
                          href="https://algochurn.com"
                          src="https://assets.aceternity.com/demos/algochurn.webp"
                          description="Prepare for tech interviews like never before."
                        />
                        <ProductItem
                          title="Public Relations Division"
                          href="https://tailwindmasterkit.com"
                          src="https://assets.aceternity.com/demos/tailwindmasterkit.webp"
                          description="Production ready Tailwind css components for your next project"
                        />
                        <ProductItem
                          title="Member Development Division"
                          href="https://gomoonbeam.com"
                          src="https://assets.aceternity.com/demos/Screenshot+2024-02-21+at+11.51.31%E2%80%AFPM.png"
                          description="Never write from scratch again. Go from idea to blog in minutes."
                        />
                        <ProductItem
                          title="Event Organizer Division"
                          href="https://userogue.com"
                          src="https://assets.aceternity.com/demos/Screenshot+2024-02-21+at+11.47.07%E2%80%AFPM.png"
                          description="Respond to government RFPs, RFIs and RFQs 10x faster using AI"
                        />
                      </div>
                    </MobileSection>

                    <Link
                      href="/gallery"
                      onClick={closeMobile}
                      className="block mt-4 text-black text-base font-medium"
                    >
                      Gallery
                    </Link>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <div className="hidden md:block">
        <div className="fixed top-5 inset-x-0 max-w-2xl mx-auto z-50">
          <Menu setActive={setActive}>
            <Link href="/about" onClick={closeMobile}>
              About
            </Link>

            <MenuItem setActive={setActive} active={active} item="Division">
              <div className="text-sm grid grid-cols-2 gap-10 p-4">
                <ProductItem
                  title="Education Division"
                  href="https://algochurn.com"
                  src="https://assets.aceternity.com/demos/algochurn.webp"
                  description="Prepare for tech interviews like never before."
                />
                <ProductItem
                  title="Public Relations Division"
                  href="https://tailwindmasterkit.com"
                  src="https://assets.aceternity.com/demos/tailwindmasterkit.webp"
                  description="Production ready Tailwind css components for your next project"
                />
                <ProductItem
                  title="Member Development Division"
                  href="https://gomoonbeam.com"
                  src="https://assets.aceternity.com/demos/Screenshot+2024-02-21+at+11.51.31%E2%80%AFPM.png"
                  description="Never write from scratch again. Go from idea to blog in minutes."
                />
                <ProductItem
                  title="Event Organizer Division"
                  href="https://userogue.com"
                  src="https://assets.aceternity.com/demos/Screenshot+2024-02-21+at+11.47.07%E2%80%AFPM.png"
                  description="Respond to government RFPs, RFIs and RFQs 10x faster using AI"
                />
              </div>
            </MenuItem>

            <Link href="/gallery" onClick={closeMobile}>
              Gallery
            </Link>
          </Menu>
        </div>
      </div>
    </div>
  );
}

function MobileSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-2 text-left text-black"
      >
        <span className="text-base font-medium">{title}</span>
        <motion.svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          className="text-black"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        >
          <path
            d="M6 9l6 6 6-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            ref={contentRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
