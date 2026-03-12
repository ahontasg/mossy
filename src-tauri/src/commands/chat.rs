use tauri::ipc::Channel;
use tauri::{AppHandle, State};

use crate::models::chat::{ChatEvent, Message, PullEvent};
use crate::services::{llm, model_download, sidecar};
use crate::state::AppState;

#[tauri::command]
pub async fn check_llm_health(state: State<'_, AppState>) -> Result<bool, String> {
    Ok(llm::check_health(&state.http_client).await)
}

#[tauri::command]
pub async fn check_model_exists(app: AppHandle) -> Result<bool, String> {
    model_download::model_exists(&app)
}

#[tauri::command]
pub async fn download_model(
    app: AppHandle,
    state: State<'_, AppState>,
    on_event: Channel<PullEvent>,
) -> Result<(), String> {
    model_download::download(&state.http_client, &app, |event| {
        let _ = on_event.send(event);
    })
    .await
}

#[tauri::command]
pub async fn start_sidecar(
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<(), String> {
    // Prevent double-spawn: if sidecar already running, just wait for health
    let already_running = {
        let guard = state.sidecar.lock().map_err(|e| e.to_string())?;
        guard.is_some()
    };
    if already_running {
        sidecar::wait_for_health(&state.http_client).await?;
        return Ok(());
    }

    let model_path = model_download::model_path(&app)?;
    let model_path_str = model_path
        .to_str()
        .ok_or_else(|| "Invalid model path".to_string())?;

    let child = sidecar::start(&app, model_path_str)?;

    {
        let mut guard = state.sidecar.lock().map_err(|e| e.to_string())?;
        *guard = Some(child);
    }

    sidecar::wait_for_health(&state.http_client).await
}

#[tauri::command]
pub async fn stop_sidecar(state: State<'_, AppState>) -> Result<(), String> {
    let mut guard = state.sidecar.lock().map_err(|e| e.to_string())?;
    if let Some(child) = guard.take() {
        sidecar::stop(child);
    }
    Ok(())
}

#[tauri::command]
pub async fn chat_with_mossy(
    state: State<'_, AppState>,
    messages: Vec<Message>,
    system_prompt: String,
    on_event: Channel<ChatEvent>,
) -> Result<(), String> {
    llm::chat_stream(&state.http_client, messages, system_prompt, |event| {
        let _ = on_event.send(event);
    })
    .await;
    Ok(())
}
