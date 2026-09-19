"use client";

import { useEffect, useState } from "react";

type Product = { id: string; name: string; price: number; stock: number };
type Order = { id: string; customerName: string; phone: string; total: number; status: string; address: string };

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [login, setLogin] = useState({ username: "", password: "" });
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState("กำลังตรวจสอบเซสชัน...");

  const load = async () => {
    const [p, o] = await Promise.all([fetch("/api/products"), fetch("/api/orders")]);
    if (p.status === 401 || o.status === 401) {
      setAuthenticated(false);
      setStatus("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
      return;
    }
    if (!p.ok || !o.ok) {
      setStatus("โหลดข้อมูลไม่สำเร็จ");
      return;
    }
    setProducts(await p.json());
    setOrders(await o.json());
    setAuthenticated(true);
    setStatus("โหลดข้อมูลสำเร็จ");
  };

  useEffect(() => {
    fetch("/api/admin/session").then(r => {
      if (r.ok) load();
      else {
        setAuthenticated(false);
        setStatus("");
      }
    });
  }, []);

  const submitLogin = async () => {
    setStatus("กำลังเข้าสู่ระบบ...");
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(login),
    });
    const data = await r.json();
    if (!r.ok) {
      setStatus(data.error || "เข้าสู่ระบบไม่สำเร็จ");
      return;
    }
    setLogin({ username: "", password: "" });
    await load();
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setProducts([]);
    setOrders([]);
    setStatus("ออกจากระบบแล้ว");
  };

  const updateStock = async (id: string, stock: number) => {
    await fetch("/api/products/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock }),
    });
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/orders/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  };

  if (!authenticated) {
    return <main><div className="container"><div className="card">
      <h1>Admin Login</h1>
      <p className="muted">เข้าสู่ระบบผู้ดูแลร้าน</p>
      <input placeholder="ชื่อผู้ใช้" value={login.username} onChange={e => setLogin({ ...login, username: e.target.value })} />
      <input type="password" placeholder="รหัสผ่าน" value={login.password} onChange={e => setLogin({ ...login, password: e.target.value })} onKeyDown={e => { if (e.key === "Enter") submitLogin(); }} />
      <button className="button" onClick={submitLogin}>เข้าสู่ระบบ</button>
      <p>{status}</p>
    </div></div></main>;
  }

  return <main><div className="container">
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
      <div><h1>Admin Dashboard</h1><p>{status}</p></div>
      <button className="button" onClick={logout}>ออกจากระบบ</button>
    </div>
    <h2>สินค้า / สต็อก</h2>
    {products.map(p => <div className="card" key={p.id}>
      <b>{p.name}</b><p>ราคา ฿{Number(p.price).toLocaleString("th-TH")}</p>
      <input type="number" min="0" value={p.stock} onChange={e => updateStock(p.id, Number(e.target.value))} />
    </div>)}
    <h2>คำสั่งซื้อ</h2>
    {orders.map(o => <div className="card" key={o.id}>
      <b>{o.customerName}</b>
      <p>{o.phone} · ฿{Number(o.total).toLocaleString("th-TH")}</p>
      <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}>
        {["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"].map(s => <option key={s}>{s}</option>)}
      </select>
      <p>{o.address}</p>
    </div>)}
  </div></main>;
}
