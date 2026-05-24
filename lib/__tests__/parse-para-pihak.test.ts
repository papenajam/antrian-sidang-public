import { describe, it, expect } from "vitest";
import { parseParaPihak } from "@/lib/parse-para-pihak";

describe("parseParaPihak", () => {
  it("returns {-, null} for null input", () => {
    expect(parseParaPihak(null)).toEqual({ pihak: "-", lawan: null });
  });

  it("returns {-, null} for empty string", () => {
    expect(parseParaPihak("")).toEqual({ pihak: "-", lawan: null });
  });

  it('parses "X vs Y" pattern', () => {
    expect(parseParaPihak("Ahmad Surya vs Siti Nurhaliza")).toEqual({
      pihak: "Ahmad Surya",
      lawan: "Siti Nurhaliza",
    });
  });

  it('parses "X vs. Y" pattern (with dot)', () => {
    expect(parseParaPihak("Ahmad vs. Siti")).toEqual({
      pihak: "Ahmad",
      lawan: "Siti",
    });
  });

  it('parses "X melawan Y" pattern', () => {
    expect(parseParaPihak("Budi Hartono melawan Rini Astuti")).toEqual({
      pihak: "Budi Hartono",
      lawan: "Rini Astuti",
    });
  });

  it("strips HTML tags before parsing", () => {
    expect(parseParaPihak("<p>Ahmad</p> vs <strong>Siti</strong>")).toEqual({
      pihak: "Ahmad",
      lawan: "Siti",
    });
  });

  it("returns single party when no separator", () => {
    expect(parseParaPihak("Pemohon: Rahmat Hidayat")).toEqual({
      pihak: "Pemohon: Rahmat Hidayat",
      lawan: null,
    });
  });

  it("handles em-dash separator (design data uses this)", () => {
    expect(parseParaPihak("Ahmad Surya — Siti Nurhaliza")).toEqual({
      pihak: "Ahmad Surya",
      lawan: "Siti Nurhaliza",
    });
  });
});
