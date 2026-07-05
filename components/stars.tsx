export function Stars({
  value,
  size = 14,
}: {
  value: number;
  size?: number;
}) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill =
          rounded >= i ? "full" : rounded >= i - 0.5 ? "half" : "empty";
        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            aria-hidden
          >
            <defs>
              <linearGradient id={`half-${i}`}>
                <stop offset="50%" stopColor="#a9853f" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 18.9 6.1 21.5l1.2-6.5L2.5 9.4l6.6-.9z"
              fill={
                fill === "full"
                  ? "#a9853f"
                  : fill === "half"
                    ? `url(#half-${i})`
                    : "none"
              }
              stroke="#a9853f"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
        );
      })}
    </span>
  );
}
