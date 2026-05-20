import { Form, Action, ActionPanel, showToast, Toast } from "@raycast/api";
import { addFeed } from "./api/freshrss";
import { FreshRSSAuthError, FreshRSSApiError } from "./api/freshrss";

export default function AddFeedCommand() {
  async function handleSubmit(values: { feedUrl: string }) {
    const url = values.feedUrl.trim();

    if (!url) {
      await showToast({ style: Toast.Style.Failure, title: "Validation Error", message: "Feed URL cannot be empty" });
      return;
    }

    try {
      new URL(url);
    } catch {
      await showToast({ style: Toast.Style.Failure, title: "Validation Error", message: "Please enter a valid URL (e.g. https://example.com/feed.xml)" });
      return;
    }

    try {
      await addFeed(url);
      await showToast({ style: Toast.Style.Success, title: "Feed Added", message: url });
    } catch (error: unknown) {
      let message: string;
      if (error instanceof FreshRSSAuthError) {
        message = error.message;
      } else if (error instanceof FreshRSSApiError) {
        message = error.message;
      } else {
        message = "Failed to add feed. It may already exist or the URL may not be a valid RSS/Atom feed.";
      }
      await showToast({ style: Toast.Style.Failure, title: "Error", message });
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Add Feed" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="feedUrl" title="Feed URL" placeholder="https://example.com/feed.xml" info="Enter the RSS or Atom feed URL to subscribe to" />
    </Form>
  );
}