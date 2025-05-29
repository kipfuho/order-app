import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
    padding: 16,
  },
  baseButton: {
    minWidth: 200,
    maxWidth: "auto",
    width: "auto",
    alignSelf: "center",
    marginTop: 10,
  },
  baseGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 10,
  },
  baseFAB: {
    position: "absolute",
    right: 16,
    bottom: 16,
  },
});
