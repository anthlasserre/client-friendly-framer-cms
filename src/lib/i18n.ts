export type Locale = "en" | "fr";

export const LOCALES: ReadonlyArray<Locale> = ["en", "fr"];

export function isLocale(value: string): value is Locale {
  return (LOCALES as ReadonlyArray<string>).includes(value);
}

const en = {
  "app.title": "{app}",

  "auth.signInTitle": "Sign in",
  "auth.signInDescription": "Access your {app} workspace.",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.signIn": "Sign in",
  "auth.signingIn": "Signing in…",
  "auth.welcomeBack": "Welcome back",
  "auth.loginFailed": "Login failed",
  "auth.invalidCredentials": "Invalid email or password",
  "auth.logout": "Logout",

  "sidebar.collections": "Collections",
  "sidebar.noCollections": "No collections.",
  "sidebar.viewSite": "View site",

  "collections.empty.title": "Select a collection",
  "collections.empty.description":
    "Pick a collection from the sidebar to view and edit its items.",
  "collections.itemCount.one": "{count} item",
  "collections.itemCount.other": "{count} items",
  "collections.newItem": "New item",
  "collections.deleteConfirm": 'Delete "{slug}"? This cannot be undone.',
  "collections.itemDeleted": "Item deleted",
  "collections.deleteFailed": "Delete failed",
  "collections.column.slug": "Slug",
  "collections.column.draft": "Draft",
  "collections.draft.yes": "Yes",
  "collections.draft.no": "No",
  "collections.emptyState": 'No items yet. Click "New item" to create one.',
  "collections.deleteAria": "Delete {slug}",
  "collections.draftBadge": "Draft",
  "pagination.previous": "Previous",
  "pagination.next": "Next",
  "pagination.pageOf": "Page {page} of {total}",

  "item.back": "Back",
  "item.editTitle": 'Edit "{slug}"',
  "item.newTitle": "New item",
  "item.slug": "Slug",
  "item.slugRequired": "Slug is required",
  "item.draft": "Draft (not published)",
  "item.save": "Save changes",
  "item.create": "Create item",
  "item.cancel": "Cancel",
  "item.saving": "Saving…",
  "item.updated": "Item updated",
  "item.created": "Item created",
  "item.saveFailed": "Save failed",
  "item.unsupported": "Unsupported field type:",

  "image.noImage": "No image",
  "image.upload": "Upload",
  "image.replace": "Replace",
  "image.remove": "Remove",
  "image.uploading": "Uploading…",
  "image.uploaded": "Image uploaded",
  "image.uploadFailed": "Upload failed",

  "date.pick": "Pick a date",

  "richtext.paragraph": "Paragraph",
  "richtext.heading1": "Heading 1",
  "richtext.heading2": "Heading 2",
  "richtext.heading3": "Heading 3",
  "richtext.bold": "Bold",
  "richtext.italic": "Italic",
  "richtext.link": "Link",
  "richtext.linkPrompt": "Enter URL (leave empty to remove)",
  "richtext.quote": "Quote",
  "richtext.code": "Code",
  "richtext.bulletList": "Bulleted list",
  "richtext.orderedList": "Numbered list",
  "richtext.undo": "Undo",
  "richtext.redo": "Redo",

  "notFound.title": "Page not found",
  "notFound.description": "The page you're looking for doesn't exist.",

  "error.title": "Something went wrong",
  "error.description": "An unexpected error occurred. You can retry, or go back to the start.",
  "error.retry": "Try again",
  "error.goHome": "Back to start",
  "error.details": "Error details",
} as const;

export type TranslationKey = keyof typeof en;

