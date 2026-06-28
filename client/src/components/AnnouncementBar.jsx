const TICKER_CSS = `
@keyframes ticker-scroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.ticker-wrap { overflow: hidden; white-space: nowrap; }
.ticker-inner {
  display: inline-block;
  animation: ticker-scroll 40s linear infinite;
}
`;

const seg = "Standard delivery time: 4-5 weeks | For international queries/orders, please WhatsApp us at +92 300 8462848   |    ";

export default function AnnouncementBar() {
  return (
    <>
      <style>{TICKER_CSS}</style>
      <div className="ticker-wrap bg-rose-100 h-[33px] flex items-center border-b border-rose-200">
        <div className="ticker-inner text-[13px] text-gray-700 font-medium tracking-wide">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="mx-4">{seg}</span>
          ))}
        </div>
      </div>
    </>
  );
}