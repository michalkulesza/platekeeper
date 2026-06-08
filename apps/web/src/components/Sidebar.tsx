import { useState } from "react";
import { NavLink } from "react-router-dom";
import HouseholdSwitcher from "./HouseholdSwitcher";
import { useHousehold } from "../context/HouseholdContext";

function BookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

const navItem = (isActive: boolean) =>
  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive ? "bg-primary/10 text-primary" : "text-default-600 hover:bg-default-100"
  }`;

export default function Sidebar() {
  const { activeHousehold } = useHousehold();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const bandColor = activeHousehold?.color ?? null;

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 sticky top-0 h-screen py-6 px-4">
      <div className="px-2 mb-6">
        <span className="text-xl font-bold">PlateKeeper</span>
      </div>

      <button
        type="button"
        onClick={() => setSwitcherOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-default-100 transition-colors mb-4 text-left w-full"
      >
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={bandColor ? { backgroundColor: bandColor } : { border: "1.5px solid currentColor", display: "inline-block" }}
        />
        <span
          className="text-xs font-semibold uppercase tracking-wide truncate"
          style={{ color: bandColor ?? undefined }}
        >
          {activeHousehold ? activeHousehold.name : "Personal Library"}
        </span>
        <svg className="w-3 h-3 shrink-0 opacity-60 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <nav className="flex flex-col gap-1">
        <NavLink to="/" end className={({ isActive }) => navItem(isActive)}>
          <BookIcon />
          Recipes
        </NavLink>
        <NavLink to="/plan" className={({ isActive }) => navItem(isActive)}>
          <CalendarIcon />
          Meal Plan
        </NavLink>
        <NavLink to="/shopping" className={({ isActive }) => navItem(isActive)}>
          <CartIcon />
          Shopping
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => navItem(isActive)}>
          <GearIcon />
          Settings
        </NavLink>
      </nav>

      <HouseholdSwitcher isOpen={switcherOpen} onClose={() => setSwitcherOpen(false)} />
    </aside>
  );
}
