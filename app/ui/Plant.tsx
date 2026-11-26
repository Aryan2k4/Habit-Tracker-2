"use client";
import { useId } from "react";
export default function Plant({
  stage = 4,
  pot = "clay",
  plant = "cosmos",
  water = false,
}: {
  stage?: number;
  pot?: string;
  plant?: string;
  water?: boolean;
}) {
  const uid = useId().replaceAll(":", "");
  const color =
    pot === "sage" ? "#719382" : pot === "cream" ? "#d8c8a5" : "#c7866b";
  const petal =
    plant === "daisy"
      ? "#fff8e7"
      : plant === "lavender"
        ? "#b5a1d0"
        : "#eeb4af";
  return (
    <svg
      className={"plant-art " + (water ? "watering" : "")}
      viewBox="0 0 420 380"
      role="img"
      aria-label={`${["Seed", "Sprout", "Seedling", "Growing", "Blooming", "Flourishing"][stage]} in a ${pot} flower pot`}
    >
      <defs>
        <linearGradient id={uid + "pot"} x1="0" x2="1">
          <stop stopColor={color} />
          <stop offset=".5" stopColor={color} />
          <stop offset="1" stopColor="#97634f" />
        </linearGradient>
        <linearGradient id={uid + "leaf"}>
          <stop stopColor="#638c59" />
          <stop offset="1" stopColor="#a0bb78" />
        </linearGradient>
        <filter id={uid + "shadow"}>
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      <ellipse
        cx="211"
        cy="347"
        rx="102"
        ry="12"
        fill="#64744b"
        opacity=".14"
        filter={`url(#${uid}shadow)`}
      />
      <g className="plant-sway" style={{ transformOrigin: "210px 280px" }}>
        {stage === 0 ? (
          <>
            <ellipse cx="210" cy="264" rx="8" ry="5" fill="#b5bd80" />
            <path
              d="M210 263q-5-16 4-22"
              fill="none"
              stroke="#688f55"
              strokeWidth="3"
            />
          </>
        ) : (
          <>
            <path
              d={
                stage < 2
                  ? "M210 282 Q202 235 214 213"
                  : "M210 282 C204 231 230 176 210 103"
              }
              fill="none"
              stroke="#638155"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M210 254 C177 252 157 232 161 213 C192 213 208 231 210 254Z"
              fill={`url(#${uid}leaf)`}
            />
            <path d="M210 254L171 223" stroke="#527b50" fill="none" />
            <path
              d="M211 236 C241 236 263 211 257 194 C227 197 212 212 211 236Z"
              fill={`url(#${uid}leaf)`}
            />
            <path d="M211 236L247 205" stroke="#527b50" fill="none" />
            {stage >= 2 && (
              <>
                <path
                  d="M216 207 C185 202 170 179 178 161 C207 166 218 184 216 207Z"
                  fill={`url(#${uid}leaf)`}
                />
                <path
                  d="M218 181 C244 180 264 157 257 139 C231 144 218 162 218 181Z"
                  fill={`url(#${uid}leaf)`}
                />
              </>
            )}
            {stage >= 3 && (
              <>
                <path
                  d="M211 263Q166 197 143 164M218 213Q266 183 283 146"
                  stroke="#6f8f5a"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  d="M170 207Q132 211 121 185Q148 174 170 207M253 188Q280 200 300 175Q273 163 253 188"
                  fill={`url(#${uid}leaf)`}
                />
              </>
            )}
            {stage >= 4 ? (
              <g className="flower">
                <g transform="translate(210 100)">
                  {Array.from({ length: 8 }, (_, i) => (
                    <ellipse
                      key={i}
                      rx="15"
                      ry="29"
                      cy="-20"
                      fill={petal}
                      stroke="#ce8d8b"
                      strokeWidth=".6"
                      transform={`rotate(${i * 45})`}
                    />
                  ))}
                  <circle r="15" fill="#dab65b" />
                  <circle r="9" fill="#e8c574" />
                  {Array.from({ length: 7 }, (_, i) => (
                    <circle
                      key={i}
                      r="1.5"
                      cx={Number((7 * Math.cos(i)).toFixed(4))}
                      cy={Number((7 * Math.sin(i)).toFixed(4))}
                      fill="#a78b42"
                    />
                  ))}
                </g>
              </g>
            ) : (
              stage >= 2 && (
                <ellipse cx="210" cy="105" rx="9" ry="17" fill="#97af70" />
              )
            )}
            {stage >= 5 && (
              <>
                {[
                  [143, 160, 0.65],
                  [284, 142, 0.52],
                ].map(([x, y, s], j) => (
                  <g key={j} transform={`translate(${x} ${y}) scale(${s})`}>
                    {Array.from({ length: 7 }, (_, i) => (
                      <ellipse
                        key={i}
                        rx="15"
                        ry="27"
                        cy="-18"
                        fill={j ? "#f5dc91" : petal}
                        transform={`rotate(${(i * 360) / 7})`}
                      />
                    ))}
                    <circle r="13" fill="#d9b456" />
                  </g>
                ))}
              </>
            )}
          </>
        )}
      </g>
      <path
        d="M148 274L162 329Q165 345 211 345Q255 345 259 329L273 274Z"
        fill={`url(#${uid + "pot"})`}
      />
      <path
        d="M162 287L171 325Q173 334 190 335"
        fill="none"
        stroke="#f3c5a5"
        strokeWidth="5"
        opacity=".3"
        strokeLinecap="round"
      />
      <ellipse cx="210" cy="274" rx="65" ry="15" fill={color} />
      <rect x="144" y="263" width="132" height="18" rx="7" fill={color} />
      <ellipse cx="210" cy="263" rx="65" ry="13" fill="#dfad8f" />
      <ellipse cx="210" cy="262" rx="54" ry="9" fill="#5d4c3c" />
      <ellipse cx="210" cy="263" rx="45" ry="6" fill="#716044" />
      <path
        d="M192 308q18 16 36 0"
        stroke="#925e4b"
        strokeWidth="2"
        fill="none"
        opacity=".35"
      />
      {water && (
        <g className="raindrops">
          {Array.from({ length: 12 }, (_, i) => (
            <path
              key={i}
              d={`M${166 + i * 8} ${175 + (i % 3) * 23}q-7 12 0 12q7 0 0-12`}
              fill="#80b9cf"
              opacity=".8"
              style={{ animationDelay: `${i * 0.07}s` }}
            />
          ))}
        </g>
      )}
      <g fill="#c1ad67" opacity=".65">
        <path
          d="M110 110v10m-5-5h10M308 228v10m-5-5h10"
          stroke="#c1ad67"
          strokeWidth="2"
        />
        <circle cx="311" cy="94" r="3" />
        <circle cx="105" cy="255" r="2" />
      </g>
    </svg>
  );
}
