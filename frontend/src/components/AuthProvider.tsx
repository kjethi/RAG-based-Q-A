import React, { useState, useEffect } from "react";
import { AuthContext } from "../authHook";
import type { User } from "../classes/user";
import { getCookie } from "../utils/cookiesHelper";
import { userService } from "../services/user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  const getUserDetails = async () => {
    const authenticated = getCookie("access_token");
    if (authenticated) {
      const user = await userService.getMyUser();
      setUser(user);
    }
  };
  useEffect(() => {
    getUserDetails();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
