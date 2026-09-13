import React, { useEffect, useRef } from "react";
import clsx from "clsx";

import { translate } from "@docusaurus/Translate";
import { ThemeClassNames } from "@docusaurus/theme-common";
import { useHideableNavbar, useNavbarMobileSidebar } from "@docusaurus/theme-common/internal";
import { useThemeConfig } from "@docusaurus/theme-common";

import NavbarMobileSidebar from "@theme/Navbar/MobileSidebar";

import styles from "./styles.module.css";

function NavbarBackdrop({ onClick }) {
  return <div role="presentation" className="navbar-sidebar__backdrop" onClick={onClick} />;
}

function NavbarEscapeHandler() {
  const { shown, toggle } = useNavbarMobileSidebar();
  const wasShown = useRef(false);

  useEffect(() => {
    if (!shown) {
      if (wasShown.current) {
        document.querySelector(".navbar__toggle")?.focus();
      }
      wasShown.current = false;
      return undefined;
    }

    wasShown.current = true;
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      toggle();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [shown, toggle]);

  return null;
}

export default function NavbarLayout({ children }) {
  const {
    navbar: { hideOnScroll, style },
  } = useThemeConfig();
  const mobileSidebar = useNavbarMobileSidebar();
  const { navbarRef, isNavbarVisible } = useHideableNavbar(hideOnScroll);

  return (
    <nav
      ref={navbarRef}
      aria-label={translate({
        id: "theme.NavBar.navAriaLabel",
        message: "Main",
        description: "The ARIA label for the main navigation",
      })}
      className={clsx(
        ThemeClassNames.layout.navbar.container,
        "navbar",
        "navbar--fixed-top",
        hideOnScroll && [styles.navbarHideable, !isNavbarVisible && styles.navbarHidden],
        {
          "navbar--dark": style === "dark",
          "navbar--primary": style === "primary",
          "navbar-sidebar--show": mobileSidebar.shown,
        },
      )}
    >
      {children}
      <NavbarEscapeHandler />
      <NavbarBackdrop onClick={mobileSidebar.toggle} />
      <NavbarMobileSidebar />
    </nav>
  );
}
