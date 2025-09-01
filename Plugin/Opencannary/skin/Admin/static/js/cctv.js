// ฟังก์ชันหลักที่ใช้โหลดข้อมูลกล้องและสร้าง UI
async function loadCameras() {
    try {
        // โหลดข้อมูลจากไฟล์ JSON
        const res = await fetch('/static/json/cameras.json');
        const data = await res.json();

        // --------- ส่วนที่ 1: แสดงสรุปสถานะของกล้อง ---------
        // ดึง element ที่มี id เป็น 'status-summary'
        const summary = document.getElementById('status-summary');
        // กำหนด innerHTML เพื่อแสดงจำนวนกล้องออนไลน์, ออฟไลน์, และกำลังบันทึก
        summary.innerHTML = `
            <span class="status-badge online">ออนไลน์: ${data.summary.online}</span>
            <span class="status-badge offline">ออฟไลน์: ${data.summary.offline}</span>
            <span class="status-badge recording">กำลังบันทึก: ${data.summary.recording}</span>
        `;

        // --------- ส่วนที่ 2: แสดงกล้องแต่ละตัวใน grid ---------
        // ดึง element ที่มี id เป็น 'video-grid'
        const grid = document.getElementById('video-grid');
        // ล้างเนื้อหาเก่าออกก่อน
        grid.innerHTML = "";

        // วนลูปเพื่อสร้าง card สำหรับกล้องแต่ละตัวจากข้อมูล JSON
        data.cameras.forEach(cam => {
            let card = document.createElement('div');
            // กำหนด class ของ card โดยตรวจสอบสถานะของกล้อง
            card.className = "video-card" + (cam.status === "offline" ? " offline" : "");

            // ใส่เนื้อหา HTML ภายใน card
            card.innerHTML = `
                <div class="video-header">
                    <span class="cam-name">${cam.name}</span>
                    <div class="header-right">
                        <span class="quality-tag">${cam.quality}</span>
                        <span class="status-dot ${cam.status}"></span>
                    </div>
                </div>
                <div class="video-player">
                    ${
                        // ใช้ ternary operator เพื่อตรวจสอบสถานะของกล้อง
                        cam.status === "offline"
                        ? `
                            <div class="offline-overlay">
                                <i class="fas fa-exclamation-triangle"></i>
                                <p>กล้องออฟไลน์</p>
                            </div>
                        `
                        : `
                            <div class="live-status"><i class="fas fa-circle"></i> LIVE</div>
                            <div class="timestamp">${new Date().toLocaleTimeString()}</div>
                            ${cam.recording ? `<div class="rec-status"><i class="fas fa-circle"></i> REC</div>` : ""}
                            <video poster="${cam.poster}" controls></video>
                        `
                    }
                </div>
            `;
            grid.appendChild(card);

            // เพิ่ม event listener เมื่อคลิกที่ส่วนของวิดีโอ
            const videoPlayer = card.querySelector('.video-player');
            if (videoPlayer) {
                videoPlayer.addEventListener('click', () => {
                    // เปลี่ยนหน้าไปยังหน้า Hikvision ทันที
                    window.location.href = '../hikvision.html';
                });
            }
        });

        // --------- ส่วนที่ 3: สร้างการ์ด "เพิ่มกล้อง" ---------
        let addCard = document.createElement('div');
        addCard.className = "video-card add-camera";
        addCard.innerHTML = `
            <div class="add-card-content">
                <div class="icon-placeholder"><i class="fas fa-plus-circle"></i></div>
                <p class="add-text">เพิ่มกล้องใหม่</p>
            </div>
        `;
        grid.appendChild(addCard);

        // เพิ่ม event listener เมื่อคลิกที่การ์ด "เพิ่มกล้อง"
        addCard.addEventListener('click', () => {
            // เปลี่ยนหน้าไปยังหน้า Hikvision ทันที
            window.location.href = '../hikvision.html';
        });

    } catch (err) {
        // จัดการข้อผิดพลาดหากโหลดข้อมูลไม่สำเร็จ
        console.error("โหลดข้อมูลกล้องไม่สำเร็จ:", err);
    }
}

// เรียกใช้งานฟังก์ชัน loadCameras เมื่อหน้าเว็บโหลดเสร็จสมบูรณ์
document.addEventListener("DOMContentLoaded", loadCameras);