import Image from "next/image";

type LoadingScreenProps = {
  label: string;
};

function Wave({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 2880 320"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M0 156 C240 82 480 82 720 156 S1200 230 1440 156 C1680 82 1920 82 2160 156 S2640 230 2880 156 V320 H0Z" />
    </svg>
  );
}

export default function LoadingScreen({ label }: LoadingScreenProps) {
  return (
    <main className="loading-screen" aria-busy="true">
      <div className="loading-screen-glow" aria-hidden="true" />
      <div className="loading-waves" aria-hidden="true">
        <div className="loading-wave loading-wave-back"><Wave className="wave-svg" /></div>
        <div className="loading-wave loading-wave-mid"><Wave className="wave-svg" /></div>
        <div className="loading-wave loading-wave-front"><Wave className="wave-svg" /></div>
      </div>
      <div className="loading-content" role="status" aria-live="polite">
        <div className="loading-logo-wrap">
          <Image
            className="loading-logo"
            src="/images/anargya-loading-logo.webp"
            alt="Anargya ITS"
            fill
            priority
            sizes="(max-width: 600px) 68vw, 320px"
          />
        </div>
        <span className="loading-signal" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <p>{label}</p>
        <span className="loading-caption">ANARGYA · FORMULA EV TEAM</span>
      </div>
    </main>
  );
}
