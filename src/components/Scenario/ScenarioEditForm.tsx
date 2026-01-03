"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CoverUpload from "@/components/ui/cover-upload";
import GalleryUpload from "@/components/ui/gallery-upload";
import { useTranslation } from "@/lib/i18n/react";
import type { IModDto, ModFilterConfig } from "@dicecho/types";
import TableUpload from "@/components/file-upload/table-upload";
import type { FileMetadata } from "@/hooks/use-file-upload";
import MultipleSelector from "@/components/ui/multiple-selector";
import { useDicecho } from "@/hooks/useDicecho";
import { Skeleton } from "@/components/ui/skeleton";
import { useScenarioConfig } from "@/hooks/use-scenario-config";

const relatedLinkSchema = z.object({
  name: z.string().min(1, "必填"),
  url: z.string().url("请输入合法链接"),
});

const baseSchema = z.object({
  title: z.string().min(1, "标题必填"),
  alias: z.string().optional(),
  description: z.string().optional(),
  moduleRule: z.string().min(1, "请选择规则"),
  languages: z.array(z.string()).optional(),
  minPlayer: z.coerce.number().min(0).optional(),
  maxPlayer: z.coerce.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  relatedLinks: z.array(relatedLinkSchema).optional(),
  coverUrl: z.string().url().optional().or(z.literal("")),
  imageUrls: z.array(z.string()).optional(),
  modFiles: z
    .array(
      z.object({
        name: z.string(),
        url: z.string().url("请输入合法链接"),
        size: z.number().optional(),
        type: z.string().optional(),
      }),
    )
    .optional(),
});

export type ScenarioEditFormValues = z.infer<typeof baseSchema>;

interface ScenarioEditFormProps {
  scenario?: IModDto;
  onSubmit: (values: ScenarioEditFormValues) => Promise<void> | void;
  submitText?: string;
}

export function ScenarioEditForm({
  scenario,
  onSubmit,
  submitText,
}: ScenarioEditFormProps) {
  const { t, i18n } = useTranslation();
  const { api } = useDicecho();

  const { data: config } = useScenarioConfig();

  const form = useForm<ScenarioEditFormValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: scenario
      ? {
          title: scenario.title,
          alias: scenario.alias,
          description: scenario.description,
          moduleRule: scenario.moduleRule,
          languages: scenario.languages,
          minPlayer: scenario.playerNumber?.[0],
          maxPlayer: scenario.playerNumber?.[1],
          tags: scenario.tags,
          relatedLinks: scenario.relatedLinks,
          coverUrl: scenario.coverUrl,
          imageUrls: scenario.imageUrls,
          modFiles: scenario.modFiles?.map((f) => ({
            name: f.name,
            url: f.url,
            size: f.size,
            type: f.type,
          })),
        }
      : {
          relatedLinks: [],
          tags: [],
          languages: [],
          imageUrls: [],
          modFiles: [],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "relatedLinks",
  });

  const onFormSubmit = async (values: ScenarioEditFormValues) => {
    await onSubmit(values);
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onFormSubmit)}>
        <FormField
          control={form.control}
          name="coverUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("cover")}</FormLabel>
              <CoverUpload
                className="h-64 w-48"
                value={field.value ?? undefined}
                onChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("title")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="alias"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("alias") ?? "别名"}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="moduleRule"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("rule")}</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("select_rule")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {config?.rules.map((rule) => (
                    <SelectItem key={rule._id} value={rule._id}>
                      {rule._id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="languages"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("languages")}</FormLabel>
              <MultipleSelector
                options={(config?.languages ?? []).map((lang) => ({
                  value: lang._id,
                  label:
                    t(`language_codes.${lang._id}`),
                }))}
                value={(field.value ?? []).map((v) => ({
                  value: v,
                  label: t(`language_codes.${v}`),
                }))}
                onChange={(opts) => field.onChange(opts.map((o) => o.value))}
                placeholder={t("select_languages")}
                creatable={false}
                
              />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="minPlayer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("min_player")}</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maxPlayer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("max_player")}</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("tags")}</FormLabel>
              <MultipleSelector
                options={(field.value ?? []).map((tag) => ({
                  value: tag,
                  label: tag,
                }))}
                value={(field.value ?? []).map((tag) => ({
                  value: tag,
                  label: tag,
                }))}
                onChange={(opts) => field.onChange(opts.map((o) => o.value))}
                placeholder={t("scenario_tags_placeholder")}
                creatable
                selectFirstItem
                triggerSearchOnFocus
                queryKeyBase="scenario-tags"
                onSearch={(keyword) =>
                  api.search.tag({ keyword, pageSize: 10 }).then((res) =>
                    res.data.map((tag) => ({
                      value: tag.name,
                      label: tag.name,
                    })),
                  )
                }
                loadingIndicator={
                  <div className="space-y-1 p-1">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <div key={idx} className="flex items-center">
                        <Skeleton className="h-8 w-full rounded-md" />
                      </div>
                    ))}
                  </div>
                }
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("description")}</FormLabel>
              <FormControl>
                <Textarea rows={5} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrls"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("scenario_gallery")}</FormLabel>
              <GalleryUpload
                value={field.value ?? []}
                onChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <div className="mb-2 font-semibold">{t("scenario_related_link")}</div>
          {fields.map((fieldItem, index) => (
            <div
              key={fieldItem.id}
              className="mb-3 flex items-center gap-2"
            >
              <FormField
                control={form.control}
                name={`relatedLinks.${index}.name`}
                render={({ field }) => (
                  <FormItem className="max-w-40">
                    <FormControl>
                      <Input {...field} placeholder={t("scenario_link_name")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`relatedLinks.${index}.url`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input {...field} placeholder={t("scenario_link_url")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="destructive"
                onClick={() => remove(index)}
              >
                {t("delete")}
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => append({ name: "", url: "" })}
          >
            {t("add_link")}
          </Button>
        </div>

        <FormField
          control={form.control}
          name="modFiles"
          render={({ field }) => {
            const initialFiles: FileMetadata[] =
              field.value?.map((f) => ({
                id: f.name,
                name: f.name,
                size: f.size ?? 0,
                type: f.type ?? "application/octet-stream",
                url: f.url,
              })) ?? [];
            return (
              <FormItem>
                <FormLabel>{t("scenario_files") ?? "模组文件"}</FormLabel>
                <TableUpload
                  initialFiles={initialFiles}
                  onFilesChange={(files) =>
                    field.onChange(
                      files.map((file) => ({
                        name: file.file.name,
                        url: file.preview || "",
                        size: file.file.size,
                        type: file.file.type,
                      })),
                    )
                  }
                />
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit">{submitText ?? t("save")}</Button>
        </div>
      </form>
    </Form>
  );
}
