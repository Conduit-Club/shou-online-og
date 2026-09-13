import React, { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";

import { ErrorCauseBoundary, ThemeClassNames, useThemeConfig } from "@docusaurus/theme-common";
import { splitNavbarItems, useNavbarMobileSidebar } from "@docusaurus/theme-common/internal";

import NavbarColorModeToggle from "@theme/Navbar/ColorModeToggle";
import NavbarItem from "@theme/NavbarItem";
import NavbarLogo from "@theme/Navbar/Logo";
import NavbarMobileSidebarToggle from "@theme/Navbar/MobileSidebar/Toggle";
import SearchBar from "@theme/SearchBar";

function useNavbarItems() {
  return useThemeConfig().navbar.items;
}

function NavbarItems({ items }) {
  return (
    <>
      {items.map((item, index) => (
        <ErrorCauseBoundary
          key={index}
          onError={(error) =>
            new Error(
              `A theme navbar item failed to render.\nPlease double-check the following navbar item (themeConfig.navbar.items) of your Docusaurus config:\n${JSON.stringify(item, null, 2)}`,
              { cause: error },
            )
          }
        >
          <NavbarItem {...item} />
        </ErrorCauseBoundary>
      ))}
    </>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16">
      <path
        fill="currentColor"
        d="M6.03 1.86a4.17 4.17 0 1 1 0 8.35 4.17 4.17 0 0 1 0-8.35Zm0 1.25a2.92 2.92 0 1 0 0 5.84 2.92 2.92 0 0 0 0-5.84Zm3.57 5.54 4.82 4.82a.9.9 0 0 1-1.3 1.3L8.3 9.95l1.3-1.3Z"
      />
    </svg>
  );
}

function NavbarSearchControl() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const searchButtonRef = useRef(null);

  const closeSearch = useCallback((restoreFocus = false) => {
    setOpen(false);

    if (restoreFocus) {
      window.requestAnimationFrame(() => {
        searchButtonRef.current?.focus();
      });
    }
  }, []);

  const focusSearchInput = useCallback(() => {
    setOpen(true);
    window.requestAnimationFrame(() => {
      containerRef.current?.querySelector(".navbar__search-input")?.focus();
    });
  }, []);

  const handleSearchBarToggle = useCallback(
    (nextOpen) => {
      if (nextOpen) {
        setOpen(true);
        return;
      }

      // SearchBar reports input blur before focus has moved to the next
      // element. Wait a frame so controls inside this wrapper stay usable.
      window.requestAnimationFrame(() => {
        if (!containerRef.current?.contains(document.activeElement)) {
          closeSearch();
        }
      });
    },
    [closeSearch],
  );

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      closeSearch(true);
    };

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        const searchInput = containerRef.current?.querySelector(".navbar__search-input");
        if (searchInput === document.activeElement) {
          searchInput.blur();
        }
        closeSearch();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [closeSearch, open]);

  return (
    <div
      className={clsx("shou-navbar-search-control", {
        "shou-navbar-search-control--open": open,
      })}
      ref={containerRef}
    >
      <button
        ref={searchButtonRef}
        type="button"
        className="clean-btn shou-navbar-search-button"
        aria-controls="shou-navbar-search-field"
        aria-expanded={open}
        aria-label={open ? "关闭搜索" : "打开搜索"}
        title={open ? "关闭搜索" : "搜索"}
        hidden={open}
        onClick={focusSearchInput}
      >
        <SearchIcon />
      </button>
      <div className="shou-navbar-search-field" id="shou-navbar-search-field">
        <SearchBar handleSearchBarToggle={handleSearchBarToggle} />
      </div>
    </div>
  );
}

function NavbarContentLayout({ left, right }) {
  return (
    <div className="navbar__inner">
      <div className={clsx(ThemeClassNames.layout.navbar.containerLeft, "navbar__items")}>{left}</div>
      <div className={clsx(ThemeClassNames.layout.navbar.containerRight, "navbar__items navbar__items--right")}>
        {right}
      </div>
    </div>
  );
}

export default function NavbarContent() {
  const mobileSidebar = useNavbarMobileSidebar();
  const items = useNavbarItems();
  const [leftItems, rightItems] = splitNavbarItems(items);
  const searchBarItem = items.find((item) => item.type === "search");

  return (
    <NavbarContentLayout
      left={
        <>
          {!mobileSidebar.disabled && <NavbarMobileSidebarToggle />}
          <NavbarLogo />
          <NavbarItems items={leftItems} />
        </>
      }
      right={
        <>
          <NavbarItems items={rightItems} />
          <NavbarColorModeToggle className="shou-navbar-color-mode-toggle" />
          {!searchBarItem && <NavbarSearchControl />}
        </>
      }
    />
  );
}
