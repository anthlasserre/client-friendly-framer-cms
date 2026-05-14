import { createFileRoute } from "@tanstack/react-router";
import { ItemForm } from "~/components/item-form";
import { getCollectionFn, getItemFn } from "~/server/server-fns/collections";
import { ItemFormSkeleton } from "~/components/skeletons";
import { ErrorScreen } from "~/components/error-screen";

export const Route = createFileRoute("/collections/$collectionId/items/$itemId")({
  loader: async ({ params }) => {
    const [collection, item] = await Promise.all([
      getCollectionFn({ data: { collectionId: params.collectionId } }),
      getItemFn({ data: { collectionId: params.collectionId, itemId: params.itemId } }),
    ]);
    return { collection, item };
  },
  pendingComponent: ItemFormSkeleton,
  pendingMs: 200,
  errorComponent: ({ error, reset }) => <ErrorScreen error={error} reset={reset} />,
  component: EditItemPage,
});

function EditItemPage() {
  const { collection, item } = Route.useLoaderData();
  return <ItemForm collection={collection} item={item} />;
}
