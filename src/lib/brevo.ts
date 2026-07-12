export async function subscribeToReadingRoom(email: string, name: string): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  const listId = Number(process.env.BREVO_LIST_ID || 0);
  if (!apiKey || !listId) return false;

  const [firstName, ...rest] = name.trim().split(/\s+/);
  const response = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": apiKey },
    body: JSON.stringify({
      email,
      attributes: { FIRSTNAME: firstName || "", LASTNAME: rest.join(" ") },
      listIds: [listId],
      updateEnabled: true,
    }),
  });

  if (!response.ok) throw new Error(`Brevo returned ${response.status}`);
  return true;
}
