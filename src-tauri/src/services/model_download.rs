use futures::StreamExt;
use reqwest::Client;
use std::path::PathBuf;
use tauri::Manager;

use crate::models::chat::PullEvent;

const MODEL_URL: &str = "https://huggingface.co/unsloth/Qwen3.5-0.8B-GGUF/resolve/main/Qwen3.5-0.8B-Q4_K_M.gguf";
pub const MODEL_FILENAME: &str = "Qwen3.5-0.8B-Q4_K_M.gguf";

pub fn models_dir(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    let data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Could not resolve app data directory: {e}"))?;
    Ok(data_dir.join("models"))
}

pub fn model_path(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    Ok(models_dir(app_handle)?.join(MODEL_FILENAME))
}

pub fn model_exists(app_handle: &tauri::AppHandle) -> Result<bool, String> {
    let path = model_path(app_handle)?;
    Ok(path.exists())
}

pub async fn download<F>(
    client: &Client,
    app_handle: &tauri::AppHandle,
    on_event: F,
) -> Result<(), String>
where
    F: Fn(PullEvent),
{
    let dir = models_dir(app_handle)?;
    std::fs::create_dir_all(&dir)
        .map_err(|e| format!("Failed to create models directory: {e}"))?;

    let dest = dir.join(MODEL_FILENAME);

    // If already exists with non-zero size, skip
    if dest.exists() && dest.metadata().map(|m| m.len() > 0).unwrap_or(false) {
        on_event(PullEvent::Progress {
            status: "already downloaded".to_string(),
            percent: 100.0,
        });
        on_event(PullEvent::Done);
        return Ok(());
    }

    let resp = client
        .get(MODEL_URL)
        .header("User-Agent", "mossy/0.1.0")
        .send()
        .await
        .map_err(|e| format!("Download request failed: {e}"))?;

    if !resp.status().is_success() {
        let msg = format!("Download failed with status {}", resp.status());
        on_event(PullEvent::Error {
            message: msg.clone(),
        });
        return Err(msg);
    }

    let total_size = resp.content_length().unwrap_or(0);
    let mut stream = resp.bytes_stream();
    let mut downloaded: u64 = 0;
    let mut last_reported_percent: f64 = -1.0;

    // Write to a temp file first, rename on completion
    let tmp_dest = dir.join(format!("{MODEL_FILENAME}.tmp"));
    let mut file = std::fs::File::create(&tmp_dest)
        .map_err(|e| format!("Failed to create temp file: {e}"))?;

    use std::io::Write;
    while let Some(chunk) = stream.next().await {
        let bytes = match chunk {
            Ok(b) => b,
            Err(e) => {
                on_event(PullEvent::Error {
                    message: e.to_string(),
                });
                let _ = std::fs::remove_file(&tmp_dest);
                return Err(e.to_string());
            }
        };

        file.write_all(&bytes)
            .map_err(|e| format!("Failed to write to file: {e}"))?;

        downloaded += bytes.len() as u64;
        let percent = if total_size > 0 {
            (downloaded as f64 / total_size as f64) * 100.0
        } else {
            0.0
        };

        // Throttle: only emit when percent changes by ≥0.5
        if percent - last_reported_percent >= 0.5 {
            last_reported_percent = percent;
            on_event(PullEvent::Progress {
                status: "downloading".to_string(),
                percent,
            });
        }
    }

    drop(file);
    std::fs::rename(&tmp_dest, &dest)
        .map_err(|e| format!("Failed to finalize download: {e}"))?;

    on_event(PullEvent::Done);
    Ok(())
}
