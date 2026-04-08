import React from "react";
import { View, Text } from "react-native";

type BrandLogoProps = {
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
  textColor?: string;
};

const SIZE_MAP = {
  sm: { dot: 12, gap: 8, font: 22 },
  md: { dot: 18, gap: 10, font: 34 },
  lg: { dot: 28, gap: 14, font: 52 },
} as const;

export default function BrandLogo({
  showWordmark = true,
  size = "md",
  textColor = "#050505",
}: BrandLogoProps) {
  const dims = SIZE_MAP[size];
  const dotCommon = {
    width: dims.dot,
    height: dims.dot,
    borderRadius: dims.dot / 2,
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: dims.gap }}>
        <View style={[dotCommon, { backgroundColor: "#050505" }]} />
        <View style={[dotCommon, { backgroundColor: "#050505" }]} />
        <View style={[dotCommon, { backgroundColor: "#050505" }]} />
        <View
          style={[
            dotCommon,
            {
              backgroundColor: "#ff6a00",
              shadowColor: "#ff6a00",
              shadowOpacity: 0.35,
              shadowRadius: dims.dot * 0.6,
              shadowOffset: { width: 0, height: 0 },
              elevation: 3,
            },
          ]}
        />
      </View>

      {showWordmark ? (
        <Text
          style={{
            marginLeft: dims.gap * 1.4,
            fontSize: dims.font,
            fontWeight: "900",
            letterSpacing: -1.2,
            color: textColor,
            textTransform: "lowercase",
          }}
        >
          gritor
        </Text>
      ) : null}
    </View>
  );
}
