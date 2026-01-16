import { getDicechoServerApi } from "@/server/dicecho";
import { CollectionList } from "@/components/Collection";
import { MobileFooter } from "@/components/Footer";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { CollectionEditDialog } from "@/components/Collection";
import { Plus } from "lucide-react";
import { getServerAuthSession } from "@/server/auth";

export default async function CollectionPage(props: {
  params: Promise<{ lng: string }>;
}) {
  const params = await props.params;
  const { lng } = params;

  // Parallel fetch: translation, API client, and session
  const [{ t }, api, session] = await Promise.all([
    getTranslation(lng),
    getDicechoServerApi(),
    getServerAuthSession(),
  ]);

  // Fetch initial recommended collections
  const initialData = await api.collection.list({
    filter: { isRecommend: true },
    pageSize: 12,
    sort: { createdAt: -1 },
  });

  return (
    <>
      <div className="container py-6">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {t("collection_list_title")}
                </CardTitle>
                <CardDescription>
                  {t("collection_list_description")}
                </CardDescription>
              </div>
              {session && (
                <CollectionEditDialog>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("create_collection")}
                  </Button>
                </CollectionEditDialog>
              )}
            </div>
          </CardHeader>
        </Card>

        <CollectionList initialData={initialData} />
      </div>
      <MobileFooter />
    </>
  );
}
