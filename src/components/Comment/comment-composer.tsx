"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useMutation } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthDialog } from "@/components/Auth/AuthDialog";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";

// Dynamic import for RichTextEditor to reduce initial bundle size
const RichTextEditor = dynamic(
  () => import("@/components/Editor/RichTextEditor").then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => <Skeleton className="h-32 w-full rounded-md" />,
  }
);

interface CommentComposerProps {
  placeholder: string;
  onSubmit: (content: string) => Promise<void>;
  className?: string;
  mode?: "rich" | "simple";
  autoFocus?: boolean;
  showCancel?: boolean;
  cancelLabel?: string;
  onCancel?: () => void;
  disabled?: boolean;
  /** Name of the user being replied to (shows reply context) */
  replyToName?: string;
  /** Preview of the content being replied to */
  replyToContent?: string;
}

export const CommentComposer: React.FC<CommentComposerProps> = (props) => {
  const { t } = useTranslation();
  const { status } = useSession();
  const [value, setValue] = useState("");

  const mutation = useMutation({
    mutationFn: (content: string) => props.onSubmit(content),
    onSuccess: () => setValue(""),
  });

  const handleSubmit = () => {
    const content = value.trim();
    if (!content || mutation.isPending || props.disabled) {
      return;
    }
    mutation.mutate(content);
  };

  if (status === "loading") {
    return null;
  }

  if (status !== "authenticated") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl bg-muted/30 px-3 py-2 text-xs text-muted-foreground",
          props.className,
        )}
      >
        <span>{t("comment_login_prompt")}</span>
        <AuthDialog>
          <Button size="sm" className="h-8 px-3 text-xs" variant="outline">
            {t("comment_login_button")}
          </Button>
        </AuthDialog>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "space-y-2 rounded-2xl bg-muted/20 p-3",
        props.className,
      )}
    >
      {/* Reply context header */}
      {props.replyToName && (
        <div className="flex items-start justify-between gap-2 border-l-2 border-primary/50 pl-2">
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="text-xs font-medium">
              {t("reply_to")} @{props.replyToName}
            </div>
            {props.replyToContent && (
              <div className="truncate text-xs text-muted-foreground">
                {props.replyToContent}
              </div>
            )}
          </div>
          {props.onCancel && (
            <button
              type="button"
              onClick={props.onCancel}
              className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
      {props.mode === "rich" ? (
        <RichTextEditor
          onMarkdownChange={(markdown) => {
            console.log('markdown', markdown);
            setValue(markdown)
          }}
          markdown={value}
        />
      ) : (
        <Textarea
          value={value}
          autoFocus={props.autoFocus}
          onChange={(event) => setValue(event.target.value)}
          placeholder={props.placeholder}
          disabled={mutation.isPending || props.disabled}
          className="min-h-[48px]"
        />
      )}
      <div className="flex justify-end gap-2">
        {props.showCancel && (
          <Button
            size="sm"
            className="h-8 px-3 text-xs"
            variant="ghost"
            onClick={props.onCancel}
            disabled={mutation.isPending}
          >
            {t("cancel")}
          </Button>
        )}
        <Button
          size="sm"
          className="h-8 px-3 text-xs"
          onClick={handleSubmit}
          disabled={mutation.isPending || !value.trim() || props.disabled}
        >
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("comment_submit")}
        </Button>
      </div>
    </div>
  );
};