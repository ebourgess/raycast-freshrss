import { useState, useEffect } from "react";
import { Action, ActionPanel, Form, Icon, getPreferenceValues, showToast, Toast, openCommandPreferences, useNavigation } from "@raycast/api";
import { saveToGoodlinks, getTags, hasGoodlinksToken, GoodLinksError } from "../api/goodlinks";

interface SaveToGoodlinksFormProps {
  url: string;
  title?: string;
  summary?: string;
  onMarkRead?: () => Promise<void>;
  onClose?: () => void;
}

export default function SaveToGoodlinksForm({ url, title, summary, onMarkRead }: SaveToGoodlinksFormProps) {
  const { pop } = useNavigation();
  const [tagText, setTagText] = useState("");
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!hasGoodlinksToken()) {
      setIsLoading(false);
      return;
    }
    getTags()
      .then((tags) => {
        setExistingTags(tags);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSubmit(values: { tagText: string }) {
    if (!hasGoodlinksToken()) {
      await openCommandPreferences();
      return;
    }

    const tags = values.tagText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      await saveToGoodlinks({
        url,
        title,
        summary,
        tags: tags.length > 0 ? tags : undefined,
      });

      const prefs = getPreferenceValues<Preferences>();
      if (prefs.markReadOnGoodlinks && onMarkRead) {
        try {
          await onMarkRead();
        } catch {
          await showToast({ style: Toast.Style.Failure, title: "Error", message: "Saved to GoodLinks but failed to mark as read" });
          return;
        }
      }

      await showToast({ style: Toast.Style.Success, title: "Saved to GoodLinks" });
      pop();
    } catch (error: unknown) {
      const message = error instanceof GoodLinksError ? error.message : "Failed to save to GoodLinks";
      await showToast({ style: Toast.Style.Failure, title: "Error", message });
    }
  }

  const tagInfo = existingTags.length > 0 ? `Existing tags: ${existingTags.join(", ")}` : "";

  return (
    <Form
      isLoading={isLoading}
      navigationTitle="Save to GoodLinks"
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save to GoodLinks" icon={Icon.Link} onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Description title="URL" text={url} />
      {title ? <Form.Description title="Title" text={title} /> : null}
      <Form.TextField
        id="tagText"
        title="Tags"
        placeholder="tag1, tag2, tag3"
        info={tagInfo}
        value={tagText}
        onChange={setTagText}
      />
    </Form>
  );
}
