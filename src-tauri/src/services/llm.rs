use futures::StreamExt;
use reqwest::Client;

use crate::models::chat::{ChatEvent, Message};
use crate::models::llm::{ChatChunk, ChatRequest};

const LLAMA_BASE: &str = "http://127.0.0.1:8384";

pub async fn check_health(client: &Client) -> bool {
    client
        .get(format!("{LLAMA_BASE}/health"))
        .send()
        .await
        .map(|r| r.status().is_success())
        .unwrap_or(false)
}

pub async fn chat_stream<F>(
    client: &Client,
    messages: Vec<Message>,
    system_prompt: String,
    on_event: F,
) where
    F: Fn(ChatEvent),
{
    let mut all_messages = vec![Message {
        role: "system".to_string(),
        content: system_prompt,
    }];
    all_messages.extend(messages);

    let url = format!("{LLAMA_BASE}/v1/chat/completions");
    let body = ChatRequest {
        model: "qwen3.5-0.8b".to_string(),
        messages: all_messages,
        stream: true,
        max_tokens: Some(150),
        temperature: Some(0.7),
        top_p: Some(0.8),
        frequency_penalty: Some(0.6),
        presence_penalty: Some(0.4),
    };

    let resp = match client.post(&url).json(&body).send().await {
        Ok(r) => r,
        Err(e) => {
            on_event(ChatEvent::Error {
                message: e.to_string(),
            });
            return;
        }
    };

    if !resp.status().is_success() {
        on_event(ChatEvent::Error {
            message: format!("LLM server returned status {}", resp.status()),
        });
        return;
    }

    let mut stream = resp.bytes_stream();
    let mut buffer = Vec::new();

    while let Some(chunk) = stream.next().await {
        let bytes = match chunk {
            Ok(b) => b,
            Err(e) => {
                on_event(ChatEvent::Error {
                    message: e.to_string(),
                });
                return;
            }
        };

        buffer.extend_from_slice(&bytes);

        // SSE format: lines separated by \n, each starting with "data: "
        while let Some(newline_pos) = buffer.iter().position(|&b| b == b'\n') {
            let line_bytes: Vec<u8> = buffer.drain(..=newline_pos).collect();
            let line = String::from_utf8_lossy(&line_bytes);
            let line = line.trim();

            if line.is_empty() {
                continue;
            }

            // Strip "data: " prefix
            let data = if let Some(stripped) = line.strip_prefix("data: ") {
                stripped
            } else if let Some(stripped) = line.strip_prefix("data:") {
                stripped.trim_start()
            } else {
                continue;
            };

            // Handle [DONE] sentinel
            if data == "[DONE]" {
                on_event(ChatEvent::Done);
                return;
            }

            let chunk = match serde_json::from_str::<ChatChunk>(data) {
                Ok(c) => c,
                Err(_) => continue,
            };
            let Some(choice) = chunk.choices.as_ref().and_then(|c| c.first()) else {
                continue;
            };
            if let Some(content) = choice.delta.as_ref().and_then(|d| d.content.as_deref()) {
                if !content.is_empty() {
                    on_event(ChatEvent::Delta {
                        text: content.to_string(),
                    });
                }
            }
            if choice.finish_reason.is_some() {
                on_event(ChatEvent::Done);
                return;
            }
        }
    }

    on_event(ChatEvent::Done);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sse_line_parsing() {
        // Simulate parsing a single SSE data line
        let line = "data: {\"choices\":[{\"delta\":{\"content\":\"hello\"},\"finish_reason\":null}]}";
        let data = line.strip_prefix("data: ").unwrap();
        let chunk: ChatChunk = serde_json::from_str(data).unwrap();
        let choice = &chunk.choices.as_ref().unwrap()[0];
        assert_eq!(
            choice.delta.as_ref().unwrap().content.as_deref(),
            Some("hello")
        );
    }

    #[test]
    fn test_sse_done_sentinel() {
        let line = "data: [DONE]";
        let data = line.strip_prefix("data: ").unwrap();
        assert_eq!(data, "[DONE]");
    }

    #[test]
    fn test_sse_finish_reason_stop() {
        let line = r#"data: {"choices":[{"delta":{},"finish_reason":"stop"}]}"#;
        let data = line.strip_prefix("data: ").unwrap();
        let chunk: ChatChunk = serde_json::from_str(data).unwrap();
        let choice = &chunk.choices.as_ref().unwrap()[0];
        assert_eq!(choice.finish_reason.as_deref(), Some("stop"));
    }
}
