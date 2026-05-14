import { createFileRoute } from "@tanstack/react-router";
import { ItemForm } from "~/components/item-form";
import { getCollectionFn } from "~/server/server-fns/collections";
import { ItemFormSkeleton } from "~/components/skeletons";
import { ErrorScreen } from "~/components/error-screen";

export const Route = createFileRoute("/collections/$collectionId/items/new")({
  loader: async ({ params }) =>
    getCollectionFn({ data: { collectionId: params.collectionId } }),
  pendingComponent: ItemFormSkeleton,
  pendingMs: 200,
  errorComponent: ({ error, reset }) => <ErrorScreen error={error} reset={reset} />,
  component: NewItemPage,
});

function NewItemPage() {
  const collection = Route.useLoaderData();
  return <ItemForm collection={collection} />;
}
