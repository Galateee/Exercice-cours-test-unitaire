import React from "react";

const mockNavigate = jest.fn();

let locationState = null;

module.exports = {
  BrowserRouter: ({ children }) => children,
  MemoryRouter: ({ children, initialEntries }) => {
    if (initialEntries && initialEntries.length > 0 && initialEntries[0].state) {
      locationState = initialEntries[0].state;
    }
    return children;
  },
  Routes: ({ children }) => children,
  Route: ({ element, children }) => element || children || null,
  Link: ({ children, to, ...props }) => {
    return React.createElement("a", { href: to, ...props }, children);
  },
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    pathname: "/",
    search: "",
    hash: "",
    state: locationState,
  }),
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
  Outlet: () => null,
  Navigate: ({ to }) => `Navigate to ${to}`,
  __setLocationState: (state) => {
    locationState = state;
  },
  __resetLocationState: () => {
    locationState = null;
  },
};
