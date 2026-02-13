import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders registration Form", () => {
  render(<App />);
  const form = screen.getByText(/registration Form/i);
  expect(form).toBeInTheDocument();
});
