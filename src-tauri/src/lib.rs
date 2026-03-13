use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::TrayIconBuilder,
    Emitter, Manager,
};

#[cfg(target_os = "macos")]
use tauri_plugin_positioner::{Position, WindowExt};

mod commands;
mod models;
mod services;
mod state;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .manage(state::AppState {
            http_client: reqwest::Client::new(),
            sidecar: std::sync::Mutex::new(None),
        })
        .plugin(tauri_plugin_positioner::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let show_item = MenuItem::with_id(app, "show", "Show/Hide Mossy", true, None::<&str>)?;
            let separator = PredefinedMenuItem::separator(app)?;
            let settings_item =
                MenuItem::with_id(app, "settings", "Settings", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(
                app,
                &[
                    &show_item,
                    &separator,
                    &settings_item,
                    &quit_item,
                ],
            )?;

            let icon = app.default_window_icon().cloned().unwrap_or_else(|| {
                tauri::image::Image::from_bytes(include_bytes!("../icons/32x32.png"))
                    .expect("failed to load tray icon")
            });

            TrayIconBuilder::new()
                .icon(icon)
                .icon_as_template(true)
                .menu(&menu)
                .on_menu_event(|app, event| {
                    let id = event.id.as_ref();
                    match id {
                        "show" => {
                            if let Some(window) = app.get_webview_window("main") {
                                if window.is_visible().unwrap_or(false) {
                                    let _ = window.hide();
                                } else {
                                    #[cfg(target_os = "macos")]
                                    {
                                        let _ = window.move_window(Position::TrayCenter);
                                    }
                                    let _ = window.show();
                                    let _ = window.set_focus();
                                }
                            }
                        }
                        "settings" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                                let _ = app.emit("show-settings", ());
                            }
                        }
                        "quit" => {
                            app.exit(0);
                        }
                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    #[cfg(target_os = "macos")]
                    tauri_plugin_positioner::on_tray_event(tray.app_handle(), &event);

                    let _ = (tray, event); // suppress unused warnings
                })
                .build(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::chat::check_llm_health,
            commands::chat::check_model_exists,
            commands::chat::download_model,
            commands::chat::start_sidecar,
            commands::chat::stop_sidecar,
            commands::chat::chat_with_mossy,
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|app_handle, event| {
        if let tauri::RunEvent::Exit = event {
            // Kill sidecar if running
            if let Some(state) = app_handle.try_state::<state::AppState>() {
                if let Ok(mut guard) = state.sidecar.lock() {
                    if let Some(child) = guard.take() {
                        services::sidecar::stop(child);
                    }
                }
            }
        }
    });
}
