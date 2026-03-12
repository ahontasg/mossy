import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "../../../test/mocks/tauri";
import { ChatPanel } from "../ChatPanel";
import { useChatStore } from "../../../stores/chatStore";

describe("ChatPanel", () => {
  beforeEach(() => {
    useChatStore.getState().reset();
  });

  it("shows setup overlay when LLM is not ready", () => {
    useChatStore.setState({ llmStatus: "no_model" });
    render(<ChatPanel />);
    expect(screen.getByText("Mossy needs a brain!")).toBeInTheDocument();
  });

  it("shows chat UI when LLM is ready", () => {
    useChatStore.setState({ llmStatus: "ready" });
    render(<ChatPanel />);
    expect(screen.getByPlaceholderText("Talk to Mossy...")).toBeInTheDocument();
  });

  it("shows quick replies when no messages exist", () => {
    useChatStore.setState({ llmStatus: "ready", messages: [] });
    render(<ChatPanel />);
    expect(screen.getByText("How are you?")).toBeInTheDocument();
    expect(screen.getByText("Fun fact!")).toBeInTheDocument();
  });

  it("hides quick replies when messages exist", () => {
    useChatStore.setState({
      llmStatus: "ready",
      messages: [
        { id: "1", role: "user", content: "hi", timestamp: Date.now() },
      ],
    });
    render(<ChatPanel />);
    expect(screen.queryByText("How are you?")).not.toBeInTheDocument();
  });

  it("shows streaming indicator during streaming", () => {
    useChatStore.setState({
      llmStatus: "ready",
      isStreaming: true,
      streamingText: "Hello from",
    });
    render(<ChatPanel />);
    expect(screen.getByText(/Hello from/)).toBeInTheDocument();
  });

  it("disables input during streaming", () => {
    useChatStore.setState({ llmStatus: "ready", isStreaming: true });
    render(<ChatPanel />);
    const input = screen.getByPlaceholderText("Mossy is thinking...");
    expect(input).toBeDisabled();
  });

  it("renders message bubbles", () => {
    useChatStore.setState({
      llmStatus: "ready",
      messages: [
        { id: "1", role: "user", content: "Hello", timestamp: Date.now() },
        { id: "2", role: "assistant", content: "*waves*", timestamp: Date.now() },
      ],
    });
    render(<ChatPanel />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("*waves*")).toBeInTheDocument();
  });
});
