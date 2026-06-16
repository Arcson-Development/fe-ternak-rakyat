"use client";

import React from "react";
import {
  ActionIcon,
  Box,
  Group,
  Image,
  Stack,
  Text,
} from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE, FileWithPath } from "@mantine/dropzone";
import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react";
import type { PhotoRef } from "../../hooks/useTernakRakyat/types";

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
 * Single photo upload with preview. Wraps @mantine/dropzone and keeps
 * the project's PhotoRef shape so the wizard stays a pure controlled
 * component.
 */
export function FileUploadCard({
  label,
  description,
  value,
  onChange,
  aspect = 16 / 10,
}: Props) {
  const handleDrop = (files: FileWithPath[]) => {
    const f = files[0];
    if (!f) return;
    const preview = URL.createObjectURL(f);
    onChange({ preview, name: f.name, size: f.size });
  };

  const handleRemove = () => {
    if (value.preview && value.preview.startsWith("blob:")) {
      URL.revokeObjectURL(value.preview);
    }
    onChange({ preview: null });
  };

  if (value.preview) {
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
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={handleRemove}
            aria-label="Hapus foto"
          >
            <IconX size={16} />
          </ActionIcon>
        </Group>
        <Box
          style={{
            position: "relative",
            borderRadius: 8,
            overflow: "hidden",
            border: "1px solid var(--app-border)",
            aspectRatio: aspect,
            background: "var(--app-surface-sunken)",
          }}
        >
          <Image
            src={value.preview}
            alt={label}
            fit="cover"
            h="100%"
            w="100%"
          />
        </Box>
      </Box>
    );
  }

  return (
    <Dropzone
      onDrop={handleDrop}
      onReject={() => {}}
      maxSize={5 * 1024 * 1024}
      accept={IMAGE_MIME_TYPE}
      multiple={false}
      radius="md"
      p="md"
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
          <Text fz="xs" c="dimmed" lh={1.3}>
            {description ?? "Seret foto ke sini atau klik untuk pilih file · maks 5 MB"}
          </Text>
        </Stack>
      </Group>
    </Dropzone>
  );
}
