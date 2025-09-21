import { useEffect, useRef } from 'react';
import { createSwapy } from 'swapy';
import type { Swapy } from 'swapy';
const DragAndDrop = () => {
  const swapy = useRef<Swapy | null>(null);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ตรวจสอบว่า container element ถูกโหลดแล้ว
    if (container.current) {
      swapy.current = createSwapy(container.current);

      // Listener สำหรับ event การสลับตำแหน่ง
      swapy.current.onSwap((event) => {
        console.log('Items swapped:', event);
        // คุณสามารถนำ logic ตรงนี้ไปอัปเดต state ใน React ได้
        // เช่น setList(newList);
      });
    }

    // Cleanup: ทำลาย Swapy instance เมื่อ component ถูกถอดออก
    return () => {
      swapy.current?.destroy();
    };
  }, []);

  return (
    <div ref={container} className="stats-grid">
      {/* Slot 1 */}
      <div data-swapy-slot="slot-1" className="stat-card">
        <div data-swapy-item="item-A">
          <div>Item A</div>
        </div>
      </div>

      {/* Slot 2 */}
      <div data-swapy-slot="slot-2" className="stat-card">
        <div data-swapy-item="item-B">
          <div>Item B</div>
        </div>
      </div>

      {/* Slot 3 */}
      <div data-swapy-slot="slot-3" className="stat-card">
        {/* อาจจะไม่มี item ก็ได้ */}
      </div>
    </div>
  );
};

export default DragAndDrop;