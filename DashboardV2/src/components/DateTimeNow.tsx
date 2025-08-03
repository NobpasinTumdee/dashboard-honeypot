import { useEffect, useState } from "react";

const DateTimeNow = () => {
    const [currentTime, setCurrentTime] = useState<string>("");

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const formatted = now.toLocaleString("th-TH", {
                dateStyle: "full",
                timeStyle: "medium",
            });
            setCurrentTime(formatted);
        };

        updateTime(); // อัปเดตตอนโหลดครั้งแรก
        const interval = setInterval(updateTime, 1000); // อัปเดตทุกวินาที

        return () => clearInterval(interval); // เคลียร์ interval ตอน unmount
    }, []);

    return (
        <>
            <p style={{ textAlign: "center", fontWeight: "300" }}>
                เวลาปัจจุบัน: {currentTime}
            </p>
        </>
    );
};

export default DateTimeNow;
