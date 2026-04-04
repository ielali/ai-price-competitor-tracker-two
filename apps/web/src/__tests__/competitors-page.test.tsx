import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import CompetitorsPage from "@/app/(dashboard)/competitors/page";

describe("CompetitorsPage", () => {
  it("renders summary and table rows for mock sources", () => {
    render(<CompetitorsPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: /competitors/i }),
    ).toBeInTheDocument();

    expect(screen.getByText(/sources tracked/i)).toBeInTheDocument();
    expect(screen.getByTestId("tracked-source-count")).toHaveTextContent("4");

    expect(screen.getByText("Competitor A — Amazon")).toBeInTheDocument();
    expect(screen.getByText("Competitor B — eBay")).toBeInTheDocument();

    const healthLabels = screen.getAllByText(/healthy|degraded|critical/i);
    expect(healthLabels.length).toBeGreaterThanOrEqual(4);
  });
});