const fr: Record<TranslationKey, string> = {
  "app.title": "{app}",

  "auth.signInTitle": "Connexion",
  "auth.signInDescription": "Accédez à votre espace {app}.",
  "auth.email": "Email",
  "auth.password": "Mot de passe",
  "auth.signIn": "Se connecter",
  "auth.signingIn": "Connexion…",
  "auth.welcomeBack": "Bon retour",
  "auth.loginFailed": "Échec de la connexion",
  "auth.invalidCredentials": "Email ou mot de passe invalide",
  "auth.logout": "Déconnexion",

  "sidebar.collections": "Collections",
  "sidebar.noCollections": "Aucune collection.",
  "sidebar.viewSite": "Voir le site",

  "collections.empty.title": "Sélectionnez une collection",
  "collections.empty.description":
    "Choisissez une collection dans la barre latérale pour voir et modifier ses éléments.",
  "collections.itemCount.one": "{count} élément",
  "collections.itemCount.other": "{count} éléments",
  "collections.newItem": "Nouvel élément",
  "collections.deleteConfirm":
    "Supprimer « {slug} » ? Cette action est irréversible.",
  "collections.itemDeleted": "Élément supprimé",
  "collections.deleteFailed": "Échec de la suppression",
  "collections.column.slug": "Slug",
  "collections.column.draft": "Brouillon",
  "collections.draft.yes": "Oui",
  "collections.draft.no": "Non",
  "collections.emptyState":
    "Aucun élément pour le moment. Cliquez sur « Nouvel élément » pour en créer un.",
  "collections.deleteAria": "Supprimer {slug}",
  "collections.draftBadge": "Brouillon",
  "pagination.previous": "Précédent",
  "pagination.next": "Suivant",
  "pagination.pageOf": "Page {page} sur {total}",

  "item.back": "Retour",
  "item.editTitle": "Modifier « {slug} »",
  "item.newTitle": "Nouvel élément",
  "item.slug": "Slug",
  "item.slugRequired": "Le slug est requis",
  "item.draft": "Brouillon (non publié)",
  "item.save": "Enregistrer",
  "item.create": "Créer l'élément",
  "item.cancel": "Annuler",
  "item.saving": "Enregistrement…",
  "item.updated": "Élément mis à jour",
  "item.created": "Élément créé",
  "item.saveFailed": "Échec de l'enregistrement",
  "item.unsupported": "Type de champ non supporté :",

  "image.noImage": "Aucune image",
  "image.upload": "Téléverser",
  "image.replace": "Remplacer",
  "image.remove": "Retirer",
  "image.uploading": "Téléversement…",
  "image.uploaded": "Image téléversée",
  "image.uploadFailed": "Échec du téléversement",

  "date.pick": "Choisir une date",

  "richtext.paragraph": "Paragraphe",
  "richtext.heading1": "Titre 1",
  "richtext.heading2": "Titre 2",
  "richtext.heading3": "Titre 3",
  "richtext.bold": "Gras",
  "richtext.italic": "Italique",
  "richtext.link": "Lien",
  "richtext.linkPrompt": "Entrez l'URL (laissez vide pour retirer)",
  "richtext.quote": "Citation",
  "richtext.code": "Code",
  "richtext.bulletList": "Liste à puces",
  "richtext.orderedList": "Liste numérotée",
  "richtext.undo": "Annuler",
  "richtext.redo": "Rétablir",

  "notFound.title": "Page introuvable",
  "notFound.description": "La page que vous cherchez n'existe pas.",

  "error.title": "Une erreur est survenue",
  "error.description":
    "Une erreur inattendue s'est produite. Vous pouvez réessayer ou revenir à l'accueil.",
  "error.retry": "Réessayer",
  "error.goHome": "Retour à l'accueil",
  "error.details": "Détails de l'erreur",
};

export const dictionaries: Record<Locale, Record<TranslationKey, string>> = {
  en,
  fr,
};

export function translate(
  locale: Locale,
  key: TranslationKey,
  params?: Record<string, string | number>,
): string {
  const raw = dictionaries[locale][key] ?? dictionaries.en[key] ?? key;
  if (!params) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, k: string) =>
    k in params ? String(params[k]) : `{${k}}`,
  );
}
