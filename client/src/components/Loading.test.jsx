import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Loading from "./Loading";

describe("Loading Component", () => {
  it("renders the loading container", () => {
    const { container } = render(<Loading />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders three bouncing dots", () => {
    const { container } = render(<Loading />);

    const dots = container.querySelectorAll(".animate-bounce");

    expect(dots).toHaveLength(3);
  });

  it("applies animation delay to second and third dots", () => {
    const { container } = render(<Loading />);

    const dots = container.querySelectorAll(".animate-bounce");

    expect(dots[1]).toHaveStyle({
      animationDelay: "0.15s",
    });

    expect(dots[2]).toHaveStyle({
      animationDelay: "0.3s",
    });
  });

  it("uses blue background for all dots", () => {
    const { container } = render(<Loading />);

    const dots = container.querySelectorAll(".animate-bounce");

    dots.forEach((dot) => {
      expect(dot.className).toContain("bg-blue-600");
    });
  });
});