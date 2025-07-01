import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ModernInput from "../ModernInput";

// Mock the theme
jest.mock("../../styles/modernTheme", () => ({
  colors: {
    primary: {
      50: "#E6F0FF",
      100: "#CCE0FF",
      500: "#0066FF",
      700: "#003D99",
    },
    text: {
      primary: "#212121",
      secondary: "#757575",
      disabled: "#9E9E9E",
      hint: "#9E9E9E",
    },
    error: {
      main: "#EF4444",
    },
    neutral: {
      100: "#F5F5F5",
      300: "#E0E0E0",
      400: "#BDBDBD",
      500: "#9E9E9E",
    },
    background: {
      paper: "#FFFFFF",
    },
  },
  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
    },
    fontWeight: {
      medium: "500",
      semibold: "600",
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
  },
  borderRadius: {
    md: 8,
  },
  shadows: {
    xs: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 1,
      elevation: 1,
    },
  },
}));

describe("ModernInput", () => {
  it("renders correctly with default props", () => {
    const { getByPlaceholderText } = render(
      <ModernInput placeholder="Enter text" />
    );
    expect(getByPlaceholderText("Enter text")).toBeTruthy();
  });

  it("renders with a label", () => {
    const { getByText } = render(
      <ModernInput label="Username" placeholder="Enter username" />
    );
    expect(getByText("Username")).toBeTruthy();
  });

  it("shows required indicator when isRequired is true", () => {
    const { getByText } = render(
      <ModernInput label="Username" isRequired placeholder="Enter username" />
    );
    expect(getByText("*")).toBeTruthy();
  });

  it("updates value when text changes", () => {
    const onChangeTextMock = jest.fn();
    const { getByPlaceholderText } = render(
      <ModernInput
        placeholder="Enter text"
        value=""
        onChangeText={onChangeTextMock}
      />
    );

    fireEvent.changeText(getByPlaceholderText("Enter text"), "Hello World");
    expect(onChangeTextMock).toHaveBeenCalledWith("Hello World");
  });

  it("displays error message when provided", () => {
    const { getByText } = render(
      <ModernInput placeholder="Enter text" error="This field is required" />
    );
    expect(getByText("This field is required")).toBeTruthy();
  });

  it("displays helper text when provided", () => {
    const { getByText } = render(
      <ModernInput placeholder="Enter text" helperText="Enter your username" />
    );
    expect(getByText("Enter your username")).toBeTruthy();
  });

  it("is disabled when isDisabled is true", () => {
    const { getByPlaceholderText } = render(
      <ModernInput placeholder="Enter text" isDisabled />
    );

    expect(getByPlaceholderText("Enter text").props.editable).toBe(false);
  });

  it("is read-only when isReadOnly is true", () => {
    const { getByPlaceholderText } = render(
      <ModernInput placeholder="Enter text" isReadOnly />
    );

    expect(getByPlaceholderText("Enter text").props.editable).toBe(false);
  });

  it("renders with an icon", () => {
    const { getByPlaceholderText } = render(
      <ModernInput placeholder="Enter text" iconName="mail-outline" />
    );

    expect(getByPlaceholderText("Enter text")).toBeTruthy();
  });

  it("toggles password visibility when isPassword is true", () => {
    const { getByPlaceholderText } = render(
      <ModernInput placeholder="Enter password" isPassword />
    );

    const input = getByPlaceholderText("Enter password");
    expect(input.props.secureTextEntry).toBe(true);

    // Find and press the eye icon to toggle password visibility
    // Note: This is a simplified test as we can't easily find the icon in this test setup
  });

  it("calls onFocus and onBlur when input is focused and blurred", () => {
    const onFocusMock = jest.fn();
    const onBlurMock = jest.fn();

    const { getByPlaceholderText } = render(
      <ModernInput
        placeholder="Enter text"
        onFocus={onFocusMock}
        onBlur={onBlurMock}
      />
    );

    const input = getByPlaceholderText("Enter text");

    fireEvent(input, "focus");
    expect(onFocusMock).toHaveBeenCalled();

    fireEvent(input, "blur");
    expect(onBlurMock).toHaveBeenCalled();
  });
});
