"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ActionIcon,
  Box,
  Group,
  Image,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE, FileWithPath } from "@mantine/dropzone";
import {
  IconCamera,
  IconPhoto,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import type { PhotoRef } from "../../hooks/useTernakRakyat/types";
import { putPhoto, deletePhoto } from "../../utils/lib/idbPhotoStore";
import { safeRandomUUID } from "../../utils/lib/safeUuid";

type Props = {
  label: string;
  value: PhotoRef;
  onChange: (next: PhotoRef) => void;
  /** Optional help text under the label. */
  description?: string;
  /** Optional aspect ratio (default 16/10) for the preview. */
  aspect?: number;
};

function humanSize(bytes?: number) {
  if (!bytes) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

/**
 * Returns true when `value.preview` is a blob URL that the current
 * document can actually resolve. Blob URLs survive only as long as the
 * document that created them, so a draft restored after a refresh
 * always fails this check and the dropzone is shown instead of a
 * broken <img>.
 */
function usePreviewUsable(value: PhotoRef) {
  const [usable, setUsable] = useState(true);

  useEffect(() => {
    if (!value.preview) {
      setUsable(false);
      return;
    }
    if (!value.preview.startsWith("blob:")) {
      // http(s) and data: URLs are assumed valid — they're the freshly
      // minted ones created in this same session.
      setUsable(true);
      return;
    }
    let cancelled = false;
    // Use `window.Image` to avoid colliding with the Mantine `Image`
    // component we import at the top of this file.
    const probe = new window.Image();
    probe.onload = () => {
      if (!cancelled) setUsable(true);
    };
    probe.onerror = () => {
      if (!cancelled) setUsable(false);
    };
    probe.src = value.preview;
    return () => {
      cancelled = true;
    };
  }, [value.preview]);

  return usable;
}

/**
 * Single photo upload with preview. Wraps @mantine/dropzone and keeps
 * the project's PhotoRef shape so the wizard stays a pure controlled
 * component.
 *
 * UX flow:
 *   1. Empty    → dropzone only
 *   2. Filled   → preview + "Ganti Foto" overlay (click to replace) + X (delete)
 *
 * Step 2's "click to replace" is implemented by exposing the dropzone's
 * `openRef` and calling it on preview click, so replacing is a single
 * click instead of "click X, then drop new file".
 */
export function FileUploadCard({
  label,
  description,
  value,
  onChange,
  aspect = 16 / 10,
}: Props) {
  const previewUsable = usePreviewUsable(value);
  const openRef = useRef<() => void>(null);

  const handleDrop = (files: FileWithPath[]) => {
    const f = files[0];
    if (!f) return;
    // Revoke the previous blob URL before creating a new one, otherwise
    // every replacement leaks one URL until the tab is closed.
    if (value.preview?.startsWith("blob:")) {
      URL.revokeObjectURL(value.preview);
    }
    // Mirror the File into IndexedDB so a page refresh doesn't wipe the
    // preview. If the write fails (quota, private mode) we still show
    // the in-memory blob URL — the photo just won't survive reload.
    const newId = safeRandomUUID();
    putPhoto(newId, f).catch((err) => {
      // eslint-disable-next-line no-console
      console.warn(
        "[FileUploadCard] Failed to persist photo to IndexedDB; it will need to be re-attached after refresh:",
        err
      );
    });
    // Best-effort: free the slot the previous file occupied. If the
    // delete fails (already gone, etc.) it's harmless — the orphan will
    // be cleaned up by the next save or by the user clearing all data.
    if (value.id) {
      deletePhoto(value.id).catch(() => {});
    }
    const preview = URL.createObjectURL(f);
    onChange({ id: newId, preview, name: f.name, size: f.size, file: f });
  };

  const handleRemove = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (value.preview && value.preview.startsWith("blob:")) {
      URL.revokeObjectURL(value.preview);
    }
    if (value.id) {
      deletePhoto(value.id).catch(() => {});
    }
    // Keep the slot's id stable so a re-upload can replace it cleanly,
    // and so any downstream references to this PhotoRef keep working.
    onChange({ id: value.id, preview: null });
  };

  const handleReplaceClick = () => {
    openRef.current?.();
  };

  if (value.preview && previewUsable) {
    return (
      <Box>
        <Group justify="space-between" mb={6}>
          <Stack gap={0}>
            <Text fz="sm" fw={600}>
              {label}
            </Text>
            {value.name && (
              <Text fz="xs" c="dimmed">
                {value.name}
                {value.size ? ` · ${humanSize(value.size)}` : ""}
              </Text>
            )}
          </Stack>
          <Group gap={4}>
            <Tooltip label="Ganti foto">
              <ActionIcon
                variant="light"
                color="primary"
                onClick={handleReplaceClick}
                aria-label="Ganti foto"
              >
                <IconCamera size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Hapus foto">
              <ActionIcon
                variant="light"
                color="red"
                onClick={handleRemove}
                aria-label="Hapus foto"
              >
                <IconX size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
        <Box
          role="button"
          tabIndex={0}
          onClick={handleReplaceClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleReplaceClick();
            }
          }}
          style={{
            position: "relative",
            borderRadius: 8,
            overflow: "hidden",
            border: "1px solid var(--app-border)",
            aspectRatio: aspect,
            background: "var(--app-surface-sunken)",
            cursor: "pointer",
          }}
        >
          <Image
            src={value.preview}
            alt={label}
            fit="cover"
            h="100%"
            w="100%"
          />
          {/* Hover hint: "Klik untuk ganti" */}
          <Box
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              background: "rgba(15,23,42,0)",
              transition: "background 0.15s",
              pointerEvents: "none",
            }}
            className="file-upload-hover-hint"
            data-hover-hint="replace"
          >
            <Group
              gap={6}
              px="sm"
              py={6}
              style={{
                background: "rgba(15,23,42,0.7)",
                color: "white",
                borderRadius: 999,
                opacity: 0,
                transition: "opacity 0.15s",
              }}
              className="file-upload-hover-pill"
            >
              <IconCamera size={14} />
              <Text fz="xs" fw={600}>
                Klik untuk ganti
              </Text>
            </Group>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Dropzone
      onDrop={handleDrop}
      onReject={(rej) => {
        // Surface the rejection reason instead of silently dropping it.
        const first = rej[0];
        const why =
          first?.errors?.[0]?.message ||
          "File tidak diterima (format atau ukuran tidak sesuai).";
        // Lazy import to avoid pulling notifications into this render path
        // when the component is used outside the wizard.
        import("@mantine/notifications").then(({ notifications }) =>
          notifications.show({
            title: "Upload ditolak",
            message: why,
            color: "red",
          })
        );
      }}
      maxSize={5 * 1024 * 1024}
      accept={IMAGE_MIME_TYPE}
      multiple={false}
      radius="md"
      p="md"
      openRef={openRef}
      styles={{
        root: {
          background: "var(--app-surface-sunken)",
        },
      }}
    >
      <Group justify="center" gap="sm" mih={92}>
        <Dropzone.Accept>
          <IconUpload size={32} stroke={1.4} color="var(--app-primary)" />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <IconX size={32} stroke={1.4} color="var(--app-danger)" />
        </Dropzone.Reject>
        <Dropzone.Idle>
          <IconPhoto size={28} stroke={1.4} color="var(--app-text-muted)" />
        </Dropzone.Idle>
        <Stack gap={0} style={{ minWidth: 0 }}>
          <Text fz="sm" fw={600}>
            {label}
          </Text>
          {value.name && !value.file ? (
            // PhotoRef has a name (from a previous session's draft) but
            // the underlying File object can't be restored — surface that
            // to the user so they know to re-attach it.
            <Text fz="xs" c="orange" lh={1.3}>
              Sebelumnya: {value.name}
              {value.size ? ` · ${humanSize(value.size)}` : ""} — unggah ulang untuk melampirkan
            </Text>
          ) : (
            <Text fz="xs" c="dimmed" lh={1.3}>
              {description ?? "Seret foto ke sini atau klik untuk pilih file · maks 5 MB"}
            </Text>
          )}
        </Stack>
      </Group>
    </Dropzone>
  );
}
