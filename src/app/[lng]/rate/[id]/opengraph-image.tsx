import { ImageResponse } from "next/og";
import { api } from "@/trpc/server";
import { getTranslation } from "@/lib/i18n";
import { RemarkContentType } from "@dicecho/types";
import { serializeRichTextToMarkdown } from "@/components/Editor/utils/platejson-serializer";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ lng: string; id: string }>;
}) {
  const { lng, id } = await params;

  // Parallel fetch: translation and rate data
  const [{ t }, rate] = await Promise.all([
    getTranslation(lng),
    api.rate.detail({ id }).catch(() => null),
  ]);

  const modTitle = rate?.mod?.title || "TRPG";
  const userName = rate?.user.nickName || "User";
  const userAvatar = rate?.user.avatarUrl || "";
  const rating = rate?.rate ? rate.rate.toFixed(1) : null;
  // Process markdown: strip formatting, convert to plain text
  const rawRemark =
    rate?.remarkType === RemarkContentType.Richtext
      ? serializeRichTextToMarkdown(rate?.richTextState || [])
      : rate?.remark || "";

  // Simple markdown cleanup: remove headers, bold, italic, links, etc.
  const cleanedRemark = rawRemark
    .replace(/^#{1,6}\s+/gm, "") // Remove headers
    .replace(/\*\*([^*]+)\*\*/g, "$1") // Remove bold
    .replace(/\*([^*]+)\*/g, "$1") // Remove italic
    .replace(/__([^_]+)__/g, "$1") // Remove bold (underscore)
    .replace(/_([^_]+)_/g, "$1") // Remove italic (underscore)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links
    .replace(/`([^`]+)`/g, "$1") // Remove inline code
    .replace(/^[-*+]\s+/gm, "• ") // Convert list items
    .replace(/^\d+\.\s+/gm, "• ") // Convert numbered lists
    .trim();
  const maxLength = 160;
  const remark =
    cleanedRemark.length > maxLength
      ? cleanedRemark.slice(0, maxLength) + "..."
      : cleanedRemark;
  const coverUrl = rate?.mod?.coverUrl;
  const cta = t("metadata.rateOgCTA");
  const reviewByText = t("metadata.rateOgReviewBy");

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          backgroundColor: "#3d3d4a",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background gradient effect */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "radial-gradient(circle at top left, #4a4a5a 0%, transparent 50%)",
          }}
        />

        {/* Main container */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            padding: "48px 60px",
            gap: 56,
            alignItems: "center",
            position: "relative",
          }}
        >
          {/* Left: Cover Card with perspective effect */}
          {coverUrl && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: 320,
                  height: 450,
                  borderRadius: 32,
                  border: "6px solid #52525b",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
                  transform: "rotate(-4deg)",
                  overflow: "hidden",
                }}
              >
                <img
                  src={`${coverUrl}?width=320&height=450&fit=cover`}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            </div>
          )}

          {/* Right: Info Section */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 20,
            }}
          >
            {/* Logo + Domain badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 18px",
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                borderRadius: 24,
                alignSelf: "flex-start",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 1078 1036"
                fill="#9396f7"
              >
                <path d="M977.133,366.872c-34.06,111-68.92,221.68-108.66,330.78c-4,11-8.82,21.36-17.57,29.49c-14.4,13.39-30.36,13.62-44.61,0c-56.28-53.873-113.493-106.757-171.64-158.65c-49.41-44.27-98.45-88.94-147.84-133.23c-15.2-13.63-21.13-30.73-21.07-50.5c-0.19-10.682,2.292-21.241,7.22-30.72c37.57-73.61,71.1-149.11,105.07-224.4c14.56-32.27,30.22-64,45.5-96c1.808-3.846,4.038-7.478,6.65-10.83c11.45-14.4,29.12-15.51,42.6-2.15c15.58,15.46,30.46,31.63,45.85,47.29c78.313,79.64,156.683,159.213,235.11,238.72c11.51,11.65,21,24.18,24.32,40.64C979.42,353.805,979.1,360.537,977.133,366.872z M796.873,760.932c-3.53-9-10-16-16.91-22.49c-25.62-23.79-51-47.85-77-71.17c-76.17-68.16-154.55-133.87-229-204c-12.3-11.59-27.03-18.97-43.17-23.39c-14.03-3.84-28.15-5.73-42.31,0.27c-70.6,30-141.98,58.16-213.06,87c-14.21,5.77-28.42,11.55-42.55,17.55c-17.49,7.41-21.97,22.46-11.79,38.65c3.32,5.28,7.73,9.55,12.37,13.55c10.34,8.98,20.76,17.86,31.14,26.8c84.44,72.73,170.54,143.54,254.07,217.34c15.75,13.91,34.35,21.34,55.75,20.49c6.36-0.26,12.67,0.23,18.98-1.56c69.57-19.42,140.28-34.15,210.48-51c26.61-6.35,53.09-13.35,79.53-20.35C797.873,784.772,802.353,774.992,796.873,760.932z M597.283,0.132c-4.677,0.713-9.173,2.322-13.24,4.74c-83.58,47-169.46,89.59-254.38,134c-26.11,13.65-46.38,33.83-60.61,59.83c-15.32,27.94-30.22,56.11-45.88,83.86c-39.08,69.29-78.6,138.33-115.3,208.93c-4.04,7.78-7.82,15.64-8.66,24.09c-0.34,9.56,5.07,12.47,15.1,8.35c86.073-35.793,172.203-71.46,258.39-107c30.07-12.43,51.17-34.28,66.22-62.22c15.95-29.49,30.83-59.53,46.64-89.08c42.21-78.9,83.99-157.99,118.64-240.65c1.83-4.37,3.67-8.74,4.33-13.43C609.603,3.892,604.933-0.868,597.283,0.132z M158.623,891.855c-7.44,1.24-14.92,2.34-22.33,3.74c-35.06,6.62-69.9,14-102.6,29c-8.85,4.05-17.21,8.94-24.29,15.7c-13.77,13.18-12.4,24.4,4,34c12.97,7.6,27.2,12,41.52,16c55.21,15.35,111.82,22.93,168.55,29.59c54.63,6.4,109.43,10.61,164.43,13.33c103.23,5.12,206.33,3,309.33-5c53.89-4.16,107.69-9.3,161.26-16.64c50.26-6.88,100.38-14.62,149.38-28.22c20-5.56,40-11.35,57.47-23.39c15.97-10.97,17.27-24.52,3.81-38.6c-7.66-7.99-17.22-13.25-27.22-17.52c-34.93-14.82-71.96-20.75-109.27-25.28c-5.37-0.65-10.86-2.38-17.27-0.75c1.22,1.13,1.6,1.77,2.13,1.92c2.03,0.59,4.1,1.08,6.17,1.52c36.05,7.65,71.89,16.08,105.63,31.44c10.76,4.92,21.21,10.46,28.84,20c3.88,4.89,3.72,8.62-2.12,12c-10.52,6.14-21.89,10-33.52,13.14c-42.28,11.38-85.5,17.59-128.87,22.59c-54.63,6.34-109.41,11.15-164.3,14.85c-70.93,4.77-141.92,8.31-213,9.09c-93.09,1.02-186.02-3.17-278.81-10.63c-52.49-4.22-104.85-9.34-156.69-18.82c-19.27-3.52-38.54-7.32-56.54-15.42c-7.34-3.31-7.51-4.45-1.6-10.19c7.2-6.99,15.86-11.89,24.81-16.2c34.15-16.48,70.44-26.86,107-36.42c3.2-0.83,6.9-0.81,9.84-4C162.143,891.154,160.353,891.654,158.623,891.855z" />
              </svg>
              <span
                style={{
                  fontSize: 20,
                  color: "white",
                  fontWeight: 600,
                }}
              >
                dicecho.com
              </span>
            </div>

            {/* Mod Title */}
            <span
              style={{
                fontSize: 48,
                fontWeight: 800,
                color: "white",
                lineHeight: 1.15,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {modTitle}
            </span>

            {/* Reviewer info with avatar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              {/* Avatar */}
              {userAvatar ? (
                <img
                  src={`${userAvatar}?width=56&height=56&fit=cover`}
                  alt=""
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    border: "3px solid #52525b",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    backgroundColor: "#52525b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#d4d4d8",
                    fontSize: 24,
                    fontWeight: 600,
                  }}
                >
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    color: "#a1a1aa",
                  }}
                >
                  {reviewByText}
                </span>
                <span
                  style={{
                    fontSize: 22,
                    color: "white",
                    fontWeight: 600,
                  }}
                >
                  {userName}
                </span>
              </div>
            </div>

            {/* Rating - separate row with stars */}
            {rating && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill={
                        i < Math.round(Number(rating) / 2) ? "#fbbf24" : "#52525b"
                      }
                      stroke={
                        i < Math.round(Number(rating) / 2) ? "#fbbf24" : "#52525b"
                      }
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <span
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: "#fbbf24",
                  }}
                >
                  {rating}
                </span>
              </div>
            )}

            {/* Review Content */}
            {remark && (
              <span
                style={{
                  fontSize: 20,
                  color: "#d4d4d8",
                  lineHeight: 1.6,
                  maxWidth: 560,
                  maxHeight: 96,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "pre-line",
                }}
              >
                "{remark}"
              </span>
            )}

            {/* CTA Button */}
            <div
              style={{
                display: "flex",
                marginTop: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#9396f7",
                  color: "white",
                  fontSize: 20,
                  fontWeight: 600,
                  padding: "14px 36px",
                  borderRadius: 40,
                  boxShadow: "0 4px 16px rgba(147, 150, 247, 0.4)",
                }}
              >
                {cta}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
