"use client";

interface ScrollingPromotionBarProps {
  /** Array of promotion messages to display */
  messages?: string[];
  /** Duration in seconds for one full animation cycle */
  speed?: number;
  /** Character used as separator between messages */
  separator?: string;
}

const defaultMessages = [
  "FREE SHIPPING ON ORDERS OVER EGP 1,000",
  "NEW ARRIVALS — SHOP THE LATEST COLLECTION",
  "LUXURY SKINCARE CRAFTED FOR YOU",
  "100% AUTHENTIC PRODUCTS GUARANTEED",
];

function MessageTrack({
  messages,
  separator,
}: {
  messages: string[];
  separator: string;
}) {
  return (
    <>
      {messages.map((msg, i) => (
        <span key={i} className="contents">
          <span className="shrink-0 whitespace-nowrap">{msg}</span>
          <span
            className="shrink-0 mx-5 text-[10px] opacity-50"
            aria-hidden="true"
          >
            {separator}
          </span>
        </span>
      ))}
    </>
  );
}

export default function ScrollingPromotionBar({
  messages = defaultMessages,
  speed = 30,
  separator = "✦",
}: ScrollingPromotionBarProps) {
  return (
    <div
      className="relative w-full overflow-hidden bg-black select-none"
      style={{ height: 44 }}
      role="marquee"
      aria-label="Promotions"
    >
      <div
        className="flex items-center h-full hover:[animation-play-state:paused]"
        style={{
          animation: `scroll-promo ${speed}s linear infinite`,
          willChange: "transform",
        }}
      >
        {/* Track 1 — visible content */}
        <div
          className="flex items-center shrink-0 text-white text-[11px] sm:text-xs font-medium uppercase"
          style={{ letterSpacing: "0.15em" }}
        >
          <MessageTrack messages={messages} separator={separator} />
        </div>

        {/* Track 2 — duplicate for seamless infinite loop */}
        <div
          className="flex items-center shrink-0 text-white text-[11px] sm:text-xs font-medium uppercase"
          aria-hidden="true"
          style={{ letterSpacing: "0.15em" }}
        >
          <MessageTrack messages={messages} separator={separator} />
        </div>
      </div>
    </div>
  );
}
