use serde::{Deserialize, Serialize};

use super::chat::Message;

#[derive(Debug, Serialize)]
pub struct ChatRequest {
    pub model: String,
    pub messages: Vec<Message>,
    pub stream: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_tokens: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub top_p: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub frequency_penalty: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub presence_penalty: Option<f64>,
}

#[derive(Debug, Deserialize)]
pub struct ChatChunk {
    pub choices: Option<Vec<ChunkChoice>>,
}

#[derive(Debug, Deserialize)]
pub struct ChunkChoice {
    pub delta: Option<ChunkDelta>,
    pub finish_reason: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ChunkDelta {
    pub content: Option<String>,
    /// Qwen3.5 reasoning output — ignored (we disable thinking via --reasoning-budget 0)
    #[allow(dead_code)]
    pub reasoning_content: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::chat::Message;

    #[test]
    fn test_chat_request_serialization() {
        let req = ChatRequest {
            model: "qwen3.5-0.8b".to_string(),
            messages: vec![Message {
                role: "user".to_string(),
                content: "hello".to_string(),
            }],
            stream: true,
            max_tokens: Some(150),
            temperature: Some(0.7),
            top_p: Some(0.8),
            frequency_penalty: Some(0.6),
            presence_penalty: Some(0.4),
        };
        let json = serde_json::to_value(&req).unwrap();
        assert_eq!(json["model"], "qwen3.5-0.8b");
        assert_eq!(json["stream"], true);
        assert_eq!(json["max_tokens"], 150);
        assert_eq!(json["temperature"], 0.7);
        assert_eq!(json["top_p"], 0.8);
        assert_eq!(json["frequency_penalty"], 0.6);
        assert_eq!(json["presence_penalty"], 0.4);
    }

    #[test]
    fn test_chat_chunk_parsing() {
        let json = r#"{"choices":[{"delta":{"content":"hi"},"finish_reason":null}]}"#;
        let chunk: ChatChunk = serde_json::from_str(json).unwrap();
        let choice = &chunk.choices.as_ref().unwrap()[0];
        assert_eq!(
            choice.delta.as_ref().unwrap().content.as_deref(),
            Some("hi")
        );
        assert!(choice.finish_reason.is_none());
    }

    #[test]
    fn test_chat_chunk_done() {
        let json = r#"{"choices":[{"delta":{},"finish_reason":"stop"}]}"#;
        let chunk: ChatChunk = serde_json::from_str(json).unwrap();
        let choice = &chunk.choices.as_ref().unwrap()[0];
        assert_eq!(choice.finish_reason.as_deref(), Some("stop"));
    }
}
