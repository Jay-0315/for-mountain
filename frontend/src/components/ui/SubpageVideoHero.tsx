import Image from "next/image";

type SubpageVideoHeroProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  imageSrc?: string;
  imageAlt?: string;
};

export default function SubpageVideoHero({
  eyebrow,
  title,
  subtitle,
  imageSrc = "/images/subpage-hero.png",
  imageAlt = "",
}: SubpageVideoHeroProps) {
  const hasContent = eyebrow || title || subtitle;

  return (
    <section
      data-transparent-header
      className="relative isolate flex min-h-[22rem] items-center overflow-hidden bg-slate-950 px-6 py-20 text-center text-white sm:px-10 md:min-h-[26rem]"
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority
        className="absolute inset-0 -z-20 object-cover object-center"
      />
      <div className="absolute inset-0 -z-10 bg-slate-950/42" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_35%,rgba(251,146,60,0.16),transparent_42%),linear-gradient(180deg,rgba(2,6,23,0.18)_0%,rgba(2,6,23,0.70)_100%)]" />

      {hasContent && (
        <div className="mx-auto max-w-4xl">
          {eyebrow && (
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-orange-300">
              {eyebrow}
            </p>
          )}
          {title && <h1 className="text-4xl font-bold tracking-tight md:text-6xl">{title}</h1>}
          {subtitle && (
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-100/86 md:text-lg">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
