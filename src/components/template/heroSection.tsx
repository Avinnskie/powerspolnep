import { MagneticButton } from "@/components/molecules/magneticButton";
import { BackgroundLines } from "@/components/ui/background-lines";
import Image from "next/image";

export default function HeroSection() {
  return (
    <BackgroundLines className="flex items-center justify-center w-full bg-transparent flex-col px-4">
      <Image
        className="absolute hidden md:flex -translate-x-[480px] -translate-y-[250px] pointer-events-none select-none"
        src="/education_icon/book.png"
        alt="SVG"
        width={60}
        height={60}
      />
      <Image
        className="absolute hidden md:flex -translate-x-[650px] pointer-events-none select-none"
        src="/education_icon/abc.png"
        alt="SVG"
        width={100}
        height={100}
      />
      <Image
        className="absolute hidden md:flex -translate-x-[500px] translate-y-56 pointer-events-none select-none"
        src="/education_icon/blokblok.png"
        alt="SVG"
        width={70}
        height={70}
      />
      <Image
        className="absolute hidden md:flex translate-x-[550px] translate-y-48 pointer-events-none select-none"
        src="/education_icon/chem.png"
        alt="SVG"
        width={85}
        height={85}
      />
      <Image
        className="absolute hidden md:flex translate-x-[650px] translate-y-0 pointer-events-none select-none"
        src="/education_icon/earphone.png"
        alt="SVG"
        width={65}
        height={65}
      />
      <Image
        className="absolute hidden md:flex translate-x-[450px] -translate-y-[200px] pointer-events-none select-none"
        src="/education_icon/globe.png"
        alt="SVG"
        width={70}
        height={70}
      />
      <div className="space-y-3">
        <h1 className="text-4xl md:text-7xl text-center font-bold text-black dark:text-white">
          Empowering Students <br />
          Through <span className="text-[#E30613] font-ballet">
            English
          </span>{" "}
          <span className="text-[#FFD500] font-ballet">Excellence</span>
        </h1>
        <p className="max-w-xl mx-auto text-xs md:text-lg text-neutral-700 dark:text-neutral-400 text-center">
          POWERS POLNEP is a student organization dedicated to fostering English
          skills, critical thinking, and global communication for the future
          leaders of tomorrow.
        </p>
      </div>
      <div
        style={{
          display: "flex",
          gap: 16,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      ></div>
      <MagneticButton
        className="mt-5"
        glow={false}
        zonePadding={8}
        strength={0.35}
      >
        See more!
      </MagneticButton>
    </BackgroundLines>
  );
}
