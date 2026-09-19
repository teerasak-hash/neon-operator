"use client";
import { useEffect, useState } from "react";
type Item={id:string;name:string;price:number;quantity:number;stock:number};
const KEY="fish-shop-cart";
export default function CartView(){const [items,setItems]=useState<Item[]>([]);
useEffect(()=>{setItems(JSON.parse(localStorage.getItem(KEY)||"[]"))},[]);
const save=(next:Item[])=>{setItems(next);localStorage.setItem(KEY,JSON.stringify(next))};
const change=(id:string,delta:number)=>save(items.map(i=>i.id===id?{...i,quantity:Math.max(1,Math.min(i.stock,i.quantity+delta))}:i));
const remove=(id:string)=>save(items.filter(i=>i.id!==id));
const total=items.reduce((s,i)=>s+i.price*i.quantity,0);
if(!items.length)return <div className="card"><h1>ตะกร้าว่าง</h1><a className="button" href="/">เลือกสินค้า</a></div>;
return <div className="card"><h1>ตะกร้าสินค้า</h1>{items.map(i=><div key={i.id} style={{display:"flex",justifyContent:"space-between",gap:12,padding:"12px 0",borderBottom:"1px solid #eee"}}><div><b>{i.name}</b><div>฿{i.price.toLocaleString("th-TH")} × {i.quantity}</div></div><div><button onClick={()=>change(i.id,-1)}>-</button> <b>{i.quantity}</b> <button onClick={()=>change(i.id,1)}>+</button> <button onClick={()=>remove(i.id)}>ลบ</button></div></div>)}<h2>รวม ฿{total.toLocaleString("th-TH")}</h2><a className="button" href="/checkout">ไปชำระเงิน</a></div>}
export {KEY};