import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ModernButton from "../ModernButton";

// Mock the theme
jest.mock("../../styles/modernTheme", () => ({
  colors: {
    primary: {
      50: "#E6F0FF",
      100: "#CCE0FF",
      300: "#66A3FF",
      500: "#0066FF",
      600: "#0052CC",
      700: "#003D99",
    },
    secondary: {
      500: "#8000FF",
      600: "#6600CC",
    },
    accent: {
      500: "#FFB700",
      600: "#CC9200",
    },
    success: {
      main: "#10B981",
      dark: "#047857",
    },
    error: {
      main: "#EF4444",
      dark: "#B91C1C",
    },
    warning: {
      main: "#F59E0B",
      dark: "#B45309",
    },
    text: {
      white: "#FFFFFF",
      secondary: "#757575",
    },
    neutral: {
      300: "#E0E0E0",
      500: "#9E9E9E",
    },
  },
  typography: {
    fontSize: {
      sm: 14,
      md: 16,
      lg: 18,
    },
    fontWeight: {
      regular: "400",
      medium: "500",
      semibold: "600",
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
  },
  borderRadius: {
    md: 8,
  },
}));

describe("ModernButton", () => {
  it("renders correctly with default props", () => {
    const { getByText } = render(<ModernButton text="Test Button" />);
    expect(getByText("Test Button")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <ModernButton text="Test Button" onPress={onPressMock} />
    );

    fireEvent.press(getByText("Test Button"));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it("renders loading state correctly", () => {
    const { queryByText, getByTestId } = render(
      <ModernButton
        text="Test Button"
        isLoading={true}
        testID="loading-button"
      />
    );

    // Text should not be visible when loading
    expect(queryByText("Test Button")).toBeNull();

    // ActivityIndicator should be visible
    expect(getByTestId("loading-button")).toBeTruthy();
  });

  it("is disabled when isDisabled is true", () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <ModernButton
        text="Test Button"
        onPress={onPressMock}
        isDisabled={true}
      />
    );

    fireEvent.press(getByText("Test Button"));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it("renders with different variants", () => {
    const { rerender, getByText } = render(
      <ModernButton text="Solid Button" variant="solid" />
    );
    expect(getByText("Solid Button")).toBeTruthy();

    rerender(<ModernButton text="Outline Button" variant="outline" />);
    expect(getByText("Outline Button")).toBeTruthy();

    rerender(<ModernButton text="Ghost Button" variant="ghost" />);
    expect(getByText("Ghost Button")).toBeTruthy();

    rerender(<ModernButton text="Text Button" variant="text" />);
    expect(getByText("Text Button")).toBeTruthy();
  });

  it("renders with different colors", () => {
    const { rerender, getByText } = render(
      <ModernButton text="Primary Button" color="primary" />
    );
    expect(getByText("Primary Button")).toBeTruthy();

    rerender(<ModernButton text="Secondary Button" color="secondary" />);
    expect(getByText("Secondary Button")).toBeTruthy();

    rerender(<ModernButton text="Accent Button" color="accent" />);
    expect(getByText("Accent Button")).toBeTruthy();

    rerender(<ModernButton text="Success Button" color="success" />);
    expect(getByText("Success Button")).toBeTruthy();

    rerender(<ModernButton text="Error Button" color="error" />);
    expect(getByText("Error Button")).toBeTruthy();

    rerender(<ModernButton text="Warning Button" color="warning" />);
    expect(getByText("Warning Button")).toBeTruthy();
  });

  it("renders with different sizes", () => {
    const { rerender, getByText } = render(
      <ModernButton text="Small Button" size="sm" />
    );
    expect(getByText("Small Button")).toBeTruthy();

    rerender(<ModernButton text="Medium Button" size="md" />);
    expect(getByText("Medium Button")).toBeTruthy();

    rerender(<ModernButton text="Large Button" size="lg" />);
    expect(getByText("Large Button")).toBeTruthy();
  });

  it("renders with an icon", () => {
    const { getByText } = render(
      <ModernButton text="Icon Button" iconName="add" iconPosition="left" />
    );
    expect(getByText("Icon Button")).toBeTruthy();
  });
});
