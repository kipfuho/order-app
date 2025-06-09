import React, { createContext, useContext, useEffect, useState } from "react";

const TimeContext = createContext<number>(Date.now());

export const TimeProvider = ({ children }: { children: React.ReactNode }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return <TimeContext.Provider value={now}>{children}</TimeContext.Provider>;
};

export const useCurrentTime = () => useContext(TimeContext);
