use reqwest::Client;
use std::time::Duration;
use tauri::AppHandle;
use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;

const LLAMA_PORT: u16 = 8384;
const HEALTH_POLL_INTERVAL: Duration = Duration::from_millis(500);
const HEALTH_TIMEOUT: Duration = Duration::from_secs(30);

pub fn start(
    app_handle: &AppHandle,
    model_path: &str,
) -> Result<CommandChild, String> {
    let (mut rx, child) = app_handle
        .shell()
        .sidecar("llama-server")
        .map_err(|e| format!("Failed to create sidecar command: {e}"))?
        .args([
            "--port",
            &LLAMA_PORT.to_string(),
            "--model",
            model_path,
            "--ctx-size",
            "1024",
            "--n-predict",
            "150",
            "--host",
            "127.0.0.1",
            "--reasoning-budget",
            "0",
        ])
        .spawn()
        .map_err(|e| format!("Failed to spawn llama-server: {e}"))?;

    // Consume stdout/stderr in background to prevent pipe buffer blocking
    tauri::async_runtime::spawn(async move {
        use tauri_plugin_shell::process::CommandEvent;
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stderr(line) => {
                    eprintln!("[llama-server] {}", String::from_utf8_lossy(&line));
                }
                CommandEvent::Stdout(line) => {
                    eprintln!("[llama-server] {}", String::from_utf8_lossy(&line));
                }
                CommandEvent::Terminated(_) => break,
                CommandEvent::Error(e) => {
                    eprintln!("[llama-server] error: {e}");
                    break;
                }
                _ => {}
            }
        }
    });

    Ok(child)
}

pub async fn wait_for_health(client: &Client) -> Result<(), String> {
    let url = format!("http://127.0.0.1:{LLAMA_PORT}/health");
    let start = std::time::Instant::now();

    loop {
        if start.elapsed() > HEALTH_TIMEOUT {
            return Err("llama-server health check timed out after 30s".to_string());
        }

        match client.get(&url).send().await {
            Ok(resp) if resp.status().is_success() => return Ok(()),
            _ => {}
        }

        tokio::time::sleep(HEALTH_POLL_INTERVAL).await;
    }
}

pub fn stop(child: CommandChild) {
    let _ = child.kill();
}
