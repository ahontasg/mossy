import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "../../../test/mocks/tauri";
import { LlmSetup } from "../components/LlmSetup";
import { useChatStore } from "../../../stores/chatStore";

describe("LlmSetup", () => {
  beforeEach(() => {
    useChatStore.getState().reset();
  });

  it("renders nothing when status is ready", () => {
    useChatStore.setState({ llmStatus: "ready" });
    const { container } = render(<LlmSetup />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when status is unknown", () => {
    useChatStore.setState({ llmStatus: "unknown" });
    const { container } = render(<LlmSetup />);
    expect(container.firstChild).toBeNull();
  });

  it("shows checking state", () => {
    useChatStore.setState({ llmStatus: "checking" });
    render(<LlmSetup />);
    expect(screen.getByText(/checking for brain/)).toBeInTheDocument();
  });

  it("shows no_model state with download button", () => {
    useChatStore.setState({ llmStatus: "no_model" });
    render(<LlmSetup />);
    expect(screen.getByText("Mossy needs a brain!")).toBeInTheDocument();
    expect(screen.getByText("Download model")).toBeInTheDocument();
  });

  it("shows downloading state with progress", () => {
    useChatStore.setState({ llmStatus: "downloading", pullProgress: 45 });
    render(<LlmSetup />);
    expect(screen.getByText("Downloading Mossy's brain...")).toBeInTheDocument();
    expect(screen.getByText("45%")).toBeInTheDocument();
  });

  it("shows starting state", () => {
    useChatStore.setState({ llmStatus: "starting" });
    render(<LlmSetup />);
    expect(screen.getByText(/waking up/)).toBeInTheDocument();
  });
});
