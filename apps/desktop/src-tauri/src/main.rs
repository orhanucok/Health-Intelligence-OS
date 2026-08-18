#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod vault;

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // The journal lives beside the app's own data, not in the WebView
            // profile, so clearing browser storage cannot erase the record.
            let directory = app.path().app_data_dir()?;
            let journal = directory.join("vault").join("events.jsonl");
            app.manage(vault::VaultState::load(journal)?);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            vault::vault_status,
            vault::vault_append_event,
            vault::vault_list_events,
            vault::vault_lab_trend,
            vault::vault_prioritized_review,
        ])
        .run(tauri::generate_context!())
        .expect("failed to run HealthCouncil Desktop");
}
