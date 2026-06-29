"use client";

import React, { useState, useEffect } from "react";
import {
  ActionIcon,
  Box,
  Group,
  Image,
  Modal,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconMaximize,
  IconX,
} from "@tabler/icons-react";

export type PhotoItem = {
  /** Stable id (kandangId + field name) */
  id: string;
  /** Photo URL or data URL */
  url: string;
  /** Display title (e.g. "Foto Dinding - Kandang 1") */
  title: string;
  /** Optional caption (e.g. "Kandang 1, Peternak: Budi") */
  caption?: string;
};

type Props = {
  /** All photos in the gallery. The lightbox will open at the clicked index. */
  photos: PhotoItem[];
  /** External open state. Optional if used as standalone. */
  opened: boolean;
  /** Initial index to show when opening. */
  initialIndex?: number;
  /** Close handler. */
  onClose: () => void;
};

/**
 * Production photo lightbox with prev/next navigation, keyboard support,
 * download, and a thumbnail strip. Used by detail pages and laporan.
 */
export function PhotoLightbox({
  photos,
  opened,
  initialIndex = 0,
  onClose,
}: Props) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (opened) setIndex(initialIndex);
  }, [opened, initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!opened) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setIndex((i) => (i - 1 + photos.length) % photos.length);
      } else if (e.key === "ArrowRight") {
        setIndex((i) => (i + 1) % photos.length);
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [opened, photos.length, onClose]);

  if (photos.length === 0) return null;
  const current = photos[index];
  if (!current) return null;

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = current.url;
    a.download = `${current.title.replace(/\s+/g, "-")}.jpg`;
    a.target = "_blank";
    a.click();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      padding={0}
      size="xl"
      centered
      overlayProps={{ opacity: 0.85 }}
      styles={{
        body: { padding: 0 },
        content: { overflow: "hidden" },
      }}
    >
      <Stack gap={0}>
        {/* Top toolbar */}
        <Group
          justify="space-between"
          p="sm"
          style={{
            background: "var(--app-surface)",
            borderBottom: "1px solid var(--app-border)",
          }}
        >
          <Stack gap={0} style={{ minWidth: 0, flex: 1 }}>
            <Text fw={700} truncate>{current.title}</Text>
            {current.caption && (
              <Text fz="xs" c="dimmed" truncate>{current.caption}</Text>
            )}
          </Stack>
          <Group gap={4}>
            <Text fz="xs" c="dimmed" mr="sm">
              {index + 1} / {photos.length}
            </Text>
            <Tooltip label="Download">
              <ActionIcon variant="subtle" onClick={handleDownload}>
                <IconDownload size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Tutup (Esc)">
              <ActionIcon variant="subtle" onClick={onClose}>
                <IconX size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        {/* Image area with prev/next */}
        <Box
          style={{
            position: "relative",
            background: "#000",
            minHeight: 400,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {photos.length > 1 && (
            <>
              <ActionIcon
                size="xl"
                radius="xl"
                variant="filled"
                color="dark"
                pos="absolute"
                style={{ left: 12, top: "50%", transform: "translateY(-50%)", zIndex: 2, opacity: 0.7 }}
                onClick={() =>
                  setIndex((i) => (i - 1 + photos.length) % photos.length)
                }
                aria-label="Sebelumnya"
              >
                <IconChevronLeft size={20} />
              </ActionIcon>
              <ActionIcon
                size="xl"
                radius="xl"
                variant="filled"
                color="dark"
                pos="absolute"
                style={{ right: 12, top: "50%", transform: "translateY(-50%)", zIndex: 2, opacity: 0.7 }}
                onClick={() => setIndex((i) => (i + 1) % photos.length)}
                aria-label="Berikutnya"
              >
                <IconChevronRight size={20} />
              </ActionIcon>
            </>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.url}
            alt={current.title}
            style={{
              maxWidth: "100%",
              maxHeight: "70vh",
              objectFit: "contain",
              display: "block",
            }}
          />
        </Box>

        {/* Thumbnail strip */}
        {photos.length > 1 && (
          <Box
            p="sm"
            style={{
              background: "var(--app-surface)",
              borderTop: "1px solid var(--app-border)",
              overflowX: "auto",
            }}
          >
            <Group gap="xs" wrap="nowrap">
              {photos.map((p, i) => (
                <Box
                  key={p.id}
                  onClick={() => setIndex(i)}
                  style={{
                    width: 64,
                    height: 48,
                    borderRadius: 4,
                    overflow: "hidden",
                    cursor: "pointer",
                    flexShrink: 0,
                    border:
                      i === index
                        ? "2px solid var(--app-primary)"
                        : "2px solid transparent",
                    opacity: i === index ? 1 : 0.6,
                    transition: "all 0.15s",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url}
                    alt={p.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>
              ))}
            </Group>
          </Box>
        )}
      </Stack>
    </Modal>
  );
}

/**
 * Inline photo trigger. Renders a thumbnail. Clicking opens the
 * lightbox at the right index. Pass allPhotos so the lightbox can
 * navigate to siblings.
 */
export function PhotoThumb({
  url,
  title,
  caption,
  allPhotos,
  index,
  onOpen,
  height = 96,
}: {
  url: string;
  title: string;
  caption?: string;
  allPhotos: PhotoItem[];
  index: number;
  onOpen: (i: number) => void;
  height?: number;
}) {
  return (
    <Box
      onClick={() => onOpen(index)}
      style={{
        position: "relative",
        width: "100%",
        height,
        borderRadius: 8,
        overflow: "hidden",
        cursor: "pointer",
        border: "1px solid var(--app-border)",
        background: "var(--app-surface-muted)",
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.02)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={title}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <Box
        style={{
          position: "absolute",
          top: 4,
          right: 4,
          background: "rgba(0,0,0,0.6)",
          color: "white",
          borderRadius: 4,
          padding: 2,
          display: "flex",
          alignItems: "center",
        }}
      >
        <IconMaximize size={12} />
      </Box>
      <Box
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)",
          color: "white",
          padding: "8px 8px 4px",
          fontSize: 11,
        }}
      >
        {title}
      </Box>
    </Box>
  );
}
