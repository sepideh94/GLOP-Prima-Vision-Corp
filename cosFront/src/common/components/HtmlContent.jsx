import DOMPurify from "dompurify";
import { Box } from "@mui/material";
import { decodeEscapedHtmlMarkup } from "../utils/htmlUtils";

/**
 * Affiche du HTML provenant d'un WYSIWYG de manière sécurisée.
 * Utilise DOMPurify pour neutraliser tout XSS.
 *
 * Props:
 *   html: string
 *   sx: object (MUI sx prop)
 */
export default function HtmlContent({ html, sx }) {
  if (!html) return null;

  const raw = decodeEscapedHtmlMarkup(html);

  const clean = DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "h2",
      "h3",
      "ul",
      "ol",
      "li",
      "blockquote",
      "pre",
      "code",
    ],
    ALLOWED_ATTR: [],
  });

  return (
    <Box
      sx={{
        fontSize: "0.9rem",
        lineHeight: 1.6,
        "& p": { margin: "0 0 4px" },
        "& h2": { fontSize: "1.1rem", fontWeight: 700, margin: "8px 0 4px" },
        "& h3": { fontSize: "1rem", fontWeight: 600, margin: "6px 0 4px" },
        "& ul, & ol": { paddingLeft: "1.4em", margin: "4px 0" },
        "& li": { marginBottom: "2px" },
        "& blockquote": {
          margin: "8px 0",
          paddingLeft: "1em",
          borderLeft: "3px solid rgba(0,0,0,0.15)",
        },
        "& pre": {
          margin: "8px 0",
          padding: "8px",
          borderRadius: "4px",
          backgroundColor: "rgba(0,0,0,0.05)",
          overflow: "auto",
          fontSize: "0.85em",
        },
        "& code": { fontFamily: "monospace" },
        ...sx,
      }}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
