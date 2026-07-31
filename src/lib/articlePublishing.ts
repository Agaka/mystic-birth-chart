const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const ISO_WITH_ZONE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/;

export function resolvePublishInstant(date: string, publishAt?: string): number {
  const value = publishAt?.trim();

  if (value) {
    if (!ISO_WITH_ZONE.test(value)) return Number.NaN;
    return Date.parse(value);
  }

  if (!DATE_ONLY.test(date)) return Number.NaN;
  return Date.parse(`${date}T00:00:00.000Z`);
}

export function isArticlePublished(
  date: string,
  publishAt: string | undefined,
  now = new Date(),
): boolean {
  const publishInstant = resolvePublishInstant(date, publishAt);
  return Number.isFinite(publishInstant) && publishInstant <= now.getTime();
}
