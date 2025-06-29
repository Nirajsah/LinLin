use crate::components::Hero;
use dioxus::prelude::*;

/// The Home page component that will be rendered when the current route is `[Route::Home]`
#[component]
pub fn Home() -> Element {
    rsx! {
        div { class: "text-green-600 font-bold", "Hello there this shouldn't be happening" }
    }
}
