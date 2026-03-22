import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "PromptNotes";
  const author = searchParams.get("author") || "";
  const type = searchParams.get("type") || "prompt";

  const typeLabel =
    type === "prompt"
      ? "Prompt"
      : type === "template"
        ? "Template"
        : type === "note"
          ? "Note"
          : "Prompt";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0f0f0f",
          padding: "60px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top bar: logo + badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: "#4F46E5",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "20px",
                fontWeight: 700,
              }}
            >
              P
            </div>
            <span
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: "#e0e0e0",
                letterSpacing: "-0.02em",
              }}
            >
              PromptNotes
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#1e1e2e",
              border: "1px solid #4F46E5",
              borderRadius: "9999px",
              padding: "8px 20px",
              fontSize: "18px",
              fontWeight: 600,
              color: "#a5b4fc",
            }}
          >
            {typeLabel}
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: title.length > 40 ? "48px" : "60px",
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxHeight: "300px",
            }}
          >
            {title}
          </div>
        </div>

        {/* Bottom bar: author + accent line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid #4F46E5",
            paddingTop: "24px",
          }}
        >
          {author ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "9999px",
                  backgroundColor: "#4F46E5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontSize: "16px",
                  fontWeight: 600,
                }}
              >
                {author.charAt(0).toUpperCase()}
              </div>
              <span
                style={{
                  fontSize: "22px",
                  color: "#a0a0a0",
                  fontWeight: 500,
                }}
              >
                {author}
              </span>
            </div>
          ) : (
            <div style={{ display: "flex" }} />
          )}

          <span
            style={{
              fontSize: "18px",
              color: "#555555",
            }}
          >
            prompt-notes.ai
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
