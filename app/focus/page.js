"use client";

import FocusTimer from "../components/focus/FocusTimer";

import DoctorCompanion from "../components/companion/DoctorCompanion";

export default function FocusPage() {
    return (
        <>
            <FocusTimer />
            <DoctorCompanion mood="focus" context="focus" />
        </>
    );
}
