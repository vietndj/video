import { createRoot } from "react-dom/client";
import "./index.css";
import { ContentProvider } from "./content";
import { ThemeProvider } from "./theme";
import { createElement } from "react";

const path = window.location.pathname.replace(/\/$/, "");

if (path === "/checkout") {
  import("./Checkout").then(({ default: Checkout }) => {
    createRoot(document.getElementById("root")!).render(<Checkout />);
  });
} else if (path === "/admin") {
  import("./Admin").then(({ default: Admin }) => {
    createRoot(document.getElementById("root")!).render(<Admin />);
  });
} else if (path === "/editor") {
  import("./Editor").then(({ default: Editor }) => {
    createRoot(document.getElementById("root")!).render(
      createElement(ThemeProvider, null, createElement(Editor))
    );
  });
} else {
  import("./App").then(({ default: App }) => {
    createRoot(document.getElementById("root")!).render(
      createElement(ThemeProvider, null,
        createElement(ContentProvider, null,
          createElement(App)
        )
      )
    );
  });
}
