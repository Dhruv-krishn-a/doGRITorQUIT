import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../context/ThemeContext";

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
 textColor,
}: BrandLogoProps) {
 const { colors } = useTheme();
 const dims = SIZE_MAP[size];
 const dotCommon = {
 width: dims.dot,
 height: dims.dot,
 borderRadius: dims.dot / 2,
 };

 return (
 <View style={{ flexDirection: "row", alignItems: "center" }}>
 <View style={{ flexDirection: "row", alignItems: "center", gap: dims.gap }}>
 <View style={[dotCommon, { backgroundColor: colors.textSecondary, opacity: 0.5 }]} />
 <View style={[dotCommon, { backgroundColor: colors.textSecondary, opacity: 0.5 }]} />
 <View style={[dotCommon, { backgroundColor: colors.textSecondary, opacity: 0.5 }]} />
 <View
 style={[
 dotCommon,
 {
 backgroundColor: colors.accent,
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
 color: textColor || colors.text,
 textTransform: "lowercase",
 }}
 >
 gritor
 </Text>
 ) : null}
 </View>
 );
}
