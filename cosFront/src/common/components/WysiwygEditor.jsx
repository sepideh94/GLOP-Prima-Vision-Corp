import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Typography,
} from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import TitleIcon from "@mui/icons-material/Title";

/**
 * Éditeur de texte riche (WYSIWYG) basé sur TipTap.
 *
 * Props:
 *   label: string
 *   value: string  — HTML
 *   onChange: (html: string) => void
 *   minHeight: string — défaut "120px"
 */
export default function WysiwygEditor({ label, value, onChange, minHeight = "120px" }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
    ],
    content: value || "",
    onUpdate({ editor: e }) {
      const html = e.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  // Sync value externe → éditeur (mode édition)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const incoming = value || "";
    if (current !== incoming) {
      editor.commands.setContent(incoming, false);
    }
  }, [value, editor]);

  if (!editor) return null;

  const active = (format, attrs) =>
    editor.isActive(format, attrs) ? [format + (attrs ? JSON.stringify(attrs) : "")] : [];

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        overflow: "hidden",
        "&:focus-within": { borderColor: "primary.main", boxShadow: "0 0 0 2px rgba(25,118,210,0.15)" },
      }}
    >
      {/* Label */}
      {label && (
        <Typography
          variant="caption"
          sx={{ px: 1.5, pt: 0.75, display: "block", color: "text.secondary", fontWeight: 500 }}
        >
          {label}
        </Typography>
      )}

      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 0.25,
          px: 1,
          py: 0.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "grey.50",
        }}
      >
        <ToggleButtonGroup size="small" exclusive={false}>
          <ToggleButton
            value="bold"
            selected={editor.isActive("bold")}
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
            title="Gras (Ctrl+B)"
          >
            <FormatBoldIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton
            value="italic"
            selected={editor.isActive("italic")}
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
            title="Italique (Ctrl+I)"
          >
            <FormatItalicIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton
            value="underline"
            selected={editor.isActive("underline")}
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}
            title="Souligné (Ctrl+U)"
          >
            <FormatUnderlinedIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <ToggleButtonGroup size="small" exclusive={false}>
          <ToggleButton
            value="h2"
            selected={editor.isActive("heading", { level: 2 })}
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); }}
            title="Titre"
          >
            <TitleIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <ToggleButtonGroup size="small" exclusive={false}>
          <ToggleButton
            value="bulletList"
            selected={editor.isActive("bulletList")}
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}
            title="Liste à puces"
          >
            <FormatListBulletedIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton
            value="orderedList"
            selected={editor.isActive("orderedList")}
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}
            title="Liste numérotée"
          >
            <FormatListNumberedIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Zone d'édition */}
      <Box
        sx={{
          px: 1.5,
          py: 1,
          minHeight,
          cursor: "text",
          "& .tiptap": {
            outline: "none",
            minHeight,
            fontSize: "0.9rem",
            lineHeight: 1.6,
            "& p": { margin: "0 0 4px" },
            "& h2": { fontSize: "1.1rem", fontWeight: 700, margin: "8px 0 4px" },
            "& h3": { fontSize: "1rem", fontWeight: 600, margin: "6px 0 4px" },
            "& ul, & ol": { paddingLeft: "1.4em", margin: "4px 0" },
            "& li": { marginBottom: "2px" },
          },
        }}
        onClick={() => editor.commands.focus()}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
}
