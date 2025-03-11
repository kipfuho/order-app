import { Tabs, router } from "expo-router";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../stores/store";

export default function TabLayout() {
  const user = useSelector((state: RootState) => state.shop.user);
  const [isReady, setIsReady] = useState(false);

  // Ensure app is mounted before checking auth
  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady && _.isEmpty(user)) {
      router.replace("/login");
    }
  }, [isReady, user]);

  // Prevent UI from rendering until ready
  if (!isReady) {
    return null; // This hides everything until ready
  }

  if (_.isEmpty(user)) {
    return null; // Also hide everything while redirecting to login
  }

  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="explore" options={{ title: "Explore" }} />
    </Tabs>
  );
}
