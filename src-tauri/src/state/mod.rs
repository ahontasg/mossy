use tauri_plugin_shell::process::CommandChild;

pub struct AppState {
    pub http_client: reqwest::Client,
    pub sidecar: std::sync::Mutex<Option<CommandChild>>,
}
