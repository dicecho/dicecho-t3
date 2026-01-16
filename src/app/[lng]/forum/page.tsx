import { MobileFooter } from "@/components/Footer";
import { MobileHeader } from "@/components/Header/MobileHeader";
import { HeaderMenu } from "@/components/Header/HeaderMenu";
import { HeaderSearch } from "@/components/Header/HeaderSearch";
import { NotificationReminder } from "@/components/Header/notification-reminder";
import { getTranslation } from "@/lib/i18n";
import { getDicechoServerApi } from "@/server/dicecho";
import { ForumPageClient } from "./forum-page-client";
import type { Metadata } from "next";
import { TopicSortKey, TOPIC_SORT_OPTIONS } from "@/types/topic";

export const dynamic = "auto";
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lng: string }>;
}): Promise<Metadata> {
  const { lng } = await params;
  const { t } = await getTranslation(lng);

  return {
    title: t("forum"),
    alternates: {
      canonical: `/${lng}/forum`,
      languages: {
        en: "/en/forum",
        ja: "/ja/forum",
        zh: "/zh/forum",
        ko: "/ko/forum",
      },
    },
  };
}

export default async function ForumPage({
  params,
  searchParams,
}: {
  params: Promise<{ lng: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const [{ lng }, { sort: sortParam }] = await Promise.all([params, searchParams]);
  const sortKey = (sortParam as TopicSortKey) || TopicSortKey.CREATED_AT;

  // Parallel fetch: translation and API client
  const [{ t }, api] = await Promise.all([
    getTranslation(lng),
    getDicechoServerApi(),
  ]);

  const initialData = await api.topic.list(
    {
      pageSize: 20,
      page: 1,
      sort: TOPIC_SORT_OPTIONS[sortKey].value,
    },
    { revalidate: 60 }
  ).catch(() => null);

  return (
    <>
      <MobileHeader left={<HeaderMenu />} right={<NotificationReminder />}>
        <HeaderSearch />
      </MobileHeader>

      <div className="container pb-24 md:pt-4">
        <ForumPageClient
          lng={lng}
          initialData={initialData}
          initialSort={sortKey}
        />
      </div>

      <MobileFooter />
    </>
  );
}
