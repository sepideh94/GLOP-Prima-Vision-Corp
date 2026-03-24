import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import {
  Box,
  IconButton,
  Divider,
  Tooltip,
  Paper,
} from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";

/**
 * Props:
 *   value: string (HTML)
 *   onChange: (html: string) => void
 *   placeholder: string
 */
export default function RichTextEditor({ value, onChange, placeholder }) {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  const ToolbarButton = ({ title, onClick, active, icon }) => (
    <Tooltip title={title}>
      <IconButton
        size="small"
        onClick={onClick}
        sx={{
          borderRadius: 1,
          color: active ? "primary.main" : "text.secondary",
          bgcolor: active ? "action.selected" : "transparent",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );

  return (
    <Paper variant="outlined" sx={{ borderRadius: 1 }}>
      {/* Toolbar */}
      <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0.25, p: 0.5, borderBottom: "1px solid", borderColor: "divider" }}>
        <ToolbarButton title="Gras" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} icon={<FormatBoldIcon fontSize="small" />} />
        <ToolbarButton title="Italique" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} icon={<FormatItalicIcon fontSize="small" />} />
        <ToolbarButton title="Souligné" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} icon={<FormatUnderlinedIcon fontSize="small" />} />
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <ToolbarButton title="Liste à puces" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} icon={<FormatListBulletedIcon fontSize="small" />} />
        <ToolbarButton title="Liste numérotée" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} icon={<FormatListNumberedIcon fontSize="small" />} />
        <ToolbarButton title="Citation" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} icon={<FormatQuoteIcon fontSize="small" />} />
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <ToolbarButton title="Annuler" active={false} onClick={() => editor.chain().focus().undo().run()} icon={<UndoIcon fontSize="small" />} />
        <ToolbarButton title="Rétablir" active={false} onClick={() => editor.chain().focus().redo().run()} icon={<RedoIcon fontSize="small" />} />
      </Box>

      {/* Contenu éditeur */}
      <Box
        sx={{
          px: 1.5,
          py: 1,
          minHeight: 120,
          "& .tiptap": {
            outline: "none",
            minHeight: 100,
            fontSize: 14,
            lineHeight: 1.6,
            "& p": { my: 0.5 },
            "& ul, & ol": { pl: 3 },
            "& blockquote": {
              borderLeft: "3px solid",
              borderColor: "divider",
              pl: 1.5,
              color: "text.secondary",
              fontStyle: "italic",
            },
          },
          "& .tiptap p.is-editor-empty:first-child::before": {
            content: `"${placeholder || "Description..."}"`,
            color: "text.disabled",
            pointerEvents: "none",
            float: "left",
            height: 0,
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Paper>
  );
}
