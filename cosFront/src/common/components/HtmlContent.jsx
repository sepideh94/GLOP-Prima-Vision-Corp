import DOMPurify from "dompurify";
import { Box } from "@mui/material";

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

  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "h2", "h3", "ul", "ol", "li"],
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
        ...sx,
      }}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
