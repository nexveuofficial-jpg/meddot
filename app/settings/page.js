"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const router = useRouter();

    useEffect(() => {
        router.push("/profile");
    }, []);

    return (
        <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", color: "white" }}>
            Redirecting to Profile...
        </div>
    );
}
